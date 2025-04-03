// src/frontend/app.ts
interface ApiResponse {
  response: string;
}

interface ApiError {
  error: string;
}

document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById(
    "chat-messages"
  ) as HTMLDivElement;
  const messageInput = document.getElementById(
    "message-input"
  ) as HTMLInputElement;
  const sendButton = document.getElementById(
    "send-button"
  ) as HTMLButtonElement;

  // Função para adicionar mensagem ao chat
  function addMessage(content: string, isUser: boolean): void {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.classList.add(isUser ? "user-message" : "agent-message");
    messageElement.textContent = content;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Função para adicionar indicador de carregamento
  function addLoadingIndicator(): void {
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("loading");
    loadingElement.id = "loading-indicator";
    loadingElement.textContent = "Agente está digitando...";

    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Função para remover indicador de carregamento
  function removeLoadingIndicator(): void {
    const loadingElement = document.getElementById("loading-indicator");
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  // Função para enviar mensagem ao agente
  async function sendMessage(): Promise<void> {
    const message = messageInput.value.trim();

    if (!message) return;

    // Adicionar mensagem do usuário ao chat
    addMessage(message, true);

    // Limpar input
    messageInput.value = "";

    // Desabilitar botão de envio
    sendButton.disabled = true;

    // Mostrar indicador de carregamento
    addLoadingIndicator();

    try {
      const response = await fetch("/api/agent/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = (await response.json()) as ApiResponse;

      // Remover indicador de carregamento
      removeLoadingIndicator();

      // Adicionar resposta do agente ao chat
      addMessage(data.response, false);
    } catch (error) {
      console.error("Erro:", error);

      // Remover indicador de carregamento
      removeLoadingIndicator();

      // Adicionar mensagem de erro
      addMessage(
        "Desculpe, ocorreu um erro ao processar sua solicitação.",
        false
      );
    } finally {
      // Habilitar botão de envio
      sendButton.disabled = false;
    }
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);

  messageInput.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Mensagem de boas-vindas
  addMessage(
    "Olá! Eu sou seu assistente de IA. Como posso ajudar você hoje?",
    false
  );
});
