document.addEventListener('DOMContentLoaded', function () {
    // --- Referências de Elementos ---
    const templatesListContainer = document.getElementById('templates-list-container');
    const templateKeyInput = document.getElementById('templateKeyInput');
    const templateValueInput = document.getElementById('templateValueInput');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const feedbackMessage = document.getElementById('feedbackMessage');

    let templates = {};
    const STORAGE_KEY = 'aiScriptTemplates'; // <<< Chave correta

    // --- Funções ---

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }

    function loadTemplates() {
        const savedTemplates = localStorage.getItem(STORAGE_KEY);
        templates = savedTemplates ? JSON.parse(savedTemplates) : {};
        renderTemplatesList();
    }

    function saveTemplates() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        loadTemplates(); 
        clearForm(); 
    }

    function renderTemplatesList() {
        templatesListContainer.innerHTML = ''; 
        if (Object.keys(templates).length === 0) {
            templatesListContainer.innerHTML = '<p style="text-align: center; opacity: 0.7;">Nenhum modelo personalizado salvo. Os modelos padrão aparecerão aqui se você limpar o armazenamento do navegador.</p>';
            return;
        }

        for (const key in templates) {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card'; 

            const templateName = document.createElement('strong');
            templateName.textContent = key;
            
            const templatePreview = document.createElement('p');
            // Mostra o texto do modelo, não apenas "Contexto: ..."
            templatePreview.textContent = templates[key].substring(0, 150) + '...'; 

            const btnGroup = document.createElement('div');
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'btn-secondary';
            editBtn.style.width = 'auto'; 
            editBtn.onclick = () => editTemplate(key);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.className = 'btn-delete'; 
            deleteBtn.style.width = 'auto'; 
            deleteBtn.onclick = () => deleteTemplate(key);
            
            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(deleteBtn);
            templateCard.appendChild(templateName);
            templateCard.appendChild(templatePreview);
            templateCard.appendChild(btnGroup);

            templatesListContainer.appendChild(templateCard);
        }
    }

    function editTemplate(key) {
        templateKeyInput.value = key;
        templateValueInput.value = templates[key]; // Carrega o conteúdo real
        templateKeyInput.readOnly = true; 
        templateValueInput.focus();
        window.scrollTo(0, document.body.scrollHeight); 
    }

    function deleteTemplate(key) {
        if (confirm(`Tem certeza que deseja excluir o modelo "${key}"?`)) {
            delete templates[key];
            saveTemplates(); 
            showFeedback('Modelo excluído com sucesso!', 'success');
        }
    }

    function clearForm() {
        templateKeyInput.value = '';
        templateValueInput.value = '';
        templateKeyInput.readOnly = false;
        templateKeyInput.focus();
    }

    // --- Event Listeners ---

    saveTemplateBtn.addEventListener('click', () => {
        const key = templateKeyInput.value.trim();
        const value = templateValueInput.value.trim();

        if (!key || !value) {
            showFeedback('Nome-Chave e Conteúdo são obrigatórios.', 'error');
            return;
        }

        if (key.includes(' ') || !/^[a-zA-Z0-9]+$/.test(key)) {
            showFeedback('O Nome-Chave deve conter apenas letras e números, sem espaços.', 'error');
            return;
        }

        const isEditing = templateKeyInput.readOnly; 
        templates[key] = value; 
        saveTemplates();
        showFeedback(`Modelo ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`, 'success');
    });

    clearFormBtn.addEventListener('click', clearForm);

    // Inicialização
    loadTemplates();
});