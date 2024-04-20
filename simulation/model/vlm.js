let apiKey = '';
const apiUrl = 'https://api.openai.com/v1/chat/completions';

function sendMessage() {
    const userMessage = document.getElementById('chatInput').value;

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4); // 4 components per pixel: RGBA
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var can = document.createElement("canvas");
    can.width = width;
    can.height = height;
    var ctx = can.getContext("2d");
    var imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    // Flip the image data vertically (WebGL's readPixels reads bottom to top)
    for (let y = 0; y < height / 2; y++) {
        for (let x = 0; x < width; x++) {
            for (let c = 0; c < 4; c++) {
                let topIdx = (x + y * width) * 4 + c;
                let bottomIdx = (x + (height - 1 - y) * width) * 4 + c;
                let temp = imageData.data[topIdx];
                imageData.data[topIdx] = imageData.data[bottomIdx];
                imageData.data[bottomIdx] = temp;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
    var url = can.toDataURL();
    console.log(url);


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