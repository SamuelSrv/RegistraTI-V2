document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Nomes dos arquivos de ícone - ajuste se os seus forem diferentes
    const lightModeIcon = 'img/icon-light.png'; 
    const darkModeIcon = 'img/icon-dark.png';  

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeIcon) {
            themeIcon.src = savedTheme === 'dark' ? darkModeIcon : lightModeIcon;
            themeIcon.alt = `Mudar para tema ${savedTheme === 'dark' ? 'claro' : 'escuro'}`;
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            themeIcon.classList.add('spin-animation'); // Inicia animação
            let currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeIcon.src = newTheme === 'dark' ? darkModeIcon : lightModeIcon;
            themeIcon.alt = `Mudar para tema ${newTheme === 'dark' ? 'claro' : 'escuro'}`;
            
            setTimeout(() => {
                themeIcon.classList.remove('spin-animation'); // Remove após a animação
            }, 500); // Duração da animação
        });
    }

    // Adiciona o estilo para a animação do ícone
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spin-animation {
            animation: spin 0.5s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    applyTheme();
});