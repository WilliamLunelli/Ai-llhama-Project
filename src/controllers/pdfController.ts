// src/controllers/pdfController.ts
import { Request, Response } from "express";
import * as pdfService from "../services/pdfService";
import * as aiService from "../services/aiService";
import path from "path";

/**
 * Controller para lidar com uploads de PDF e processamento
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
    console.log(
      `Arquivo recebido: ${req.file.originalname}, salvo em: ${filePath}`
    );

    // Extrair texto do PDF
    const extractedText = await pdfService.extractTextFromPDF(filePath);

    // Tenta extrair dados de orçamento do texto
    const budgetData = pdfService.extractBudgetDataFromText(extractedText);

    // Se encontrou dados estruturados, envia para análise
    if (budgetData) {
      const systemPrompt = `
        Você é um analista financeiro especializado em otimização de orçamentos.
        Analise os dados do orçamento extraído de um PDF e ofereça recomendações específicas em:
        
        1. Análise da estrutura de preços e margens
        2. Sugestões para aumentar o valor percebido
        3. Identificação de oportunidades de upsell/cross-sell
        4. Recomendações para aumentar a chance de aprovação
        
        Use exemplos específicos do orçamento fornecido e dados concretos.
      `;

      const prompt = `
        Por favor, analise este orçamento extraído de um arquivo PDF e forneça recomendações:
        
        ${JSON.stringify(budgetData, null, 2)}
        
        Estruture sua análise em tópicos claros.
      `;

      const response = await aiService.queryModel(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1500,
      });

      res.json({
        success: true,
        isStructuredData: true,
        extractedText:
          extractedText.substring(0, 1000) +
          (extractedText.length > 1000 ? "..." : ""),
        analysis: response,
      });
    } else {
      // Se não encontrou dados estruturados, realiza análise do texto completo
      const systemPrompt = `
        Você é um especialista em orçamentos e propostas comerciais.
        Foi fornecido a você um texto extraído de um PDF que pode conter um orçamento ou proposta.
        Analise o conteúdo e tente identificar:
        
        1. Se este documento contém de fato um orçamento ou proposta comercial
        2. Quais são os principais itens, serviços ou produtos listados
        3. Quais são os valores e preços mencionados
        4. Quaisquer condições importantes como prazos, garantias ou formas de pagamento
        
        Estruture sua resposta de forma clara e objetiva, informando o que encontrou.
        Se este não parecer ser um documento de orçamento, informe isso ao usuário.
      `;

      const prompt = `
        Por favor, analise o seguinte texto extraído de um arquivo PDF e verifique se contém dados
        de orçamento ou proposta comercial. Se sim, extraia as informações relevantes:
        
        ${extractedText.substring(0, 4000)}${
        extractedText.length > 4000 ? "..." : ""
      }
      `;

      const response = await aiService.queryModel(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 1500,
      });

      res.json({
        success: true,
        isStructuredData: false,
        extractedText:
          extractedText.substring(0, 1000) +
          (extractedText.length > 1000 ? "..." : ""),
        analysis: response,
      });
    }

    // Remover o arquivo após processamento
    await pdfService.removeFile(filePath);
  } catch (error) {
    console.error("Erro ao processar PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: errorMessage, success: false });

    // Tenta remover o arquivo em caso de erro, se ele existir
    if (req.file && req.file.path) {
      await pdfService.removeFile(req.file.path);
    }
  }
}

/**
 * Controller para comparar dois PDFs de orçamentos
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
      res
        .status(400)
        .json({ error: "Dois arquivos PDF são necessários para comparação" });
      return;
    }

    const pdf1Path = req.files.pdf1[0].path;
    const pdf2Path = req.files.pdf2[0].path;

    // Extrair texto dos PDFs
    const text1 = await pdfService.extractTextFromPDF(pdf1Path);
    const text2 = await pdfService.extractTextFromPDF(pdf2Path);

    // Enviar os textos para análise
    const systemPrompt = `
      Você é um especialista em análise e comparação de orçamentos.
      
      Sua tarefa é comparar dois documentos de orçamento diferentes e determinar qual oferece 
      a melhor opção para o cliente, considerando:
      
      1. Preço total (qual orçamento é mais barato no geral)
      2. Preço por item (identificar itens específicos mais baratos em cada orçamento)
      3. Completude (verificar se algum orçamento está faltando produtos presentes no outro)
      4. Qualidade da oferta (condições de pagamento, prazos, garantias, etc.)
      
      Forneça uma análise detalhada identificando claramente:
      - Qual orçamento parece ter o menor preço total
      - Quais itens estão faltando em cada orçamento, se houver
      - Sua recomendação final sobre qual orçamento escolher e por quê
    `;

    const prompt = `
      Por favor, compare os seguintes orçamentos extraídos de arquivos PDF e me diga qual é a melhor
      opção, destacando as diferenças de preço e condições de oferta:
      
      ORÇAMENTO 1:
      ${text1.substring(0, 3000)}${text1.length > 3000 ? "..." : ""}
      
      ORÇAMENTO 2:
      ${text2.substring(0, 3000)}${text2.length > 3000 ? "..." : ""}
    `;

    const comparisonResult = await aiService.queryModel(prompt, {
      systemPrompt,
      temperature: 0.3,
      maxTokens: 2000,
    });

    res.json({
      success: true,
      comparison: comparisonResult,
      extractedText1:
        text1.substring(0, 500) + (text1.length > 500 ? "..." : ""),
      extractedText2:
        text2.substring(0, 500) + (text2.length > 500 ? "..." : ""),
    });

    // Remover os arquivos após processamento
    await pdfService.removeFile(pdf1Path);
    await pdfService.removeFile(pdf2Path);
  } catch (error) {
    console.error("Erro ao comparar PDFs:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: errorMessage, success: false });

    // Remover arquivos em caso de erro
    if (req.files && !Array.isArray(req.files)) {
      if (req.files.pdf1 && req.files.pdf1[0])
        await pdfService.removeFile(req.files.pdf1[0].path);
      if (req.files.pdf2 && req.files.pdf2[0])
        await pdfService.removeFile(req.files.pdf2[0].path);
    }
  }
}
