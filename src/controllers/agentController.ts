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
      Você é um agente de suporte ao cliente especializado. 
      Responda de forma clara, profissional e amigável.
      Forneça apenas informações sobre produtos e serviços que existem.
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
