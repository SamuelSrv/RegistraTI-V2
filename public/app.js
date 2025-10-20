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

    let templates = {};
    const STORAGE_KEY = 'aiScriptTemplates'; // Chave unificada

    // --- Funções de Utilitário ---

    // Carrega templates do localStorage ou define padrões
    function loadTemplates() {
        const savedTemplates = localStorage.getItem(STORAGE_KEY);
        if (savedTemplates && Object.keys(JSON.parse(savedTemplates)).length > 0) {
            templates = JSON.parse(savedTemplates);
        } else {
            // --- TEMPLATES PADRÃO ---
            templates = {
                instalacaoSoftware: `Prezado(a) _START_NOME_SOLICITANTE_,\n\nInformamos que a instalação do software **_START_NOME_SOFTWARE_** solicitada no chamado _START_NUMERO_CHAMADO_ foi concluída com sucesso em seu equipamento.\n\nRealizamos os seguintes procedimentos:\n_START_ACAO_PRINCIPAL_\n\nO software foi testado e está funcionando corretamente.\n\nAtenciosamente,\nEquipe de Suporte TI`,
                resetSenhaRede: `Prezado(a) _START_NOME_SOLICITANTE_,\n\nConforme solicitado no chamado _START_NUMERO_CHAMADO_, sua senha de rede foi redefinida.\n\nSua senha temporária é: **NovaSenha123** (por favor, altere no primeiro login).\n\n_START_ACAO_PRINCIPAL_\n\nCaso necessite de ajuda adicional, estamos à disposição.\n\nAtenciosamente,\nEquipe de Suporte TI`,
                problemaConexao: `Prezado(a) _START_NOME_SOLICITANTE_,\n\nAnalisamos o problema de conexão relatado no chamado _START_NUMERO_CHAMADO_.\n\nIdentificamos e corrigimos a falha. Detalhes:\n_START_ACAO_PRINCIPAL_\n\nA conexão foi restabelecida e testada.\n\nAtenciosamente,\nEquipe de Suporte TI`,
                geral: `Prezado(a) _START_NOME_SOLICITANTE_,\n\nSeu chamado _START_NUMERO_CHAMADO_ foi atendido.\n\nAção realizada:\n_START_ACAO_PRINCIPAL_\n\nO chamado está sendo encerrado.\n\nAtenciosamente,\nEquipe de Suporte TI`
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        }
    }

    // Popula o dropdown de seleção de templates
    function populateTemplateSelector() {
        templateSelector.innerHTML = '<option value="">Nenhum (usar apenas descrição)</option>';
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
        dynamicInputsContainer.innerHTML = '';
        if (!templateKey || !templates[templateKey]) {
            dynamicInputsContainer.style.display = 'none';
            return;
        }
        dynamicInputsContainer.style.display = 'block';

        const templateText = templates[templateKey];
        const variables = findTemplateVariables(templateText);

        variables.forEach(variable => {
            const upperVar = variable.toUpperCase();
            if (['NUMERO_CHAMADO', 'NOME_SOLICITANTE', 'DEPARTAMENTO', 'ACAO_PRINCIPAL'].includes(upperVar)) {
                return;
            }

            const label = document.createElement('label');
            const friendlyName = variable.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            label.textContent = friendlyName + ':';
            label.htmlFor = `dynamic-input-${variable}`;

            const isLargeInput = variable.toLowerCase().includes('acao') || variable.toLowerCase().includes('descricao');
            const input = document.createElement(isLargeInput ? 'textarea' : 'input');
            
            if (!isLargeInput) {
                input.type = 'text';
            } else {
                input.rows = 3;
            }

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
        }, 5000);
    }

    // --- Lógica Principal de Geração de Script ---

    async function handleGerarScript() {
        const mainAction = mainActionInput.value.trim();
        if (!mainAction) {
            showFeedback('Por favor, descreva a ação principal realizada.', 'error');
            mainActionInput.focus();
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Gerando...';
        outputScript.value = 'Processando com IA...';
        outputScript.readOnly = true; // Impede edição durante a geração
        outputScript.classList.remove('error-output');
        showFeedback('A Inteligência Artificial está trabalhando nisso...', 'success');

        const templateKey = templateSelector.value;
        let filledTemplateContent = "";
        let baseTemplateText = "";

        if (templateKey && templates[templateKey]) {
            baseTemplateText = templates[templateKey];
            filledTemplateContent = baseTemplateText;
            const variables = findTemplateVariables(filledTemplateContent);
            variables.forEach(variable => {
                const inputElement = document.getElementById(`dynamic-input-${variable}`);
                // Usa placeholder em negrito se campo dinâmico estiver vazio
                const value = inputElement ? inputElement.value.trim() : '';
                const placeholder = `**[${variable.replace(/_/g,' ').toUpperCase()}]**`;
                const regex = new RegExp(`_START_${variable}_`, 'g');
                filledTemplateContent = filledTemplateContent.replace(regex, value || placeholder);
            });
        }

        // Usa placeholder em negrito se campos avançados estiverem vazios
        const advancedDetails = {
            ticketNumber: ticketNumberInput.value.trim() || '**[Número Chamado]**',
            requester: requesterInput.value.trim() || '**[Nome Solicitante]**',
            department: departmentInput.value.trim() || '**[Departamento]**'
        };

        // Substitui variáveis fixas no template preenchido
        filledTemplateContent = filledTemplateContent.replace(/_START_NUMERO_CHAMADO_/g, advancedDetails.ticketNumber);
        filledTemplateContent = filledTemplateContent.replace(/_START_NOME_SOLICITANTE_/g, advancedDetails.requester);
        filledTemplateContent = filledTemplateContent.replace(/_START_DEPARTAMENTO_/g, advancedDetails.department);
        filledTemplateContent = filledTemplateContent.replace(/_START_ACAO_PRINCIPAL_/g, mainAction); // Substitui a ação principal

        // --- INÍCIO DO PROMPT PARA A IA ---
        // ESTE É O TEXTO EXATO QUE VOCÊ COLOCOU NA SUA MENSAGEM
        const prompt = `
            Você é um especialista em Suporte Técnico (TI) sênior, redigindo o registro de um chamado para um sistema de tickets.
            Sua tarefa é criar um registro profissional e completo usando as seguintes informações:

            **INFORMAÇÕES DO CHAMADO (se fornecidas):**
            - Número do Chamado: ${advancedDetails.ticketNumber}
            - Solicitante: ${advancedDetails.requester}
            - Departamento: ${advancedDetails.department}

            **DESCRIÇÃO PRINCIPAL DA AÇÃO REALIZADA (informação mais importante):**
            ---
            ${mainAction}
            ---

            **ESTRUTURA E CONTEXTO DO TEMPLATE (se um padrão foi usado):**
            ---
            ${filledTemplateContent || 'Nenhum padrão utilizado'}
            ---

            **SUAS INSTRUÇÕES:**
            1.  Baseie o corpo principal do seu texto na "DESCRIÇÃO PRINCIPAL DA AÇÃO REALIZADA". Esta é a fonte da verdade sobre o que foi feito.
            2.  Incorpore as "INFORMAÇÕES DO CHAMADO" de forma natural no registro. Por exemplo, comece com uma saudação ao solicitante.
            3.  Use a "ESTRUTURA E CONTEXTO DO TEMPLATE" principalmente para guiar a saudação inicial e a frase de encerramento, mas a descrição do serviço deve vir da "DESCRIÇÃO PRINCIPAL".
            4.  Enriqueça o texto com detalhes técnicos plausíveis que um analista de TI teria executado.
            5.  O resultado final deve ser apenas o texto do registro, claro, profissional e conclusivo.
        `;
        // --- FIM DO PROMPT PARA A IA ---

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Usa a mensagem de erro vinda do backend (netlify function) se disponível
                throw new Error(errorData.error || `Erro de rede: ${response.statusText} (${response.status})`);
            }

            const data = await response.json();
            outputScript.value = data.text;
            outputScript.readOnly = false; // Permite edição após sucesso
            showFeedback('Script gerado com sucesso! Você pode editá-lo abaixo.', 'success');

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            // Mostra a mensagem de erro detalhada vinda do catch ou do backend
            outputScript.value = `Erro ao gerar script: ${error.message}`;
            outputScript.classList.add('error-output');
            outputScript.readOnly = true; // Impede edição no erro
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
        if (outputScript.value && !outputScript.readOnly) {
            navigator.clipboard.writeText(outputScript.value).then(() => {
                showFeedback('Script copiado para a área de transferência!', 'success');
            }).catch(err => {
                console.error('Falha ao copiar o texto: ', err);
                showFeedback('Falha ao copiar o script. Tente copiar manualmente.', 'error');
            });
        } else if (outputScript.readOnly){
             showFeedback('Não é possível copiar um script com erro.', 'error');
        } else {
            showFeedback('Não há script para copiar!', 'error');
        }
    });

    // Função de inicialização
    function init() {
        loadTemplates();
        populateTemplateSelector();
        renderDynamicInputs(templateSelector.value); // Renderiza inputs se um template já estiver selecionado
    }

    init();
});