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
// src/services/pdfService.ts
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Serviço para processamento de arquivos PDF
 */
function extractTextFromPDF(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ler o arquivo do disco
            const dataBuffer = yield fs_extra_1.default.readFile(filePath);
            // Extrair o texto usando pdf-parse
            const pdfData = yield (0, pdf_parse_1.default)(dataBuffer);
            // Retornar o texto extraído
            return pdfData.text;
        }
        catch (error) {
            console.error("Erro ao extrair texto do PDF:", error);
            throw new Error("Falha ao processar o arquivo PDF");
        }
    });
}
/**
 * Verifica se um texto contém dados de orçamento e tenta extrair um objeto JSON
 */
function extractBudgetDataFromText(text) {
    try {
        // Tentativa de encontrar dados JSON no texto
        const jsonMatches = text.match(/\{[\s\S]*\}/g);
        if (jsonMatches && jsonMatches.length > 0) {
            // Tentar parsear o primeiro match como JSON
            return JSON.parse(jsonMatches[0]);
        }
        // Se não encontrou JSON, retornar null
        return null;
    }
    catch (error) {
        console.error("Erro ao extrair dados de orçamento do texto:", error);
        return null;
    }
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
