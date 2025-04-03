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
    // Elementos da interface
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    // Elementos da interface de comparação
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const budget1FileInput = document.getElementById("budget1-file");
    const budget2FileInput = document.getElementById("budget2-file");
    const budget1Filename = document.getElementById("budget1-filename");
    const budget2Filename = document.getElementById("budget2-filename");
    const budget1Text = document.getElementById("budget1-text");
    const budget2Text = document.getElementById("budget2-text");
    const compareButton = document.getElementById("compare-button");
    const comparisonContent = document.getElementById("comparison-content");
    // Configuração das abas
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            var _a;
            // Remover classe ativa de todas as abas
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabPanes.forEach((pane) => pane.classList.remove("active"));
            // Adicionar classe ativa à aba clicada
            button.classList.add("active");
            const tabId = button.getAttribute("data-tab");
            (_a = document.getElementById(`${tabId}-tab`)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
        });
    });
    // Funções para o chat
    function addMessage(content, isUser) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.classList.add(isUser ? "user-message" : "agent-message");
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function addLoadingIndicator() {
        const loadingElement = document.createElement("div");
        loadingElement.classList.add("loading");
        loadingElement.id = "loading-indicator";
        loadingElement.textContent = "Analisando sua solicitação...";
        chatMessages.appendChild(loadingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
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
                // Verificar se a mensagem parece ser uma solicitação de análise de orçamento
                const isBudgetAnalysisRequest = message.toLowerCase().includes("analis") &&
                    (message.toLowerCase().includes("orçamento") ||
                        message.toLowerCase().includes("orcamento"));
                // Se for uma análise de orçamento e houver dados JSON, encaminhar para endpoint específico
                const endpoint = isBudgetAnalysisRequest && message.includes("{")
                    ? "/api/agent/budget-analysis"
                    : "/api/agent/general";
                // Preparar o body da requisição
                const requestBody = isBudgetAnalysisRequest && message.includes("{")
                    ? { budgetData: extractJsonFromMessage(message) }
                    : { prompt: message };
                const response = yield fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
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
    // Função para comparar orçamentos
    function compareBudgets() {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar se há dados suficientes
            let budget1Data, budget2Data;
            try {
                // Tentar obter dados do primeiro orçamento
                if (budget1Text.value.trim()) {
                    budget1Data = JSON.parse(budget1Text.value);
                }
                else {
                    comparisonContent.innerHTML =
                        "Por favor, forneça o conteúdo do primeiro orçamento.";
                    return;
                }
                // Tentar obter dados do segundo orçamento
                if (budget2Text.value.trim()) {
                    budget2Data = JSON.parse(budget2Text.value);
                }
                else {
                    comparisonContent.innerHTML =
                        "Por favor, forneça o conteúdo do segundo orçamento.";
                    return;
                }
            }
            catch (error) {
                comparisonContent.innerHTML =
                    "Erro ao processar os dados do orçamento. Certifique-se de que ambos estão em formato JSON válido.";
                return;
            }
            // Desabilitar botão e mostrar indicador de carregamento
            compareButton.disabled = true;
            comparisonContent.innerHTML =
                "<div class='loading'>Analisando os orçamentos...</div>";
            try {
                const response = yield fetch("/api/agent/budget-comparison", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        budget1: budget1Data,
                        budget2: budget2Data,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const data = (yield response.json());
                // Formatar a resposta com quebras de linha e espaçamento adequado
                comparisonContent.innerHTML = formatComparisonResult(data.response);
            }
            catch (error) {
                console.error("Erro na comparação:", error);
                comparisonContent.innerHTML =
                    "Ocorreu um erro ao comparar os orçamentos. Por favor, tente novamente.";
            }
            finally {
                compareButton.disabled = false;
            }
        });
    }
    // Função para formatar o resultado da comparação
    function formatComparisonResult(text) {
        // Substituir quebras de linha por elementos <p>
        const withParagraphs = text
            .split("\n\n")
            .map((paragraph) => {
            if (paragraph.trim().length === 0)
                return "";
            return `<p>${paragraph}</p>`;
        })
            .join("");
        // Processar títulos e subtítulos
        let formatted = withParagraphs
            .replace(/## (.*?)(?=<\/p>)/g, "<h3>$1</h3>") // Subtítulos
            .replace(/# (.*?)(?=<\/p>)/g, "<h2>$1</h2>"); // Títulos
        // Destacar valores monetários
        formatted = formatted.replace(/(R\$ [\d\.,]+)/g, '<strong class="price">$1</strong>');
        // Destacar porcentagens
        formatted = formatted.replace(/(\d+(?:\.\d+)?%)/g, '<strong class="percentage">$1</strong>');
        return formatted;
    }
    // Handler para arquivos
    function handleFileSelection(fileInput, filenameDisplay, textArea) {
        fileInput.addEventListener("change", () => {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                filenameDisplay.textContent = file.name;
                // Ler o conteúdo do arquivo
                const reader = new FileReader();
                reader.onload = (e) => {
                    var _a;
                    const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                    textArea.value = content;
                };
                reader.readAsText(file);
            }
            else {
                filenameDisplay.textContent = "Nenhum arquivo selecionado";
            }
        });
    }
    // Função para extrair JSON de uma mensagem
    function extractJsonFromMessage(message) {
        try {
            const jsonMatch = message.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        }
        catch (error) {
            console.error("Erro ao parsear JSON:", error);
            return null;
        }
    }
    // Event listeners para chat
    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
    // Event listeners para comparação de orçamentos
    handleFileSelection(budget1FileInput, budget1Filename, budget1Text);
    handleFileSelection(budget2FileInput, budget2Filename, budget2Text);
    compareButton.addEventListener("click", compareBudgets);
    // Adicionar click handlers para as sugestões
    document.querySelectorAll(".suggestions li").forEach((item) => {
        item.addEventListener("click", () => {
            const text = item.textContent;
            if (text) {
                messageInput.value = text;
                sendMessage();
            }
        });
    });
    // Mensagem de boas-vindas
    addMessage("Olá! Sou seu assistente especializado em orçamentos. Posso ajudar você a criar, analisar e comparar orçamentos para aumentar suas chances de aprovação. Como posso ajudar hoje?", false);
});
