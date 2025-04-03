// src/services/pdfService.ts
import fs from "fs-extra";
import path from "path";
import pdfParse from "pdf-parse";

/**
 * Serviço para processamento de arquivos PDF
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Ler o arquivo do disco
    const dataBuffer = await fs.readFile(filePath);

    // Extrair o texto usando pdf-parse
    const pdfData = await pdfParse(dataBuffer);

    // Retornar o texto extraído
    return pdfData.text;
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    throw new Error("Falha ao processar o arquivo PDF");
  }
}

/**
 * Verifica se um texto contém dados de orçamento e tenta extrair um objeto JSON
 */
export function extractBudgetDataFromText(text: string): any | null {
  try {
    // Tentativa de encontrar dados JSON no texto
    const jsonMatches = text.match(/\{[\s\S]*\}/g);

    if (jsonMatches && jsonMatches.length > 0) {
      // Tentar parsear o primeiro match como JSON
      return JSON.parse(jsonMatches[0]);
    }

    // Se não encontrou JSON, retornar null
    return null;
  } catch (error) {
    console.error("Erro ao extrair dados de orçamento do texto:", error);
    return null;
  }
}

/**
 * Cria o diretório de uploads se não existir
 */
export async function ensureUploadsDirectory(): Promise<void> {
  const uploadDir = path.join(__dirname, "../../uploads");
  await fs.ensureDir(uploadDir);
  return;
}

/**
 * Remove um arquivo temporário
 */
export async function removeFile(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error("Erro ao remover arquivo:", error);
  }
}
