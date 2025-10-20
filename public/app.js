document.addEventListener('DOMContentLoaded', function () {
    // --- Referências de Elementos ---
    const mainActionInput = document.getElementById('mainActionInput');
    const templateSelector = document.getElementById('templateSelector'); // Mantido para contexto opcional
    //const dynamicInputsContainer = document.getElementById('dynamic-inputs-container'); // Removido do uso principal
    //const toggleAdvancedBtn = document.getElementById('toggleAdvancedBtn'); // Removido
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
        // Carrega salvos ou define os novos padrões
        if (savedTemplates && Object.keys(JSON.parse(savedTemplates)).length > 0) {
            // Se o usuário já tinha templates customizados, mantém eles
             try {
                templates = JSON.parse(savedTemplates);
             } catch (e) {
                 console.error("Erro ao carregar templates salvos:", e);
                 // Se der erro ao carregar, usa os padrões
                 setDefaultTemplates();
             }
        } else {
             setDefaultTemplates();
        }
        populateTemplateSelector(); 
    }

    // Define os templates padrão
    function setDefaultTemplates() {
         templates = {
            instalacaoSoftware: "Contexto: Instalação de Software",
            configImpressora: "Contexto: Configuração De impressora",
            instalacaoEstacao: "Contexto: Instalação/Configuração de Estação (Física)",
            configRamal: "Contexto: Configuração Ramal",
            solicitacaoEquipamento: "Contexto: Solicitação de equipamento",
            atendimentoGenerico: "Contexto: Atendimento Geral" // Renomeado para clareza
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }


    function populateTemplateSelector() {
        templateSelector.innerHTML = '<option value="">Nenhum Contexto Específico</option>'; // Opção padrão
        if (!templates || Object.keys(templates).length === 0) {
             console.warn("Nenhum template/contexto encontrado.");
             return; 
        }
        
        for (const key in templates) {
            const option = document.createElement('option');
            option.value = key; // A chave ainda pode ser útil
             // Usa o valor do template (o texto "Contexto: ...") como label
            const labelText = templates[key].startsWith("Contexto: ") ? templates[key].substring(10) : key; 
            option.textContent = labelText;
            templateSelector.appendChild(option);
        }
    }

    // Função não mais necessária no fluxo principal, mas pode ser útil para custom templates no futuro
    // function findTemplateVariables(text) { ... } 
    // function renderDynamicInputs(templateKey) { ... }

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 4000); // Feedback um pouco mais curto
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
        showFeedback('A Inteligência Artificial está trabalhando...', 'success'); // Mensagem mais curta

        // Coleta apenas os dados essenciais
        const contextKey = templateSelector.value;
        const contextText = contextKey ? templates[contextKey] : "Nenhum contexto específico selecionado"; // Pega o texto do contexto

        const details = {
            ticketNumber: ticketNumberInput.value.trim(),
            requester: requesterInput.value.trim(),
            department: departmentInput.value.trim()
        };

        // Chama a função que envia para a API
        gerarRegistroTecnico(mainAction, details, contextText); 
    }

    async function gerarRegistroTecnico(mainAction, details, contextText) {
        // --- NOVO PROMPT PARA IA ---
        const prompt = `
            Você é um assistente de IA para Suporte Técnico (TI), especializado em criar registros concisos e técnicos para sistemas de chamados.

            **Tarefa:** Gerar um registro técnico baseado na descrição fornecida pelo analista. O registro deve ser claro, objetivo e focado nos fatos técnicos relevantes.

            **INFORMAÇÕES FORNECIDAS:**

            1.  **DESCRIÇÃO DO ANALISTA (Fonte Principal):**
                ---
                ${mainAction}
                ---

            2.  **DETALHES ADICIONAIS (Opcionais):**
                - Nº Chamado: ${details.ticketNumber || ''} 
                - Solicitante: ${details.requester || ''}
                - Departamento: ${details.department || ''}
            
            3.  **CONTEXTO/ASSUNTO GERAL (Opcional):** ${contextText}

            **INSTRUÇÕES PARA O REGISTRO:**

            * **Foco:** Baseie-se **principalmente** na "DESCRIÇÃO DO ANALISTA". Reformule-a de forma técnica e concisa, se necessário, mas mantenha a essência do que foi feito.
            * **Inclusão de Detalhes:** **SOMENTE** inclua o Nº Chamado, Solicitante ou Departamento no registro se eles foram **fornecidos** (não estão vazios). Não use placeholders como "[Não informado]". Se fornecidos, integre-os de forma natural (ex: "Atendimento ao solicitante [Nome] do depto [Depto] referente ao ticket [Numero]").
            * **Tom Técnico:** Use linguagem técnica apropriada, mas evite jargões excessivos. Seja direto e objetivo. Não adicione saudações ou despedidas (ex: "Prezado", "Atenciosamente").
            * **Conciso:** Evite informações redundantes ou floreios. O registro deve ser um resumo factual do atendimento.
            * **Contexto:** Use o "CONTEXTO/ASSUNTO GERAL" apenas como uma leve indicação do tipo de atendimento, se ajudar a refinar a linguagem técnica.
            * **Saída:** Gere APENAS o texto do registro técnico. Sem títulos, introduções ou metatexto.
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
            generateBtn.textContent = 'Gerar Registro'; // Nome do botão ajustado
        }
    }

    // --- Event Listeners e Inicialização ---
    // Removido o listener para renderizar inputs dinâmicos, pois não são mais o foco
    // templateSelector.addEventListener('change', ...); 

    // Removido o listener do botão toggleAdvancedBtn
    // toggleAdvancedBtn.addEventListener('click', ...);

    generateBtn.addEventListener('click', handleGerarScript); // Chama a função correta

    copyBtn.addEventListener('click', () => {
        if (outputScript.value && !outputScript.readOnly) {
            navigator.clipboard.writeText(outputScript.value).then(() => {
                showFeedback('Registro copiado!', 'success'); // Mensagem mais curta
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