// src/controllers/budgetComparisonController.ts
import { Request, Response } from "express";
import * as aiService from "../services/aiService";
import { ApiResponse, ErrorResponse } from "../types";

/**
 * Controller para comparar dois orçamentos e analisar qual é melhor
 */
export async function handleBudgetComparison(
  req: Request<{}, {}, { budget1: any; budget2: any }>,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
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

    const analysisResult = await aiService.queryModel(prompt, {
      systemPrompt,
      temperature: 0.3,
      maxTokens: 2000,
    });

    res.json({ response: analysisResult });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: errorMessage });
  }
}
