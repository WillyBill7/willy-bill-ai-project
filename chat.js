// File: api/chat.js
// This code runs on the Vercel server, not the user's browser.
// It uses Node.js and the 'node-fetch' equivalent available on Vercel.

export default async function handler(request, response) {
    // 1. Check for POST request
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Get the prompt from the request body
        const { prompt } = request.body;

        if (!prompt) {
            return response.status(400).json({ error: 'Missing prompt in request body' });
        }

        // 3. Check for API Key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OPENAI_API_KEY environment variable not set.');
            return response.status(500).json({ error: 'Server AI Key is missing.' });
        }
        
        // 4. Call the OpenAI API (Using a simple model)
        const openaiUrl = 'https://api.openai.com/v1/chat/completions';
        
        const apiResponse = await fetch(openaiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // You can change this to a different model
                messages: [
                    { role: "system", content: "You are Willy Bill AI, a helpful, friendly, and slightly humorous chatbot." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!apiResponse.ok) {
            // Log detailed error from OpenAI
            const errorData = await apiResponse.json();
            console.error('OpenAI API Error:', errorData);
            return response.status(apiResponse.status).json({ error: 'External AI API failed.' });
        }

        const data = await apiResponse.json();
        
        // 5. Extract and return the AI's response
        const aiResponse = data.choices[0].message.content.trim();
        
        response.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error('Internal Server Error:', error);
        response.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
}