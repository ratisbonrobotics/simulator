let apiKey = '';
const apiUrl = 'https://api.openai.com/v1/chat/completions';

function sendMessage() {
    const userMessage = document.getElementById('chatInput').value;
    // Assume canvas is your <canvas> element and gl is the WebGL context
    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('webgl');
    let width = canvas.width;
    let height = canvas.height;
    var pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log(pixels);

    // Create a new canvas to use as a buffer
    var bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = width;
    bufferCanvas.height = height;
    var ctx = bufferCanvas.getContext('2d');

    // Create ImageData and set the pixels
    var imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    // Export the canvas content as an image
    var imgURL = bufferCanvas.toDataURL(); // Creates a PNG image by default

    console.log(imgURL);


    /*
        const requestBody = {
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that can describe images.'
                },
                {
                    role: 'user',
                    content: userMessage
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
                });*/
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