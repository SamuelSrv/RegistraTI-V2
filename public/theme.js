document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // --- CAMINHOS DOS ÍCONES ---
    // Ajuste 'img/modo-claro.png' se você tiver um ícone diferente para o tema claro
    const lightModeIcon = 'img/modo-escuro.png'; // Ícone para mostrar no tema claro (lua/escuro)
    const darkModeIcon = 'img/modo-claro.png';  // Ícone para mostrar no tema escuro (sol/claro) - USE O MESMO SE NÃO TIVER OUTRO
    const defaultIcon = 'img/modo-escuro.png'; // Ícone padrão a ser usado se um dos acima falhar

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeIcon) {
            // Define o ícone correto com base no tema atual
            themeIcon.src = savedTheme === 'dark' ? darkModeIcon : lightModeIcon;
            themeIcon.alt = `Mudar para tema ${savedTheme === 'dark' ? 'claro' : 'escuro'}`;
            // Fallback caso a imagem não carregue
             themeIcon.onerror = () => { themeIcon.src = defaultIcon; };
        }
    }

    if (themeToggle && themeIcon) { // Garante que ambos existam
        themeToggle.addEventListener('click', () => {
            // Adiciona a classe de animação (se existir no CSS)
            if (themeIcon.classList) { // Verifica se classList é suportado
                 themeIcon.classList.add('spin-animation');
            }

            let currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Atualiza a imagem do ícone para refletir o novo estado
            themeIcon.src = newTheme === 'dark' ? darkModeIcon : lightModeIcon;
            themeIcon.alt = `Mudar para tema ${newTheme === 'dark' ? 'claro' : 'escuro'}`;
             themeIcon.onerror = () => { themeIcon.src = defaultIcon; }; // Fallback

            // Remove a classe após a animação terminar
             if (themeIcon.classList) {
                setTimeout(() => {
                    themeIcon.classList.remove('spin-animation');
                }, 500); // Duração da animação em ms
             }
        });
    }

    // Aplica o tema salvo assim que a página carrega
    applyTheme();
});