import fs from "fs-extra";
import path from "path";
import pdfParse from "pdf-parse";

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Ler o arquivo do disco com opções mais robustas
    const dataBuffer = await fs.readFile(filePath);

    // Configurações avançadas de parse
    const options = {
      pagerender: (pageData: any) => {
        let renderText = "";
        const textContent = pageData.getTextContent();

        return textContent.then((textItems: any) => {
          textItems.items.forEach((textItem: any) => {
            renderText += textItem.str + " ";
          });
          return renderText;
        });
      },
      max: 10000, // Limitar número de páginas para processamento
    };

    // Extrair o texto usando pdf-parse com opções avançadas
    const pdfData = await pdfParse(dataBuffer, options);

    // Normalizar e limpar o texto extraído
    const cleanedText = normalizeExtractedText(pdfData.text);

    return cleanedText;
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    throw new Error("Falha ao processar o arquivo PDF");
  }
}

function normalizeExtractedText(text: string): string {
  // Remove excesso de espaços em branco
  text = text.replace(/\s+/g, " ").trim();

  // Remove caracteres não imprimíveis
  text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  // Normaliza quebras de linha
  text = text.replace(/\n{3,}/g, "\n\n");

  return text;
}

export function extractBudgetDataFromText(text: string): any | null {
  try {
    // Expandir estratégias de extração de JSON
    const jsonMatches = [
      // Tenta encontrar JSON entre chaves
      ...(text.match(/\{[\s\S]*?\}/g) || []),

      // Tenta encontrar blocos de texto que pareçam JSON
      ...(text.match(/[\[\{].*?[\}\]]/g) || []),
    ];

    for (const match of jsonMatches) {
      try {
        // Tenta parsear cada match
        const parsed = JSON.parse(match);

        // Verifica se o JSON tem estrutura de orçamento
        if (isValidBudgetStructure(parsed)) {
          return parsed;
        }
      } catch {}
    }

    return null;
  } catch (error) {
    console.error("Erro ao extrair dados de orçamento do texto:", error);
    return null;
  }
}

function isValidBudgetStructure(data: any): boolean {
  // Critérios para validar se o JSON parece ser um orçamento
  if (typeof data !== "object" || data === null) return false;

  const possibleBudgetKeys = [
    "items",
    "total",
    "cliente",
    "data",
    "products",
    "price",
    "quantidade",
    "valor_total",
    "valor_unitario",
  ];

  return possibleBudgetKeys.some((key) => key in data);
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
