// --- CREATE SHADOW FRAMEBUFFERS, TEXTURES AND LIGHT PROJECTION MATRICES ---
const shadowMapResolution = 2048;
const numLights = 4;
const shadowFramebuffers = [];
const shadowTextures = [];
const lightProjectionMatrices = [];
const lightPositions = [[-1, 2.9, -5.3], [0, 2.9, 0], [-3, 2.9, -3], [-5, 2.9, 0],];
const lookAt = [[-1, 0, -5], [0, 0, 0.3], [-3, 0, -3.3], [-5.3, 0, 0],];

for (let i = 0; i < numLights; i++) {
    shadowFramebuffers[i] = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffers[i]);

    shadowTextures[i] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, shadowTextures[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, shadowMapResolution, shadowMapResolution, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTextures[i], 0);

    lightProjectionMatrices[i] = perspecMat4f(degToRad(160.0), 1.0, 0.0001, 1000);
}

// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(numLights), getFragmentShaderSource(numLights, shadowMapResolution));
const shadowProgram = createAndUseProgram(gl, getShadowVertexShaderSource(), getShadowFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attribLocations = getAllAttribLocations(gl, program);
const attribLocationsShadow = getAllAttribLocations(gl, shadowProgram);
const uniformLocations = getAllUniformLocations(gl, program);
const uniformLocationsShadow = getAllUniformLocations(gl, shadowProgram);

// --- RENDER DEPTH MAPS ---
function renderDepthMap() {
    for (let i = 0; i < numLights; i++) {
        prepareGLState(gl, shadowMapResolution, shadowMapResolution, shadowProgram, shadowFramebuffers[i], gl.BACK);

        gl.uniformMatrix4fv(uniformLocationsShadow["lightViewMatrix"], false, lookAtMat4f(lightPositions[i], lookAt[i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniformLocationsShadow["lightProjectionMatrix"], false, lightProjectionMatrices[i]);
        gl.uniform3fv(uniformLocationsShadow["lightPosition"], lightPositions[i]);

        // Draw scene and drone for depth map
        drawDrawable(gl, sceneDrawable, attribLocationsShadow, uniformLocationsShadow, false);
        drawDrawable(gl, droneDrawable, attribLocationsShadow, uniformLocationsShadow, false);
    }
}

// --- RENDER SCENE WITH SHADOWS ---
function renderScene() {
    prepareGLState(gl, canvas.width, canvas.height, program, null, gl.BACK);

    // Set up view and projection matrices
    gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);
    gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, attachedToDrone ? inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), droneDrawable["modelmatrix"])) : inv4Mat4f(cameraModelMatrix));

    // Set up light view and projection matrices and shadow textures
    for (let i = 0; i < numLights; i++) {
        gl.uniformMatrix4fv(uniformLocations["lightViewMatrices"][i], false, lookAtMat4f(lightPositions[i], lookAt[i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniformLocations["lightProjectionMatrices"][i], false, lightProjectionMatrices[i]);

        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, shadowTextures[i]);
        gl.uniform1i(uniformLocations["shadowTextures"][i], i);
    }

    drawDrawable(gl, sceneDrawable, attribLocations, uniformLocations, true);
    drawDrawable(gl, droneDrawable, attribLocations, uniformLocations, true);
}