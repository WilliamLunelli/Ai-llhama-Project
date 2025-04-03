// src/types/index.ts

export interface ModelOptions {
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeneralQueryRequest {
  prompt: string;
  options?: ModelOptions;
}

export interface CustomerSupportRequest {
  query: string;
}

export interface ApiResponse {
  response: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ChatCompletionRequest {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  model: string;
  temperature: number;
  max_tokens: number;
}

export interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
