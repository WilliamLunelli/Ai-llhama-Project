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
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareBudgets = compareBudgets;
// src/services/budgetComparisonService.ts
const aiService_1 = require("./aiService");
/**
 * Serviço especializado para comparação de orçamentos
 */
function compareBudgets(budget1_1, budget2_1) {
    return __awaiter(this, arguments, void 0, function* (budget1, budget2, options = {}) {
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
        // Mescla as opções fornecidas com o prompt de sistema padrão
        const mergedOptions = Object.assign(Object.assign({}, options), { systemPrompt: options.systemPrompt || systemPrompt, temperature: options.temperature || 0.3, maxTokens: options.maxTokens || 2000 });
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
        // Utiliza o serviço de IA existente
        return yield (0, aiService_1.queryModel)(prompt, mergedOptions);
    });
}
