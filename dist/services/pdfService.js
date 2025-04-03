"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = extractTextFromPDF;
exports.extractBudgetDataFromText = extractBudgetDataFromText;
exports.ensureUploadsDirectory = ensureUploadsDirectory;
exports.removeFile = removeFile;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
function extractTextFromPDF(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ler o arquivo do disco com opções mais robustas
            const dataBuffer = yield fs_extra_1.default.readFile(filePath);
            // Configurações avançadas de parse
            const options = {
                pagerender: (pageData) => {
                    let renderText = "";
                    const textContent = pageData.getTextContent();
                    return textContent.then((textItems) => {
                        textItems.items.forEach((textItem) => {
                            renderText += textItem.str + " ";
                        });
                        return renderText;
                    });
                },
                max: 10000, // Limitar número de páginas para processamento
            };
            // Extrair o texto usando pdf-parse com opções avançadas
            const pdfData = yield (0, pdf_parse_1.default)(dataBuffer, options);
            // Normalizar e limpar o texto extraído
            const cleanedText = normalizeExtractedText(pdfData.text);
            return cleanedText;
        }
        catch (error) {
            console.error("Erro ao extrair texto do PDF:", error);
            throw new Error("Falha ao processar o arquivo PDF");
        }
    });
}
function normalizeExtractedText(text) {
    // Remove excesso de espaços em branco
    text = text.replace(/\s+/g, " ").trim();
    // Remove caracteres não imprimíveis
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    // Normaliza quebras de linha
    text = text.replace(/\n{3,}/g, "\n\n");
    return text;
}
function extractBudgetDataFromText(text) {
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
            }
            catch (_a) { }
        }
        return null;
    }
    catch (error) {
        console.error("Erro ao extrair dados de orçamento do texto:", error);
        return null;
    }
}
function isValidBudgetStructure(data) {
    // Critérios para validar se o JSON parece ser um orçamento
    if (typeof data !== "object" || data === null)
        return false;
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
function ensureUploadsDirectory() {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadDir = path_1.default.join(__dirname, "../../uploads");
        yield fs_extra_1.default.ensureDir(uploadDir);
        return;
    });
}
/**
 * Remove um arquivo temporário
 */
function removeFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_extra_1.default.remove(filePath);
        }
        catch (error) {
            console.error("Erro ao remover arquivo:", error);
        }
    });
}
