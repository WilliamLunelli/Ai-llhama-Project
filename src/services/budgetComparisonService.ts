// src/services/budgetComparisonService.ts
import { queryModel } from "./aiService";
import { ModelOptions } from "../types";

/**
 * Serviço especializado para comparação de orçamentos
 */
export async function compareBudgets(
  budget1: any,
  budget2: any,
  options: ModelOptions = {}
): Promise<string> {
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
  const mergedOptions = {
    ...options,
    systemPrompt: options.systemPrompt || systemPrompt,
    temperature: options.temperature || 0.3, // Temperatura baixa para análises precisas
    maxTokens: options.maxTokens || 2000, // Aumentar tokens para comparações detalhadas
  };

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
  return await queryModel(prompt, mergedOptions);
}
