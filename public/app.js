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
        templateSelector.innerHTML = '<option value="">Nenhum (usar apenas descrição)</option>'; // Texto alterado
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
            dynamicInputsContainer.style.display = 'none'; // Esconde se nenhum template
            return;
        }
        dynamicInputsContainer.style.display = 'block'; // Mostra se houver template

        const templateText = templates[templateKey];
        const variables = findTemplateVariables(templateText);

        variables.forEach(variable => {
            // Ignorar variáveis que já são preenchidas pelos campos fixos
            const upperVar = variable.toUpperCase();
            if (['NUMERO_CHAMADO', 'NOME_SOLICITANTE', 'DEPARTAMENTO', 'ACAO_PRINCIPAL'].includes(upperVar)) {
                return; 
            }

            const label = document.createElement('label');
            const friendlyName = variable.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            label.textContent = friendlyName + ':';
            label.htmlFor = `dynamic-input-${variable}`;

            // Cria textarea se o nome contiver 'acao' ou 'descricao', senão input
            const isLargeInput = variable.toLowerCase().includes('acao') || variable.toLowerCase().includes('descricao');
            const input = document.createElement(isLargeInput ? 'textarea' : 'input');
            
            if (!isLargeInput) {
                input.type = 'text';
            } else {
                input.rows = 3; // Menor que o principal
            }

            input.id = `dynamic-input-${variable}`;
            input.placeholder = `Preencha ${friendlyName}...`;
            input.classList.add('dynamic-field'); // Classe para estilização opcional

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
        let baseTemplateText = ""; // Guarda o texto original do template

        // Preenche o template selecionado com os valores dos campos dinâmicos
        if (templateKey && templates[templateKey]) {
            baseTemplateText = templates[templateKey]; // Guarda o original
            filledTemplateContent = baseTemplateText;
            const variables = findTemplateVariables(filledTemplateContent);
            variables.forEach(variable => {
                const inputElement = document.getElementById(`dynamic-input-${variable}`);
                const value = inputElement ? inputElement.value.trim() : '';
                const regex = new RegExp(`_START_${variable}_`, 'g');
                // Preenche a cópia, não o original
                filledTemplateContent = filledTemplateContent.replace(regex, value || `**[${variable.replace(/_/g,' ')}]**`); // Adiciona marcador se vazio
            });
        }

        // Dados adicionais (opções avançadas)
        const advancedDetails = {
            ticketNumber: ticketNumberInput.value.trim() || '**[Número Chamado]**', // Adiciona marcador se vazio
            requester: requesterInput.value.trim() || '**[Nome Solicitante]**', // Adiciona marcador se vazio
            department: departmentInput.value.trim() || '**[Departamento]**' // Adiciona marcador se vazio
        };

        // Substitui variáveis fixas no template preenchido
        filledTemplateContent = filledTemplateContent.replace(/_START_NUMERO_CHAMADO_/g, advancedDetails.ticketNumber);
        filledTemplateContent = filledTemplateContent.replace(/_START_NOME_SOLICITANTE_/g, advancedDetails.requester);
        filledTemplateContent = filledTemplateContent.replace(/_START_DEPARTAMENTO_/g, advancedDetails.department);
        filledTemplateContent = filledTemplateContent.replace(/_START_ACAO_PRINCIPAL_/g, mainAction); // Substitui a ação principal

        // --- PROMPT DA IA MODIFICADO ---
        const prompt = `
            Você é um assistente de Suporte Técnico (TI) redigindo um registro de encerramento de chamado claro e profissional.

            **Tarefa Principal:** Aprimorar a descrição da ação realizada pelo técnico, mantendo a clareza e adicionando um toque profissional, sem ser excessivamente técnico. Use a estrutura do template (se fornecido) como guia, mas foque em melhorar a descrição principal. Coloque em negrito (usando **texto**) as partes que o técnico talvez precise revisar ou completar (como nomes específicos, senhas temporárias, ou detalhes omitidos).

            **INFORMAÇÕES FORNECIDAS:**

            1.  **DESCRIÇÃO PRINCIPAL DO TÉCNICO (Mais importante):**
                ---
                ${mainAction}
                ---

            2.  **DETALHES DO CHAMADO:**
                - Número: ${advancedDetails.ticketNumber}
                - Solicitante: ${advancedDetails.requester}
                - Departamento: ${advancedDetails.department}

            3.  **TEXTO PRÉ-PREENCHIDO DO MODELO (Use como base para estrutura e placeholders em negrito):**
                ---
                ${filledTemplateContent || 'Nenhum modelo selecionado.'}
                ---
            
            **INSTRUÇÕES DETALHADAS:**
            - **Foco:** Melhore a "DESCRIÇÃO PRINCIPAL DO TÉCNICO". Torne-a mais completa e profissional, mas evite jargões muito complexos.
            - **Estrutura:** Siga a estrutura geral do "TEXTO PRÉ-PREENCHIDO DO MODELO", se houver. Comece com uma saudação, descreva a ação (baseada na DESCRIÇÃO PRINCIPAL), e finalize.
            - **Negrito:** Mantenha ou adicione **negrito** (Markdown: **texto**) em locais onde o técnico precise confirmar ou preencher informações (ex: **[Nome do Software]**, **[Senha Temporária]**, **[Detalhe Específico]**). Use os placeholders em negrito que já estão no texto pré-preenchido como guia.
            - **Tom:** Objetivo, claro e prestativo.
            - **Saída:** Gere APENAS o texto final do registro. Não inclua títulos ou frases como "Aqui está o script:".
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
            outputScript.readOnly = false; // Permite edição
            showFeedback('Script gerado com sucesso! Você pode editá-lo abaixo.', 'success');

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
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
        if (outputScript.value && !outputScript.readOnly) { // Só copia se não houver erro
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
        renderDynamicInputs(templateSelector.value); // Renderiza inputs iniciais se houver valor salvo
    }

    init();
});