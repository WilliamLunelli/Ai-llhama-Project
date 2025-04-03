// src/controllers/agentController.ts
import { Request, Response } from "express";
import * as aiService from "../services/aiService";
import {
  GeneralQueryRequest,
  CustomerSupportRequest,
  ApiResponse,
  ErrorResponse,
} from "../types";

export async function handleGeneralQuery(
  req: Request<{}, {}, GeneralQueryRequest>,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
  try {
    const { prompt, options } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt é obrigatório" });
      return;
    }

    const response = await aiService.queryModel(prompt, options);
    res.json({ response });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: errorMessage });
  }
}

export async function handleCustomerSupport(
  req: Request<{}, {}, CustomerSupportRequest>,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
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

    const response = await aiService.queryModel(query, { systemPrompt });
    res.json({ response });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: errorMessage });
  }
}

export async function handleBudgetAnalysis(
  req: Request<{}, {}, { budgetData: any }>,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
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

    const response = await aiService.queryModel(prompt, {
      systemPrompt,
      temperature: 0.4,
      maxTokens: 1500,
    });

    res.json({ response });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: errorMessage });
  }
}
