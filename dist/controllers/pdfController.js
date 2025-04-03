"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePdfUpload = handlePdfUpload;
exports.handlePdfComparison = handlePdfComparison;
const pdfService = __importStar(require("../services/pdfService"));
const aiService = __importStar(require("../services/aiService"));
/**
 * Método privado para criar prompt unificado
 */
function createUnifiedPrompt(extractedText, analysisType = "single") {
    if (analysisType === "single") {
        return {
            systemPrompt: `
        Você é um analista especializado em documentos comerciais.
        Sua tarefa é analisar detalhadamente o documento fornecido, 
        extraindo informações cruciais e fornecendo insights práticos.
      `,
            prompt: `
        Analise detalhadamente o seguinte documento:

        ${extractedText.substring(0, 5000)}${extractedText.length > 5000 ? "..." : ""}

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
function handlePdfUpload(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (!req.file) {
                res.status(400).json({ error: "Nenhum arquivo foi enviado" });
                return;
            }
            const filePath = req.file.path;
            // Extrair texto do PDF
            const extractedText = yield pdfService.extractTextFromPDF(filePath);
            // Preparar prompt unificado
            const { systemPrompt, prompt } = createUnifiedPrompt(extractedText);
            // Única chamada para IA
            const analysis = yield aiService.queryModel(prompt, {
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
                extractedText: extractedText.substring(0, 1000) +
                    (extractedText.length > 1000 ? "..." : ""),
                analysis,
                structuredData: budgetData,
            });
            // Remover arquivo
            yield pdfService.removeFile(filePath);
        }
        catch (error) {
            console.error("Erro ao processar PDF:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            res.status(500).json({
                error: errorMessage,
                success: false,
            });
            // Remover arquivo em caso de erro
            if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
                yield pdfService.removeFile(req.file.path);
            }
        }
    });
}
/**
 * Controller para comparação de dois PDFs
 */
function handlePdfComparison(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.files ||
                Array.isArray(req.files) ||
                !req.files.pdf1 ||
                !req.files.pdf2) {
                res.status(400).json({
                    error: "Dois arquivos PDF são necessários para comparação",
                });
                return;
            }
            const pdf1Path = req.files.pdf1[0].path;
            const pdf2Path = req.files.pdf2[0].path;
            // Extrair texto dos PDFs
            const text1 = yield pdfService.extractTextFromPDF(pdf1Path);
            const text2 = yield pdfService.extractTextFromPDF(pdf2Path);
            // Texto combinado para comparação
            const combinedText = `DOCUMENTO 1:\n${text1}\n\nDOCUMENTO 2:\n${text2}`;
            // Preparar prompt unificado para comparação
            const { systemPrompt, prompt } = createUnifiedPrompt(combinedText, "comparison");
            // Única chamada para IA
            const comparisonResult = yield aiService.queryModel(prompt, {
                systemPrompt,
                temperature: 0.3,
                maxTokens: 2000,
            });
            // Resposta
            res.json({
                success: true,
                comparison: comparisonResult,
                extractedText1: text1.substring(0, 500) + (text1.length > 500 ? "..." : ""),
                extractedText2: text2.substring(0, 500) + (text2.length > 500 ? "..." : ""),
            });
            // Remover arquivos
            yield Promise.all([
                pdfService.removeFile(pdf1Path),
                pdfService.removeFile(pdf2Path),
            ]);
        }
        catch (error) {
            console.error("Erro ao comparar PDFs:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            res.status(500).json({
                error: errorMessage,
                success: false,
            });
            // Remover arquivos em caso de erro
            if (req.files && !Array.isArray(req.files)) {
                if (req.files.pdf1 && req.files.pdf1[0])
                    yield pdfService.removeFile(req.files.pdf1[0].path);
                if (req.files.pdf2 && req.files.pdf2[0])
                    yield pdfService.removeFile(req.files.pdf2[0].path);
            }
        }
    });
}
