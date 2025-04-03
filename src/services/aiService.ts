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
    const requestData: ChatCompletionRequest = {
      messages: [
        {
          role: "system",
          content: options.systemPrompt || "Você é um assistente útil.",
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
