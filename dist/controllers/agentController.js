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
exports.handleGeneralQuery = handleGeneralQuery;
exports.handleCustomerSupport = handleCustomerSupport;
exports.handleBudgetAnalysis = handleBudgetAnalysis;
const aiService = __importStar(require("../services/aiService"));
function handleGeneralQuery(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { prompt, options } = req.body;
            if (!prompt) {
                res.status(400).json({ error: "Prompt é obrigatório" });
                return;
            }
            const response = yield aiService.queryModel(prompt, options);
            res.json({ response });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            res.status(500).json({ error: errorMessage });
        }
    });
}
function handleCustomerSupport(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { query } = req.body;
            if (!query) {
                res.status(400).json({ error: "Query é obrigatória" });
                return;
            }
            const systemPrompt = `
      Você é um agente de suporte ao cliente especializado em orçamentos e propostas comerciais. 
      Responda de forma clara, profissional e amigável.
      Seu objetivo é ajudar os usuários a entenderem como usar melhor o sistema de orçamentos,
      explicar boas práticas para criação de orçamentos eficazes e resolver quaisquer dúvidas
      sobre preços, margens, condições de pagamento e outras questões relacionadas.
      Se não souber a resposta, sugira que o cliente entre em contato com um atendente humano.
    `;
            const response = yield aiService.queryModel(query, { systemPrompt });
            res.json({ response });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            res.status(500).json({ error: errorMessage });
        }
    });
}
function handleBudgetAnalysis(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { budgetData } = req.body;
            if (!budgetData) {
                res.status(400).json({ error: "Dados do orçamento são obrigatórios" });
                return;
            }
            const systemPrompt = `
      Você é um analista financeiro especializado em otimização de orçamentos.
      Analise os dados do orçamento fornecido e ofereça recomendações específicas em:
      
      1. Análise da estrutura de preços e margens
      2. Sugestões para aumentar o valor percebido
      3. Identificação de oportunidades de upsell/cross-sell
      4. Recomendações para aumentar a chance de aprovação
      5. Possíveis pontos problemáticos que precisam de atenção
      
      Use exemplos específicos do orçamento fornecido e dados concretos.
    `;
            const prompt = `
      Por favor, analise este orçamento e forneça recomendações detalhadas de melhoria:
      
      ${JSON.stringify(budgetData, null, 2)}
      
      Estruture sua análise em tópicos claros.
    `;
            const response = yield aiService.queryModel(prompt, {
                systemPrompt,
                temperature: 0.4,
                maxTokens: 1500,
            });
            res.json({ response });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            res.status(500).json({ error: errorMessage });
        }
    });
}
