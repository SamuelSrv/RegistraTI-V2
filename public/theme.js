document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // --- CAMINHOS DOS ÍCONES ---
    const lightModeIcon = 'img/modo-escuro.png'; // Ícone para mostrar no tema claro (lua/escuro)
    // Se você NÃO tiver 'modo-claro.png', ele usará o 'defaultIcon' abaixo
    const darkModeIcon = 'img/modo-claro.png';  
    const defaultIcon = 'img/modo-escuro.png'; // Ícone padrão a ser usado se um dos acima falhar ou não existir

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeIcon) {
            // Define o ícone correto com base no tema atual
            themeIcon.src = savedTheme === 'dark' ? darkModeIcon : lightModeIcon;
            themeIcon.alt = `Mudar para tema ${savedTheme === 'dark' ? 'claro' : 'escuro'}`;
            // Fallback MUITO importante caso a imagem não carregue
             themeIcon.onerror = () => { 
                 console.warn(`Ícone não encontrado: ${themeIcon.src}. Usando fallback.`);
                 themeIcon.src = defaultIcon; 
                 themeIcon.onerror = null; // Evita loop de erro se o fallback também falhar
            };
        }
    }

    if (themeToggle && themeIcon) { // Garante que ambos existam
        themeToggle.addEventListener('click', () => {
            if (themeIcon.classList) { 
                 themeIcon.classList.add('spin-animation');
            }

            let currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            themeIcon.src = newTheme === 'dark' ? darkModeIcon : lightModeIcon;
            themeIcon.alt = `Mudar para tema ${newTheme === 'dark' ? 'claro' : 'escuro'}`;
             themeIcon.onerror = () => { 
                 console.warn(`Ícone não encontrado: ${themeIcon.src}. Usando fallback.`);
                 themeIcon.src = defaultIcon; 
                 themeIcon.onerror = null; 
            }; 

             if (themeIcon.classList) {
                setTimeout(() => {
                    themeIcon.classList.remove('spin-animation');
                }, 500); 
             }
        });
    }

    // Aplica o tema salvo assim que a página carrega
    applyTheme();
});