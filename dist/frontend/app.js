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
document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    // Função para adicionar mensagem ao chat
    function addMessage(content, isUser) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.classList.add(isUser ? "user-message" : "agent-message");
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    // Função para adicionar indicador de carregamento
    function addLoadingIndicator() {
        const loadingElement = document.createElement("div");
        loadingElement.classList.add("loading");
        loadingElement.id = "loading-indicator";
        loadingElement.textContent = "Agente está digitando...";
        chatMessages.appendChild(loadingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    // Função para remover indicador de carregamento
    function removeLoadingIndicator() {
        const loadingElement = document.getElementById("loading-indicator");
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    // Função para enviar mensagem ao agente
    function sendMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const message = messageInput.value.trim();
            if (!message)
                return;
            // Adicionar mensagem do usuário ao chat
            addMessage(message, true);
            // Limpar input
            messageInput.value = "";
            // Desabilitar botão de envio
            sendButton.disabled = true;
            // Mostrar indicador de carregamento
            addLoadingIndicator();
            try {
                const response = yield fetch("/api/agent/general", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ prompt: message }),
                });
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const data = (yield response.json());
                // Remover indicador de carregamento
                removeLoadingIndicator();
                // Adicionar resposta do agente ao chat
                addMessage(data.response, false);
            }
            catch (error) {
                console.error("Erro:", error);
                // Remover indicador de carregamento
                removeLoadingIndicator();
                // Adicionar mensagem de erro
                addMessage("Desculpe, ocorreu um erro ao processar sua solicitação.", false);
            }
            finally {
                // Habilitar botão de envio
                sendButton.disabled = false;
            }
        });
    }
    // Event listeners
    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
    // Mensagem de boas-vindas
    addMessage("Olá! Eu sou seu assistente de IA. Como posso ajudar você hoje?", false);
});
