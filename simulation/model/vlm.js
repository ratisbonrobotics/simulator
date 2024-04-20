let apiKey = '';
const apiUrl = 'https://api.openai.com/v1/chat/completions';
const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg';

const requestBody = {
    model: 'gpt-4-turbo',
    messages: [
        {
            role: 'system',
            content: 'You are an AI assistant that can describe images.'
        },
        {
            role: 'user',
            content: `Please describe the image at this URL: ${imageUrl}`
        }
    ]
};

const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
};

fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => {
        const imageDescription = data.choices[0].message.content;
        console.log(imageDescription);
    })
    .catch(error => {
        console.error('Error:', error);
    });