// --- CREATE SHADOW FRAMEBUFFERS, TEXTURES AND LIGHT PROJECTION MATRICES ---
const lights = { "res": 2048, "num": 4, "framebuf": [], "tex": [], "proj": [], "pos": [[-1, 2.9, -5.3], [0, 2.9, 0], [-3, 2.9, -3], [-5, 2.9, 0]], "look": [[-1, 0, -5], [0, 0, 0.3], [-3, 0, -3.3], [-5.3, 0, 0]] }

for (let i = 0; i < lights["num"]; i++) {
    let lightData = createLight(gl, lights["res"], 160.0);
    lights["framebuf"][i] = lightData[0];
    lights["tex"][i] = lightData[1];
    lights["proj"][i] = lightData[2];
}

// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(lights["num"]), getFragmentShaderSource(lights["num"], lights["res"]));
const shadowProgram = createAndUseProgram(gl, getShadowVertexShaderSource(), getShadowFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attribLocations = getAllAttribLocations(gl, program);
const attribLocationsShadow = getAllAttribLocations(gl, shadowProgram);
const uniformLocations = getAllUniformLocations(gl, program);
const uniformLocationsShadow = getAllUniformLocations(gl, shadowProgram);

// --- RENDER DEPTH MAPS ---
function renderDepthMap() {
    for (let i = 0; i < lights["num"]; i++) {
        prepareGLState(gl, lights["res"], lights["res"], shadowProgram, lights["framebuf"][i], gl.BACK);

        gl.uniformMatrix4fv(uniformLocationsShadow["l_viewmat"], false, lookAtMat4f(lights["pos"][i], lights["look"][i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniformLocationsShadow["l_projmat"], false, lights["proj"][i]);
        gl.uniform3fv(uniformLocationsShadow["l_pos"], lights["pos"][i]);

        // Draw scene and drone for depth map
        drawDrawable(gl, sceneDrawable, attribLocationsShadow, uniformLocationsShadow, false);
        drawDrawable(gl, droneDrawable, attribLocationsShadow, uniformLocationsShadow, false);
    }
}

// --- RENDER SCENE WITH SHADOWS ---
function renderScene() {
    prepareGLState(gl, canvas.width, canvas.height, program, null, gl.BACK);

    // Set up view and projection matrices
    gl.uniformMatrix4fv(uniformLocations["projmat"], false, projectionmatrix);
    gl.uniformMatrix4fv(uniformLocations["viewmat"], false, attachedToDrone ? inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), droneDrawable["modelmatrix"])) : inv4Mat4f(cameraModelMatrix));

    // Set up light view and projection matrices and shadow textures
    for (let i = 0; i < lights["num"]; i++) {
        gl.uniformMatrix4fv(uniformLocations["l_viewmat"][i], false, lookAtMat4f(lights["pos"][i], lights["look"][i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniformLocations["l_projmat"][i], false, lights["proj"][i]);

        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, lights["tex"][i]);
        gl.uniform1i(uniformLocations["l_tex"][i], i);
    }

    drawDrawable(gl, sceneDrawable, attribLocations, uniformLocations, true);
    drawDrawable(gl, droneDrawable, attribLocations, uniformLocations, true);
}