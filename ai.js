const axios = require('axios');

async function generateArticleContent(prompt) {
    const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';
 
    const requestBody = {
        prompt: prompt,
        max_tokens: 200, // Adjust this value based on your desired article length
        temperature: 0.7, // Adjust this value to control the creativity of the generated content
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY', // Replace with your OpenAI API key
    };

    try {
        const response = await axios.post(apiUrl, requestBody, { headers });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

module.exports = {
    generateArticleContent,
};
