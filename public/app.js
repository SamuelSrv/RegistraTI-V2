document.addEventListener('DOMContentLoaded', function () {
    // --- Referências de Elementos ---
    const mainActionInput = document.getElementById('mainActionInput');
    const templateSelector = document.getElementById('templateSelector');
    const dynamicInputsContainer = document.getElementById('dynamic-inputs-container');
    const toggleAdvancedBtn = document.getElementById('toggleAdvancedBtn');
    const advancedOptionsContainer = document.getElementById('advanced-options-container');
    const ticketNumberInput = document.getElementById('ticketNumberInput');
    const requesterInput = document.getElementById('requesterInput');
    const departmentInput = document.getElementById('departmentInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputScript = document.getElementById('outputScript');
    const copyBtn = document.getElementById('copyBtn');
    const feedbackMessage = document.getElementById('feedbackMessage');

    let templates = {}; // Inicializa templates como um objeto vazio

    // --- Funções de Utilitário ---

    // Carrega templates do localStorage ou define um padrão
    function loadTemplates() {
        const savedTemplates = localStorage.getItem('aiScriptTemplates');
        if (savedTemplates) {
            templates = JSON.parse(savedTemplates);
        } else {
            // Template padrão
            templates = {
                vpnAccess: `Prezado(a) _START_REQUESTER_,\n\nConforme solicitado no chamado _START_TICKET_NUMBER_, foi configurado o acesso VPN para o(a) senhor(a) João Silva do departamento de Vendas.\n\nDetalhes da configuração:\n_START_MAIN_ACTION_\n\nOs dados de acesso foram encaminhados por e-mail.\n\nAtenciosamente,\nEquipe de Suporte TI.`
            };
            localStorage.setItem('aiScriptTemplates', JSON.stringify(templates));
        }
    }

    // Popula o dropdown de seleção de templates
    function populateTemplateSelector() {
        templateSelector.innerHTML = '<option value="">Nenhum (gerar livremente)</option>';
        for (const key in templates) {
            const option = document.createElement('option');
            option.value = key;
            const friendlyName = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            option.textContent = `Modelo: ${friendlyName}`;
            templateSelector.appendChild(option);
        }
    }

    // Encontra variáveis do tipo _START_VARIAVEL_ em um texto
    function findTemplateVariables(text) {
        const regex = /_START_([a-zA-Z0-9_]+)_/g;
        const matches = [...text.matchAll(regex)];
        const uniqueVariables = new Set(matches.map(match => match[1]));
        return Array.from(uniqueVariables);
    }

    // Renderiza inputs dinâmicos com base no template selecionado
    function renderDynamicInputs(templateKey) {
        dynamicInputsContainer.innerHTML = ''; // Limpa inputs anteriores
        if (!templateKey || !templates[templateKey]) {
            return;
        }

        const templateText = templates[templateKey];
        const variables = findTemplateVariables(templateText);

        variables.forEach(variable => {
            // Ignorar variáveis que já são preenchidas por outros campos
            if (['TICKET_NUMBER', 'REQUESTER', 'DEPARTMENT', 'MAIN_ACTION'].includes(variable.toUpperCase())) {
                return;
            }

            const label = document.createElement('label');
            const friendlyName = variable.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            label.textContent = friendlyName + ':';
            label.htmlFor = `dynamic-input-${variable}`;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `dynamic-input-${variable}`;
            input.placeholder = `Preencha ${friendlyName}...`;
            input.classList.add('dynamic-field');

            dynamicInputsContainer.appendChild(label);
            dynamicInputsContainer.appendChild(input);
        });
    }

    // Exibe feedback para o usuário (sucesso/erro)
    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 5000); // Esconde após 5 segundos
    }

    // --- Lógica Principal de Geração de Script ---

    async function generateScript() {
        const mainAction = mainActionInput.value.trim();
        if (!mainAction) {
            showFeedback('Por favor, descreva a ação principal realizada.', 'error');
            mainActionInput.focus();
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Gerando...';
        outputScript.value = 'Processando com IA...';
        outputScript.classList.remove('error-output');
        showFeedback('A Inteligência Artificial está trabalhando nisso...', 'success');


        const templateKey = templateSelector.value;
        let filledTemplateContent = "";

        // Preenche o template selecionado com os valores dos campos dinâmicos
        if (templateKey && templates[templateKey]) {
            filledTemplateContent = templates[templateKey];
            const variables = findTemplateVariables(filledTemplateContent);
            variables.forEach(variable => {
                const inputElement = document.getElementById(`dynamic-input-${variable}`);
                const value = inputElement ? inputElement.value.trim() : '';
                const regex = new RegExp(`_START_${variable}_`, 'g');
                filledTemplateContent = filledTemplateContent.replace(regex, value);
            });
        }

        // Dados adicionais
        const advancedDetails = {
            ticketNumber: ticketNumberInput.value.trim(),
            requester: requesterInput.value.trim(),
            department: departmentInput.value.trim()
        };

        const prompt = `
            Você é um assistente de IA especialista em Suporte Técnico (TI), responsável por redigir um registro de encerramento de chamado de forma profissional e clara para um sistema de tickets.

            Sua tarefa é criar um script de encerramento completo e de alta qualidade, baseando-se nas informações fornecidas e aplicando as melhores práticas de comunicação em TI.

            **INFORMAÇÕES ESSENCIAIS:**

            1.  **AÇÃO PRINCIPAL REALIZADA (Detalhe mais importante):**
                ---
                ${mainAction}
                ---

            2.  **DETALHES DO CHAMADO (Se fornecidos):**
                - Número do Chamado: ${advancedDetails.ticketNumber || 'Não informado'}
                - Solicitante: ${advancedDetails.requester || 'Não informado'}
                - Departamento: ${advancedDetails.department || 'Não informado'}

            3.  **MODELO/TEMPLATE DE BASE (Se um foi selecionado):**
                ---
                ${filledTemplateContent || 'Nenhum modelo de base utilizado. Gerar livremente.'}
                ---

            **SUAS INSTRUÇÕES PARA A CRIAÇÃO DO SCRIPT:**

            * **Estrutura:** Comece com uma saudação ao solicitante (se o nome estiver disponível). Siga com a descrição do serviço, e finalize com uma despedida profissional.
            * **Conteúdo:** O corpo principal do script deve detalhar a "AÇÃO PRINCIPAL REALIZADA", enriquecendo-a com terminologia técnica plausível e passos lógicos que um técnico de TI executaria. Não apenas repita a ação principal, mas expanda-a de forma coerente.
            * **Incorporação de Detalhes:** Integre as "DETALHES DO CHAMADO" e o conteúdo do "MODELO/TEMPLATE DE BASE" de forma fluida no texto.
            * **Tom:** Profissional, objetivo e cortês.
            * **Formato de Saída:** Apenas o texto do script. Não inclua cabeçalhos, introduções como "Aqui está o script gerado:", ou qualquer formatação além do corpo do e-mail.
        `;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro de rede: ${response.statusText} (${response.status})`);
            }

            const data = await response.json();
            outputScript.value = data.text;
            showFeedback('Script gerado com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            outputScript.value = `Erro ao gerar script: ${error.message}`;
            outputScript.classList.add('error-output');
            showFeedback(`Erro: ${error.message}`, 'error');

        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Gerar Script de Encerramento';
        }
    }

    // --- Event Listeners e Inicialização ---
    templateSelector.addEventListener('change', (event) => {
        renderDynamicInputs(event.target.value);
    });

    toggleAdvancedBtn.addEventListener('click', () => {
        const isHidden = advancedOptionsContainer.classList.contains('hidden');
        if (isHidden) {
            advancedOptionsContainer.classList.remove('hidden');
            toggleAdvancedBtn.textContent = 'Ocultar Detalhes Adicionais ▲';
        } else {
            advancedOptionsContainer.classList.add('hidden');
            toggleAdvancedBtn.textContent = 'Mostrar Detalhes Adicionais ▼';
        }
    });

    generateBtn.addEventListener('click', generateScript);

    copyBtn.addEventListener('click', () => {
        if (outputScript.value) {
            navigator.clipboard.writeText(outputScript.value).then(() => {
                showFeedback('Script copiado para a área de transferência!', 'success');
            }).catch(err => {
                console.error('Falha ao copiar o texto: ', err);
                showFeedback('Falha ao copiar o script. Tente copiar manualmente.', 'error');
            });
        } else {
            showFeedback('Não há script para copiar!', 'error');
        }
    });

    // Função de inicialização
    function init() {
        loadTemplates();
        populateTemplateSelector();
    }

    init();
});