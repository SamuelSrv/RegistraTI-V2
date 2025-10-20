document.addEventListener('DOMContentLoaded', function () {
    // --- Referências de Elementos ---
    const templatesListContainer = document.getElementById('templates-list-container');
    const templateKeyInput = document.getElementById('templateKeyInput');
    const templateValueInput = document.getElementById('templateValueInput');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const feedbackMessage = document.getElementById('feedbackMessage');

    let templates = {};
    const STORAGE_KEY = 'aiScriptTemplates'; // <<< GARANTINDO QUE USA A MESMA CHAVE DO app.js

    // --- Funções ---

    // Exibe feedback para o usuário (sucesso/erro)
    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }

    // Carrega templates do localStorage
    function loadTemplates() {
        const savedTemplates = localStorage.getItem(STORAGE_KEY);
        templates = savedTemplates ? JSON.parse(savedTemplates) : {};
        renderTemplatesList();
    }

    // Salva os templates no localStorage
    function saveTemplates() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        loadTemplates(); // Recarrega a lista para mostrar as mudanças
        clearForm(); // Limpa o formulário após salvar
    }

    // Desenha os cards de templates na tela
    function renderTemplatesList() {
        templatesListContainer.innerHTML = ''; // Limpa a lista antiga
        if (Object.keys(templates).length === 0) {
            templatesListContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">Nenhum modelo personalizado salvo.</p>';
            return;
        }

        for (const key in templates) {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card'; // Estilizado no style.css

            const templateName = document.createElement('strong');
            templateName.textContent = key;

            const templatePreview = document.createElement('p');
            templatePreview.textContent = templates[key].substring(0, 100) + '...';

            const btnGroup = document.createElement('div');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'btn-secondary';
            editBtn.style.width = 'auto'; // Ajuste para botões menores
            editBtn.onclick = () => editTemplate(key);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.className = 'btn-delete'; // Estilizado no style.css
            deleteBtn.style.width = 'auto'; // Ajuste para botões menores
            deleteBtn.onclick = () => deleteTemplate(key);

            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(deleteBtn);
            templateCard.appendChild(templateName);
            templateCard.appendChild(templatePreview);
            templateCard.appendChild(btnGroup);

            templatesListContainer.appendChild(templateCard);
        }
    }

    // Preenche o formulário para edição
    function editTemplate(key) {
        templateKeyInput.value = key;
        templateValueInput.value = templates[key];
        templateKeyInput.readOnly = true; // Impede a edição da chave (nome)
        templateValueInput.focus();
        window.scrollTo(0, document.body.scrollHeight); // Rola para o final da página
    }

    // Deleta um template
    function deleteTemplate(key) {
        if (confirm(`Tem certeza que deseja excluir o modelo "${key}"?`)) {
            delete templates[key];
            saveTemplates(); // Salva a remoção
            showFeedback('Modelo excluído com sucesso!', 'success');
        }
    }

    // Limpa o formulário de edição
    function clearForm() {
        templateKeyInput.value = '';
        templateValueInput.value = '';
        templateKeyInput.readOnly = false;
        templateKeyInput.focus();
    }

    // --- Event Listeners ---

    // Botão de Salvar
    saveTemplateBtn.addEventListener('click', () => {
        const key = templateKeyInput.value.trim();
        const value = templateValueInput.value.trim();

        if (!key || !value) {
            showFeedback('Nome-Chave e Conteúdo são obrigatórios.', 'error');
            return;
        }

        // Validação simples para a chave (sem espaços ou caracteres especiais)
        if (key.includes(' ') || !/^[a-zA-Z0-9]+$/.test(key)) {
            showFeedback('O Nome-Chave deve conter apenas letras e números, sem espaços.', 'error');
            return;
        }

        const isEditing = templateKeyInput.readOnly; // Verifica se está editando
        templates[key] = value; // Adiciona ou sobrescreve o modelo
        saveTemplates();
        showFeedback(`Modelo ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`, 'success');
        // clearForm() é chamado dentro de saveTemplates() agora
    });

    // Botão de Limpar
    clearFormBtn.addEventListener('click', clearForm);

    // Inicialização
    loadTemplates();
});