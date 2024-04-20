let apiKey = '';
const apiUrl = 'https://api.openai.com/v1/chat/completions';

function sendMessage() {
    const userMessage = document.getElementById('chatInput').value;

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    const halfHeight = Math.floor(height / 2);
    const rowBytes = width * 4;
    for (let y = 0; y < halfHeight; y++) {
        const topOffset = y * rowBytes;
        const bottomOffset = (height - 1 - y) * rowBytes;
        for (let x = 0; x < rowBytes; x++) {
            const temp = imageData.data[topOffset + x];
            imageData.data[topOffset + x] = imageData.data[bottomOffset + x];
            imageData.data[bottomOffset + x] = temp;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    const base64Image = canvas.toDataURL();

    const requestBody = {
        model: 'gpt-4-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are an AI assistant that can describe images.'
            },
            {
                role: 'user',
                content: [
                    {
                        type: "text",
                        text: userMessage
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: base64Image
                        }
                    }
                ]
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
            const modelResponse = data.choices[0].message.content;
            displayMessage('user', userMessage);
            displayMessage('assistant', modelResponse);
            document.getElementById('chatInput').value = '';
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function setApiKey() {
    apiKey = document.getElementById('apiKeyInput').value;
}

function displayMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${role}:</strong> ${content}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.querySelector('.chat-submit').addEventListener('click', sendMessage);
document.querySelector('.api-key-submit').addEventListener('click', setApiKey);