let apiKey = '';
const apiUrl = 'https://api.openai.com/v1/chat/completions';
let chatHistory = [];

function sendMessage() {
    const userMessage = document.getElementById('chatInput').value;

    // WebGL code to capture the screen and convert it to a base64 image
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

    // Append the new user message to the chat history
    chatHistory.push({
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
    });

    const requestBody = {
        model: 'gpt-4-turbo',
        messages: chatHistory
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
            document.getElementById("chat-submit").classList.remove("is-loading");
            document.getElementById("chat-submit").disabled = false;
            document.getElementById("chatInput").disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("chat-submit").classList.remove("is-loading");
            document.getElementById("chat-submit").disabled = false;
            document.getElementById("chatInput").disabled = false;
        });
}


function displayMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `${role}: ${content}\n`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
    const chatSubmit = document.getElementById("chat-submit");
    const chatInput = document.getElementById("chatInput");
    const apiKeySubmit = document.getElementById("api-key-submit");
    const apiKeyInput = document.getElementById("apiKeyInput");
    chatSubmit.addEventListener('click', () => {
        chatSubmit.classList.add("is-loading");
        chatSubmit.disabled = true;
        chatInput.disabled = true;
        sendMessage();
    });
    apiKeySubmit.addEventListener("click", () => {
        if (apiKeyInput.value.trim() === "") {
            apiKeyInput.classList.add("is-danger");
        } else {
            apiKey = apiKeyInput.value;
            apiKeyInput.disabled = true;
            apiKeySubmit.disabled = true;
            checkOpenAIApiKey(apiKey)
                .then(isValid => {
                    if (isValid) {
                        apiKeyInput.classList.remove("is-danger");
                        apiKeyInput.classList.add("is-success");
                        chatSubmit.disabled = false;
                        chatInput.disabled = false;
                        apiKeySubmit.disabled = false;
                        apiKeyInput.disabled = false;
                    } else {
                        apiKeyInput.classList.add("is-danger");
                        apiKeyInput.classList.remove("is-success");
                        chatSubmit.disabled = true;
                        chatInput.disabled = true;
                        apiKeySubmit.disabled = false;
                        apiKeyInput.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    apiKeyInput.classList.add("is-danger");
                    apiKeyInput.classList.remove("is-success");
                    chatSubmit.disabled = true;
                    chatInput.disabled = true;
                    apiKeySubmit.disabled = false;
                    apiKeyInput.disabled = false;
                });
        }
    });
});

function checkOpenAIApiKey(apiKey) {
    const apiUrl = 'https://api.openai.com/v1/models';
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };

    return fetch(apiUrl, requestOptions)
        .then(response => {
            if (response.ok) {
                return true;
            } else {
                return false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
}