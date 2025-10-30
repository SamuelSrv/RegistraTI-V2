<p align="center">
  <img src="https://registrati-v2.netlify.app/img/logo-barra.png" alt="Logo Padroniza TI" width="200"/>
</p>

<h1 align="center">
  Padroniza TI
</h1>

<p align="center">
  Um assistente de IA para padronizar e agilizar a criação de registros de chamados de Suporte Técnico.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Funcional-brightgreen?style=for-the-badge" alt="Status do Projeto: Funcional">
  <img src="https://img.shields.io/badge/Licença-MIT-blue?style=for-the-badge" alt="Licença MIT">
</p>

---

## 🎯 Sobre o Projeto

Sabe quando você termina um atendimento de TI e precisa parar para escrever aquele registro formal no sistema de chamados? Repetir as mesmas frases, garantir o tom profissional, lembrar de todos os detalhes... isso pode ser cansativo e tomar um tempo precioso do dia.

O **Padroniza TI** nasceu exatamente dessa necessidade.

A ideia é simples: você descreve o que foi feito de forma rápida e humana (como *"instalei o Office na máquina do Carlos"*) e a ferramenta usa a IA do Google (Gemini) para transformar isso em um registro técnico, completo e padronizado, pronto para ser copiado e colado.

É uma ferramenta de analista para analista, pensada para economizar tempo e manter a qualidade dos nossos registros sempre alta!

## ✨ Recursos Principais

O sistema foi construído para ser simples, mas poderoso:

* **Geração com IA:** Utiliza a API do Google Gemini (`gemini-2.5-flash`) para criar registros técnicos e concisos a partir de descrições simples.
* **Contexto Rápido:** Permite adicionar rapidamente os detalhes essenciais (Nº Chamado, Solicitante, Departamento) que são inteligentemente incluídos no texto final, *apenas se forem preenchidos*.
* **Templates de Contexto:** Vem com uma lista de "Contextos" pré-definidos para os atendimentos mais comuns (Instalação de Software, Configuração de Impressora, etc.).
* **Assinatura Automática:** Inclui automaticamente a sua assinatura de equipe ("Atenciosamente, Ibrowse / NTI-RS") em todos os registros gerados.
* **100% Customizável:** Crie, edite e salve seus próprios modelos personalizados na página "Gerenciar Modelos".
* **Tema Claro/Escuro:** Adapta-se à sua preferência de visualização e salva no navegador.
* **"Copiar" com um Clique:** Botão para copiar o registro gerado instantaneamente.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com foco em leveza e performance, usando:

* **HTML5** Semântico
* **CSS3** Moderno (com Variáveis de Tema)
* **JavaScript (ES6+)** (Puro, sem frameworks)
* **Google Gemini API** (Modelo `gemini-2.5-flash`)
* **Netlify Functions** (para o back-end seguro da API)
* **`localStorage`** (para salvar o tema e os modelos do usuário)

## 🔧 Como Usar (Para Desenvolvedores)

Se você quiser clonar e rodar este projeto, o passo mais importante é configurar a API do Google.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SamuelSrv/RegistraTI-V2.git](https://github.com/SamuelSrv/RegistraTI-V2.git)
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Google Cloud:**
    * Vá ao **Google AI Studio** (ou Google Cloud Console).
    * Crie um **novo projeto**.
    * Habilite a **"Gemini API"** (e por segurança, a **"Vertex AI API"**).
    * **Vincule uma Conta de Faturamento** (Billing Account) ao projeto (esta etapa é obrigatória pelo Google, mesmo para o plano gratuito).
    * Gere uma **Chave de API** (API Key).

4.  **Configure o Netlify:**
    * Faça o deploy do seu clone para o Netlify (conectando ao seu GitHub).
    * No painel do seu site no Netlify, vá em **Site configuration > Build & deploy > Environment**.
    * Adicione uma variável de ambiente:
        * **Key:** `GOOGLE_API_KEY`
        * **Value:** `SUA_CHAVE_DE_API_GERADA_NO_GOOGLE`

5.  **Faça o Deploy:**
    * Vá na aba "Deploys" e clique em **"Trigger deploy" > "Clear cache and deploy site"** para garantir que a variável de ambiente seja lida.
    * Pronto! Seu assistente pessoal de IA está no ar.

---

## 👨‍💻 Autor

Feito com ❤️ por **SamuelSrv** (2025).

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/samuelsrv/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SamuelSrv/RegistraTI-V2)
