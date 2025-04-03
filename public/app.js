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

    // Adicionar ao final do arquivo app.js, dentro do eventListener DOMContentLoaded

    // --- Início da implementação para análise de PDF ---

    // Elementos da interface de PDF
    const pdfFileInput = document.getElementById('pdf-file');
    const pdfFilename = document.getElementById('pdf-filename');
    const analyzePdfButton = document.getElementById('analyze-pdf-button');
    const pdfLoading = document.getElementById('pdf-loading');
    const pdfResult = document.getElementById('pdf-result');
    const pdfAnalysisContent = document.getElementById('pdf-analysis-content');
    const pdfExtractedContent = document.getElementById('pdf-extracted-content');

    // Elementos para comparação de PDFs
    const comparePdf1 = document.getElementById('compare-pdf1');
    const comparePdf2 = document.getElementById('compare-pdf2');
    const comparePdf1Filename = document.getElementById('compare-pdf1-filename');
    const comparePdf2Filename = document.getElementById('compare-pdf2-filename');
    const comparePdfsButton = document.getElementById('compare-pdfs-button');
    const pdfComparisonResult = document.getElementById('pdf-comparison-result');
    const pdfComparisonContent = document.getElementById('pdf-comparison-content');

    // Configurar abas da análise de PDF
    document.querySelectorAll('.pdf-tab-button').forEach(function (button) {
        button.addEventListener('click', function () {
            document.querySelectorAll('.pdf-tab-button').forEach(function (btn) {
                btn.classList.remove('active');
            });

            document.querySelectorAll('.pdf-tab-pane').forEach(function (pane) {
                pane.classList.remove('active');
            });

            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`pdf-${tabId}`).classList.add('active');
        });
    });

    // Configurar upload de PDF único
    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', function () {
            if (pdfFileInput.files && pdfFileInput.files[0]) {
                const file = pdfFileInput.files[0];
                pdfFilename.textContent = file.name;
                analyzePdfButton.disabled = false;
            } else {
                pdfFilename.textContent = 'Nenhum arquivo selecionado';
                analyzePdfButton.disabled = true;
            }
        });
    }

    // Configurar drag and drop para upload de PDF
    const pdfUploadArea = document.getElementById('pdf-upload-area');
    if (pdfUploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            pdfUploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            pdfUploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            pdfUploadArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            pdfUploadArea.classList.add('highlight');
        }

        function unhighlight() {
            pdfUploadArea.classList.remove('highlight');
        }

        pdfUploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0 && files[0].type === 'application/pdf') {
                pdfFileInput.files = files;
                pdfFilename.textContent = files[0].name;
                analyzePdfButton.disabled = false;
            }
        }
    }

    // Função para analisar PDF
    if (analyzePdfButton) {
        analyzePdfButton.addEventListener('click', async function () {
            if (!pdfFileInput.files || !pdfFileInput.files[0]) {
                alert('Por favor, selecione um arquivo PDF');
                return;
            }

            // Mostrar loading e esconder resultado anterior
            pdfLoading.style.display = 'block';
            pdfResult.style.display = 'none';
            analyzePdfButton.disabled = true;

            try {
                const formData = new FormData();
                formData.append('pdf', pdfFileInput.files[0]);

                const response = await fetch('/api/pdf/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Exibir os resultados
                    pdfAnalysisContent.innerHTML = formatPdfAnalysis(data.analysis);
                    pdfExtractedContent.textContent = data.extractedText;

                    // Mostrar resultado e esconder loading
                    pdfResult.style.display = 'block';
                } else {
                    alert(`Erro: ${data.error || 'Falha ao processar o PDF'}`);
                }
            } catch (error) {
                console.error('Erro ao analisar PDF:', error);
                alert('Ocorreu um erro ao processar o arquivo. Verifique o console para mais detalhes.');
            } finally {
                pdfLoading.style.display = 'none';
                analyzePdfButton.disabled = false;
            }
        });
    }

    // Configurar uploads para comparação de PDFs
    if (comparePdf1 && comparePdf2) {
        // PDF 1
        comparePdf1.addEventListener('change', function () {
            if (comparePdf1.files && comparePdf1.files[0]) {
                comparePdf1Filename.textContent = comparePdf1.files[0].name;
                updateComparePdfsButtonState();
            } else {
                comparePdf1Filename.textContent = 'Nenhum arquivo selecionado';
                updateComparePdfsButtonState();
            }
        });

        // PDF 2
        comparePdf2.addEventListener('change', function () {
            if (comparePdf2.files && comparePdf2.files[0]) {
                comparePdf2Filename.textContent = comparePdf2.files[0].name;
                updateComparePdfsButtonState();
            } else {
                comparePdf2Filename.textContent = 'Nenhum arquivo selecionado';
                updateComparePdfsButtonState();
            }
        });

        function updateComparePdfsButtonState() {
            comparePdfsButton.disabled = !(
                comparePdf1.files &&
                comparePdf1.files[0] &&
                comparePdf2.files &&
                comparePdf2.files[0]
            );
        }
    }

    // Função para comparar PDFs
    if (comparePdfsButton) {
        comparePdfsButton.addEventListener('click', async function () {
            if (!comparePdf1.files || !comparePdf1.files[0] || !comparePdf2.files || !comparePdf2.files[0]) {
                alert('Por favor, selecione dois arquivos PDF para comparação');
                return;
            }

            // Mostrar loading
            pdfLoading.style.display = 'block';
            pdfComparisonResult.style.display = 'none';
            comparePdfsButton.disabled = true;

            try {
                const formData = new FormData();
                formData.append('pdf1', comparePdf1.files[0]);
                formData.append('pdf2', comparePdf2.files[0]);

                const response = await fetch('/api/pdf/compare', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Exibir os resultados da comparação
                    pdfComparisonContent.innerHTML = formatPdfAnalysis(data.comparison);

                    // Mostrar resultado e esconder loading
                    pdfComparisonResult.style.display = 'block';
                } else {
                    alert(`Erro: ${data.error || 'Falha ao comparar os PDFs'}`);
                }
            } catch (error) {
                console.error('Erro ao comparar PDFs:', error);
                alert('Ocorreu um erro ao comparar os arquivos. Verifique o console para mais detalhes.');
            } finally {
                pdfLoading.style.display = 'none';
                comparePdfsButton.disabled = false;
            }
        });
    }

    // Função para formatar análise de PDF (similar à formatComparison)
    function formatPdfAnalysis(text) {
        // Substituir quebras de linha por elementos <p>
        const withParagraphs = text.split("\n\n").map(function (paragraph) {
            if (paragraph.trim().length === 0) return "";
            return "<p>" + paragraph + "</p>";
        }).join("");

        // Processar títulos e subtítulos
        let formatted = withParagraphs
            .replace(/## (.*?)(?=<\/p>)/g, '<h3>$1</h3>')  // Subtítulos
            .replace(/# (.*?)(?=<\/p>)/g, '<h2>$1</h2>');  // Títulos

        // Destacar valores monetários
        formatted = formatted.replace(/(R\$ [\d\.,]+)/g, '<strong class="price">$1</strong>');

        // Destacar porcentagens
        formatted = formatted.replace(/(\d+(?:\.\d+)?%)/g, '<strong class="percentage">$1</strong>');

        return formatted;
    }

    // --- Fim da implementação para análise de PDF ---
});
