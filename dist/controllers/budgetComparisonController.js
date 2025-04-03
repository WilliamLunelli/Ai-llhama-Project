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
exports.handleBudgetComparison = handleBudgetComparison;
const aiService = __importStar(require("../services/aiService"));
/**
 * Controller para comparar dois orçamentos e analisar qual é melhor
 */
function handleBudgetComparison(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { budget1, budget2 } = req.body;
            if (!budget1 || !budget2) {
                res
                    .status(400)
                    .json({ error: "Dois orçamentos são necessários para comparação" });
                return;
            }
            // Define um prompt de sistema específico para comparação de orçamentos
            const systemPrompt = `
      Você é um especialista em análise e comparação de orçamentos.
      
      Sua tarefa é comparar dois orçamentos diferentes e determinar qual oferece a melhor opção para 
      o cliente, considerando:
      
      1. Preço total (qual orçamento é mais barato no geral)
      2. Preço por item (identificar itens específicos mais baratos em cada orçamento)
      3. Completude (verificar se algum orçamento está faltando produtos presentes no outro)
      4. Qualidade da oferta (condições de pagamento, prazos, garantias, etc.)
      5. Relação custo-benefício geral
      
      Forneça uma análise detalhada mas direta, identificando claramente:
      - Qual orçamento tem o menor preço total
      - Quais itens estão faltando em cada orçamento, se houver
      - Quais itens são significativamente mais baratos em cada orçamento
      - Sua recomendação final sobre qual orçamento escolher e por quê
      
      Use linguagem clara e objetiva, focando nos fatos e números. Apresente os valores em reais (R$) 
      quando aplicável.
    `;
            // Cria o prompt para a análise comparativa
            const prompt = `
      Por favor, compare os seguintes orçamentos e me diga qual é a melhor opção de compra,
      destacando as diferenças de preço, produtos que estão faltando em cada um, e qual oferece
      o melhor custo-benefício geral:
      
      ORÇAMENTO 1:
      ${JSON.stringify(budget1, null, 2)}
      
      ORÇAMENTO 2:
      ${JSON.stringify(budget2, null, 2)}
      
      Por favor, forneça sua análise em seções claras e termine com uma recomendação específica.
    `;
            const analysisResult = yield aiService.queryModel(prompt, {
                systemPrompt,
                temperature: 0.3,
                maxTokens: 2000,
            });
            res.json({ response: analysisResult });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            res.status(500).json({ error: errorMessage });
        }
    });
}
