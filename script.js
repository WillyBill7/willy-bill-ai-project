document.getElementById('chat-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const inputField = document.getElementById('user-input');
    const outputDiv = document.getElementById('chat-output');
    const sendButton = document.getElementById('send-button');
    const userMessage = inputField.value.trim();

    if (userMessage === '') return;

    // 1. Display User Message
    appendMessage(userMessage, 'user');
    inputField.value = '';
    sendButton.disabled = true;
    sendButton.textContent = 'Thinking...';

    // Remove initial prompt
    const initialPrompt = outputDiv.querySelector('.alert-info');
    if (initialPrompt) initialPrompt.remove();

    // 2. Display AI placeholder message
    const aiPlaceholder = appendMessage('...', 'ai', true);

    try {
        // 3. Send request to Vercel API endpoint
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userMessage })
        });

        if (!response.ok) {
            throw new Error('AI API Error: ' + response.statusText);
        }

        const data = await response.json();

        // 4. Update placeholder with AI response
        aiPlaceholder.innerHTML = data.response || 'Sorry, I couldn\'t get a response from the AI.';

    } catch (error) {
        console.error('Fetch error:', error);
        aiPlaceholder.innerHTML = 'Error: Failed to connect to Willy Bill AI.';
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
        // Scroll to the bottom
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
});

function appendMessage(text, sender, isPlaceholder = false) {
    const outputDiv = document.getElementById('chat-output');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
        messageDiv.className = 'user-message';
        messageDiv.textContent = text;
    } else {
        messageDiv.className = 'ai-message';
        // Use innerHTML for the AI response to allow for markdown/HTML formatting if needed
        messageDiv.innerHTML = text; 
    }

    outputDiv.appendChild(messageDiv);
    outputDiv.scrollTop = outputDiv.scrollHeight; // Auto-scroll
    
    // Return the element reference if it's a placeholder
    if (isPlaceholder) {
        return messageDiv;
    }
}