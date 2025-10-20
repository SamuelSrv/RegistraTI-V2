const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o cliente FORA do handler para reutilização em cold starts
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Define o modelo globalmente para o Flash
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'O prompt é obrigatório.' }) };
        }
        
        // Usa o modelo já inicializado
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ text: text }),
        };

    } catch (error) {
        // Melhor tratamento de erro para logs
        console.error('Erro na função Netlify:', error);
        
        let errorMessage = 'Ocorreu um erro desconhecido ao processar sua solicitação.';
        if (error instanceof GoogleGenerativeAIFetchError) {
             errorMessage = `Erro da API Google (${error.status}): ${error.message}`;
        } else if (error.message) {
            errorMessage = `Erro interno: ${error.message}`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage }),
        };
    }
};