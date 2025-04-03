// src/controllers/pdfController.ts
import { Request, Response } from "express";
import * as pdfService from "../services/pdfService";
import * as aiService from "../services/aiService";

/**
 * Método privado para criar prompt unificado
 */
function createUnifiedPrompt(
  extractedText: string,
  analysisType: "single" | "comparison" = "single"
): { systemPrompt: string; prompt: string } {
  if (analysisType === "single") {
    return {
      systemPrompt: `
        Você é um analista especializado em documentos comerciais.
        Sua tarefa é analisar detalhadamente o documento fornecido, 
        extraindo informações cruciais e fornecendo insights práticos.
      `,
      prompt: `
        Analise detalhadamente o seguinte documento:

        ${extractedText.substring(0, 5000)}${
        extractedText.length > 5000 ? "..." : ""
      }

        Forneça uma análise estruturada abordando:
        1. Tipo de documento
        2. Principais informações
        3. Pontos relevantes para tomada de decisão
        4. Qualquer observação importante
      `,
    };
  }

  // Lógica para comparação
  return {
    systemPrompt: `
      Você é um especialista em análise comparativa de documentos comerciais.
      Compare dois documentos, identificando diferenças, semelhanças e pontos críticos.
    `,
    prompt: `
      Compare os dois documentos fornecidos:

      DOCUMENTO 1:
      ${extractedText.split("DOCUMENTO 2:")[0].substring(0, 5000)}

      DOCUMENTO 2:
      ${extractedText.split("DOCUMENTO 2:")[1].substring(0, 5000)}

      Análise detalhada:
      1. Comparação estrutural
      2. Diferenças de conteúdo
      3. Pontos fortes e fracos de cada documento
      4. Recomendação final
    `,
  };
}

/**
 * Controller para upload e análise de PDF único
 */
export async function handlePdfUpload(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Nenhum arquivo foi enviado" });
      return;
    }

    const filePath = req.file.path;

    // Extrair texto do PDF
    const extractedText = await pdfService.extractTextFromPDF(filePath);

    // Preparar prompt unificado
    const { systemPrompt, prompt } = createUnifiedPrompt(extractedText);

    // Única chamada para IA
    const analysis = await aiService.queryModel(prompt, {
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1500,
    });

    // Tentar extrair dados estruturados
    const budgetData = pdfService.extractBudgetDataFromText(extractedText);

    // Resposta
    res.json({
      success: true,
      isStructuredData: !!budgetData,
      extractedText:
        extractedText.substring(0, 1000) +
        (extractedText.length > 1000 ? "..." : ""),
      analysis,
      structuredData: budgetData,
    });

    // Remover arquivo
    await pdfService.removeFile(filePath);
  } catch (error) {
    console.error("Erro ao processar PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    res.status(500).json({
      error: errorMessage,
      success: false,
    });

    // Remover arquivo em caso de erro
    if (req.file?.path) {
      await pdfService.removeFile(req.file.path);
    }
  }
}

/**
 * Controller para comparação de dois PDFs
 */
export async function handlePdfComparison(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (
      !req.files ||
      Array.isArray(req.files) ||
      !req.files.pdf1 ||
      !req.files.pdf2
    ) {
      res.status(400).json({
        error: "Dois arquivos PDF são necessários para comparação",
      });
      return;
    }

    const pdf1Path = req.files.pdf1[0].path;
    const pdf2Path = req.files.pdf2[0].path;

    // Extrair texto dos PDFs
    const text1 = await pdfService.extractTextFromPDF(pdf1Path);
    const text2 = await pdfService.extractTextFromPDF(pdf2Path);

    // Texto combinado para comparação
    const combinedText = `DOCUMENTO 1:\n${text1}\n\nDOCUMENTO 2:\n${text2}`;

    // Preparar prompt unificado para comparação
    const { systemPrompt, prompt } = createUnifiedPrompt(
      combinedText,
      "comparison"
    );

    // Única chamada para IA
    const comparisonResult = await aiService.queryModel(prompt, {
      systemPrompt,
      temperature: 0.3,
      maxTokens: 2000,
    });

    // Resposta
    res.json({
      success: true,
      comparison: comparisonResult,
      extractedText1:
        text1.substring(0, 500) + (text1.length > 500 ? "..." : ""),
      extractedText2:
        text2.substring(0, 500) + (text2.length > 500 ? "..." : ""),
    });

    // Remover arquivos
    await Promise.all([
      pdfService.removeFile(pdf1Path),
      pdfService.removeFile(pdf2Path),
    ]);
  } catch (error) {
    console.error("Erro ao comparar PDFs:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    res.status(500).json({
      error: errorMessage,
      success: false,
    });

    // Remover arquivos em caso de erro
    if (req.files && !Array.isArray(req.files)) {
      if (req.files.pdf1 && req.files.pdf1[0])
        await pdfService.removeFile(req.files.pdf1[0].path);
      if (req.files.pdf2 && req.files.pdf2[0])
        await pdfService.removeFile(req.files.pdf2[0].path);
    }
  }
}
