// src/services/aiService.ts
import axios from "axios";
import config from "../config/config";
import {
  ModelOptions,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "../types";

export async function queryModel(
  prompt: string,
  options: ModelOptions = {}
): Promise<string> {
  try {
    // Define um prompt de sistema padrão para especialização em orçamentos
    const defaultSystemPrompt = `
      Você é um assistente especializado em orçamentos para pequenas e médias empresas.
      
      Seu conhecimento inclui:
      - Criação e formatação de orçamentos profissionais
      - Boas práticas de precificação e margens de lucro
      - Estratégias para aumentar taxas de aprovação de orçamentos
      - Elaboração de propostas comerciais e termos contratuais
      - Gestão de catálogos de produtos e serviços
      - Análise de viabilidade financeira
      
      Dê respostas claras, objetivas e práticas, sempre focadas em ajudar 
      a empresa a criar orçamentos mais eficientes e com maior chance de aprovação.
      Ofereça exemplos concretos quando relevante.
    `;

    const requestData: ChatCompletionRequest = {
      messages: [
        {
          role: "system",
          content: options.systemPrompt || defaultSystemPrompt,
        },
        { role: "user", content: prompt },
      ],
      model: options.model || "local-model",
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    };

    const response = await axios.post<ChatCompletionResponse>(
      `${config.lmStudioApiUrl}/chat/completions`,
      requestData
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Erro ao consultar o modelo:", error.message);
      console.error("Detalhes:", error.response?.data);
    } else {
      console.error("Erro desconhecido:", error);
    }
    throw new Error("Falha ao se comunicar com o LM Studio");
  }
}
