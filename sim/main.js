const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

// Create a depth renderbuffer
const depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);

// Attach the depth renderbuffer to the framebuffer
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

const pixelData = [];

const urlParams = new URLSearchParams(window.location.search);
const sceneIndex = urlParams.get("scene") ? parseInt(urlParams.get("scene")) : 0;
const scene_configurations = [
    {"path": '/sim/data/scene0/scene.obj.gz', "dronemodelmatrix": modelMat4f(-2.0, 1.0, -2.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01)},
    {"path": '/sim/data/scene1/scene.obj.gz', "dronemodelmatrix": modelMat4f(-3.0, 1.0, -3.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01)}
];
const activeScene = scene_configurations[sceneIndex];

// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(), getFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attrib_locs = getAllAttribLocations(gl, program);
const uniform_locs = getAllUniformLocations(gl, program);

// --- RENDER SCENE ---
function renderScene() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up view and projection matrices
    gl.uniformMatrix4fv(uniform_locs["projmat"], false, projectionmatrix);
    gl.uniformMatrix4fv(uniform_locs["viewmat"], false, 
        attachedToDrone ? 
        inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), drone_drawable["modelmatrix"])) :
        inv4Mat4f(viewmatrix)
    );

    gl.activeTexture(gl.TEXTURE16);
    gl.uniform1i(uniform_locs["tex"], 16);

    // draw scene
    gl.uniformMatrix4fv(uniform_locs["modelmat"], false, scene_drawable["modelmatrix"]);
    for (let p = 0; p < scene_drawable["vertexbuffer"].length; p++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_drawable["vertexbuffer"][p]["verticies"], attrib_locs["vertexpos"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_drawable["normalbuffer"][p], attrib_locs["vertexnorm"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_drawable["texcoordbuffer"][p], attrib_locs["texcoord"], 2);

        gl.bindTexture(gl.TEXTURE_2D, scene_drawable["texture"][p]);
        gl.uniform3fv(uniform_locs["Ka"], scene_drawable["material"][p]["Ka"]);
        
        gl.drawArrays(gl.TRIANGLES, 0, scene_drawable["vertexbuffer"][p]["n_verticies"]);
    }

    // draw drone
    gl.uniformMatrix4fv(uniform_locs["modelmat"], false, drone_drawable["modelmatrix"]);
    for (let p = 0; p < drone_drawable["vertexbuffer"].length; p++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_drawable["vertexbuffer"][p]["verticies"], attrib_locs["vertexpos"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_drawable["normalbuffer"][p], attrib_locs["vertexnorm"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_drawable["texcoordbuffer"][p], attrib_locs["texcoord"], 2);

        gl.bindTexture(gl.TEXTURE_2D, drone_drawable["texture"][p]);
        gl.uniform3fv(uniform_locs["Ka"], drone_drawable["material"][p]["Ka"]);
        
        gl.drawArrays(gl.TRIANGLES, 0, drone_drawable["vertexbuffer"][p]["n_verticies"]);
    }  
}

// --- GET DATA FROM 3D FILES ---
let scene_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "verticies": [], "keys": [] };
let drone_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": activeScene["dronemodelmatrix"], "verticies": [], "keys": [] };

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/sim/data/drone.obj', drone_drawable);
    await loadDrawable(activeScene["path"], scene_drawable);
    document.getElementById('loading_overlay').style.display = 'none';
    drawScene();
})();

// --- MAIN LOOP ---
function downloadFrame(pixels, width, height, frameNumber) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const index = (i * width + j) * 4;
            const flippedIndex = ((height - i - 1) * width + j) * 4;
            imageData.data[index] = pixels[flippedIndex];
            imageData.data[index + 1] = pixels[flippedIndex + 1];
            imageData.data[index + 2] = pixels[flippedIndex + 2];
            imageData.data[index + 3] = pixels[flippedIndex + 3];
        }
    }
    ctx.putImageData(imageData, 0, 0);

    const link = document.createElement('a');
    link.download = `frame_${frameNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadVideo(frames, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.webm';
        a.click();
        URL.revokeObjectURL(url);
    };

    recorder.start();

    let i = 0;
    function processFrame() {
        if (i < frames.length) {
            const imageData = ctx.createImageData(width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const flippedIndex = ((height - y - 1) * width + x) * 4;
                    imageData.data[index] = frames[i][flippedIndex];
                    imageData.data[index + 1] = frames[i][flippedIndex + 1];
                    imageData.data[index + 2] = frames[i][flippedIndex + 2];
                    imageData.data[index + 3] = frames[i][flippedIndex + 3];
                }
            }
            ctx.putImageData(imageData, 0, 0);
            i++;
            setTimeout(processFrame, 1000 / 30); // 30 FPS
        } else {
            recorder.stop();
        }
    }

    processFrame();
}

// --- MAIN LOOP ---
let frameCount = 0;

function drawScene() {
    renderScene();

    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    //pixelData.push(pixels);

    // Get the 2D rendering context of the canvas
    const ctx = canvas2.getContext('2d');
    const imageData = ctx.createImageData(canvas2.width, canvas2.height);
    
    for (let i = 0; i < canvas2.height; i++) {
        for (let j = 0; j < canvas2.width; j++) {
            const index = (i * canvas2.width + j) * 4;
            const flippedIndex = ((canvas2.height - i - 1) * canvas2.width + j) * 4;
            imageData.data[index] = pixels[flippedIndex];
            imageData.data[index + 1] = pixels[flippedIndex + 1];
            imageData.data[index + 2] = pixels[flippedIndex + 2];
            imageData.data[index + 3] = pixels[flippedIndex + 3];
        }
    }
    
    ctx.putImageData(imageData, 0, 0);


    /*frameCount++;

    if (frameCount === 100) {
        downloadVideo(pixelData, canvas.width, canvas.height);
    } else {
        requestAnimationFrame(drawScene);
    }*/
    requestAnimationFrame(drawScene);
}