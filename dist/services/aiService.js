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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryModel = queryModel;
// src/services/aiService.ts
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config/config"));
function queryModel(prompt_1) {
    return __awaiter(this, arguments, void 0, function* (prompt, options = {}) {
        var _a;
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
            const requestData = {
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
            const response = yield axios_1.default.post(`${config_1.default.lmStudioApiUrl}/chat/completions`, requestData);
            return response.data.choices[0].message.content;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error("Erro ao consultar o modelo:", error.message);
                console.error("Detalhes:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            }
            else {
                console.error("Erro desconhecido:", error);
            }
            throw new Error("Falha ao se comunicar com o LM Studio");
        }
    });
}
