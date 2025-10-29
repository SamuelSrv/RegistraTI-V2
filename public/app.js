document.addEventListener('DOMContentLoaded', function () {
    // --- Referências de Elementos ---
    const mainActionInput = document.getElementById('mainActionInput');
    const mainDescriptionInput = document.getElementById('mainDescriptionInput');
    const templateSelector = document.getElementById('templateSelector'); // Mantido para contexto opcional
    const advancedOptionsContainer = document.getElementById('advanced-options-container'); // Mantido
    const ticketNumberInput = document.getElementById('ticketNumberInput');
    const requesterInput = document.getElementById('requesterInput');
    const departmentInput = document.getElementById('departmentInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputScript = document.getElementById('outputScript');
    const copyBtn = document.getElementById('copyBtn');
    const feedbackMessage = document.getElementById('feedbackMessage');

    let templates = {};
    const STORAGE_KEY = 'aiScriptTemplates';

    // --- Funções de Utilitário ---

    function loadTemplates() {
        const savedTemplates = localStorage.getItem(STORAGE_KEY);
        if (!savedTemplates || Object.keys(JSON.parse(savedTemplates)).length === 0) {
            setDefaultTemplates();
        } else {
             try {
                templates = JSON.parse(savedTemplates);
                // Verifica se os templates carregados são os novos (com 'Contexto:')
                // Se não forem, reseta para os padrões. Isso ajuda na transição.
                const firstKey = Object.keys(templates)[0];
                if (firstKey && !templates[firstKey].startsWith("Contexto:")) {
                    console.log("Detectados templates antigos, redefinindo para os padrões.");
                    setDefaultTemplates();
                }
             } catch (e) {
                 console.error("Erro ao carregar templates salvos:", e);
                 setDefaultTemplates(); // Usa padrões em caso de erro
             }
        }
        populateTemplateSelector();
    }

    // Define os templates padrão ATUALIZADOS
    function setDefaultTemplates() {
         templates = {
            instalacaoSoftware: "Contexto: Instalação de Software",
            configImpressora: "Contexto: Configuração de Impressora",
            instalacaoEstacao: "Contexto: Instalação/Configuração de Estação (Física)",
            configRamal: "Contexto: Configuração de Ramal",
            solicitacaoEquipamento: "Contexto: Solicitação de Equipamento",
            atendimentoGenerico: "Contexto: Atendimento Geral"
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }

    function populateTemplateSelector() {
        templateSelector.innerHTML = '<option value="">Nenhum Contexto Específico</option>';
        if (!templates || Object.keys(templates).length === 0) {
             return;
        }

        for (const key in templates) {
            const option = document.createElement('option');
            option.value = key;
            const labelText = templates[key].startsWith("Contexto: ") ? templates[key].substring(10) : key;
            option.textContent = labelText; 
            templateSelector.appendChild(option);
        }
    }

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 4000);
    }

    // --- Lógica Principal de Geração de Script ---

    async function handleGerarScript() {
        const mainAction = mainActionInput.value.trim();
        if (!mainAction) {
            showFeedback('Por favor, descreva a ação realizada.', 'error');
            mainActionInput.focus();
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Gerando...';
        outputScript.value = 'Processando com IA...';
        outputScript.readOnly = true;
        outputScript.classList.remove('error-output');
        showFeedback('A IA está trabalhando...', 'success');

        const contextKey = templateSelector.value;
        const contextText = contextKey ? templates[contextKey] : "Nenhum contexto específico selecionado";

        const details = {
            ticketNumber: ticketNumberInput.value.trim(),
            requester: requesterInput.value.trim(),
            department: departmentInput.value.trim(),
            mainDescriptionInput: mainDescriptionInput.value.trim()
        };

        gerarRegistroTecnico(mainAction, details, contextText);
    }

    async function gerarRegistroTecnico(mainAction, details, contextText) {
        // --- PROMPT DA IA ATUALIZADO COM ASSINATURA ---
        const prompt = `
            Você é um assistente de IA para Suporte Técnico (TI), especializado em criar registros concisos e técnicos para sistemas de chamados.

            **Tarefa:** Gerar um registro técnico baseado na descrição fornecida pelo analista. O registro deve ser claro, objetivo e focado nos fatos técnicos relevantes. **Ao final do registro, SEMPRE adicione a seguinte despedida e assinatura:**
            Qualquer Duvida Ficamos a disposição, o chamado esta sendo encerrado

            Atenciosamente,
            Ibrowse / NTI-RS

            **INFORMAÇÕES FORNECIDAS:**

            1.  **DESCRIÇÃO DO ANALISTA (Fonte Principal):**
                ---
                ${mainAction}
                ---

            2.  **DETALHES ADICIONAIS (Opcionais):**
                - Nº Chamado: ${details.ticketNumber || ''}
                - Solicitante: ${details.requester || ''}
                - Departamento: ${details.department || ''}
                - Descrição do Chamado: ${details.mainDescriptionInput || ''}

            3.  **CONTEXTO/ASSUNTO GERAL (Opcional):** ${contextText}

            **INSTRUÇÕES PARA O REGISTRO:**

            * **Foco:** Baseie-se **principalmente** na "DESCRIÇÃO DO ANALISTA". Reformule-a de forma técnica e concisa, se necessário, mas mantenha a essência do que foi feito. Exemplo: Se a descrição for "instalação java", o registro pode ser "Realizada instalação do Java Runtime Environment (JRE) versão X na estação de trabalho. Testes de execução de aplicação Java realizados com sucesso."
            * **Inclusão de Detalhes:** **SOMENTE** inclua o Nº Chamado, Solicitante ou Departamento no registro se eles foram **fornecidos** (não estão vazios). Não use placeholders como "[Não informado]". Se fornecidos, integre-os no início (ex: "Referente ao chamado [Numero], solicitado por [Nome] ([Depto]): ...").
            * **Tom Técnico:** Use linguagem técnica apropriada, mas clara. Seja direto. Não adicione saudações como "Olá" ou "Prezado".
            * **Conciso:** Evite informações redundantes. O registro é um resumo factual.
            * **Assinatura:** **Obrigatório** incluir a assinatura completa no final, exatamente como especificado acima.
            * **Saída:** Gere APENAS o texto do registro técnico + assinatura. Sem títulos ou metatexto.
            * * ** Obs: Se a resposta for qualquer outra coisa fora do padrãa, assuntos paralelos, duvidas ou algo que não seja um registro de TI, Gere a resposta: "Sou uma IA contratada apenas para criar registros de TI. Me ajude a te ajudar! :) ".
        `;
        // --- FIM DO NOVO PROMPT ---

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
            outputScript.value = data.text; // Coloca o resultado no campo
            outputScript.readOnly = false; // Permite edição
            showFeedback('Registro gerado com sucesso! Você pode editá-lo.', 'success');

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            outputScript.value = `Erro ao gerar registro: ${error.message}`;
            outputScript.classList.add('error-output');
            outputScript.readOnly = true;
            showFeedback(`Erro: ${error.message}`, 'error');

        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Gerar Registro';
        }
    }

    // --- Event Listeners e Inicialização ---
    generateBtn.addEventListener('click', handleGerarScript);

    copyBtn.addEventListener('click', () => {
        if (outputScript.value && !outputScript.readOnly) {
            navigator.clipboard.writeText(outputScript.value).then(() => {
                showFeedback('Registro copiado!', 'success');
            }).catch(err => {
                console.error('Falha ao copiar: ', err);
                showFeedback('Falha ao copiar. Tente manualmente.', 'error');
            });
        } else if (outputScript.readOnly){
             showFeedback('Não é possível copiar um registro com erro.', 'error');
        } else {
            showFeedback('Não há registro para copiar.', 'error');
        }
    });

    function init() {
        loadTemplates(); // Carrega e popula templates/contextos
    }

    init();
});