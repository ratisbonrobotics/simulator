// --- CREATE DEPTH FRAMEBUFFERS, TEXTURES AND LIGHT PROJECTION MATRICES ---
const lights = { "res": 2048, "num": 3, "framebuf": gl.createFramebuffer(), "tex": [], "proj": [], "pos": [[-5, 2.9, -4.3], [1, 2.9, 0.5], [-4, 2.9, 2]], "look": [[-5, 0, -4], [1, 0, 0.8], [-4.3, 0, 2.3]] }

lights["tex"] = Array.from({ length: lights["num"] }, () => createDepthMap(gl, lights["res"]));
lights["proj"] = Array.from({ length: lights["num"] }, () => perspecMat4f(degToRad(160.0), 1.0, 0.0001, 1000));

// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(lights["num"]), getFragmentShaderSource(lights["num"], lights["res"]));
const depth_program = createAndUseProgram(gl, getDepthVertexShaderSource(), getDepthFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attrib_locs = getAllAttribLocations(gl, program);
const attrib_locs_depth = getAllAttribLocations(gl, depth_program);
const uniform_locs = getAllUniformLocations(gl, program);
const uniform_locs_depth = getAllUniformLocations(gl, depth_program);

// --- RENDER DEPTH MAPS ---
function renderDepthMap() {
    for (let i = 0; i < lights["num"]; i++) {
        prepareGLState(gl, lights["res"], lights["res"], depth_program, lights["framebuf"], lights["tex"][i]);
        gl.uniformMatrix4fv(uniform_locs_depth["l_viewmat"], false, lookAtMat4f(lights["pos"][i], lights["look"][i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniform_locs_depth["l_projmat"], false, lights["proj"][i]);
        gl.uniform3fv(uniform_locs_depth["l_pos"], lights["pos"][i]);

        // Draw scene and drone for depth map
        drawDrawable(gl, scene_drawable, attrib_locs_depth, uniform_locs_depth, false);
        drawDrawable(gl, drone_drawable, attrib_locs_depth, uniform_locs_depth, false);
    }
}

// --- RENDER SCENE ---
function renderScene() {
    prepareGLState(gl, canvas.width, canvas.height, program, null, null);

    // Set up view and projection matrices
    gl.uniformMatrix4fv(uniform_locs["projmat"], false, projectionmatrix);
    gl.uniformMatrix4fv(uniform_locs["viewmat"], false, attachedToDrone ? inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), drone_drawable["modelmatrix"])) : inv4Mat4f(viewmatrix));

    // Set up light view and projection matrices and depth textures
    for (let i = 0; i < lights["num"]; i++) {
        gl.uniformMatrix4fv(uniform_locs["l_viewmat"][i], false, lookAtMat4f(lights["pos"][i], lights["look"][i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniform_locs["l_projmat"][i], false, lights["proj"][i]);

        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, lights["tex"][i]);
        gl.uniform1i(uniform_locs["l_tex"][i], i);
    }

    drawDrawable(gl, scene_drawable, attrib_locs, uniform_locs, true);
    drawDrawable(gl, drone_drawable, attrib_locs, uniform_locs, true);
}

// --- GET DATA FROM 3D FILES ---
let scene_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(2.0, 0.0, 2.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0) };
let drone_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01) };

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/sim/data/drone.obj', drone_drawable);
    await loadDrawable('/sim/data/scene.obj.gz', scene_drawable);
    document.getElementById('loading_overlay').style.display = 'none';
    drawScene();
})();

// --- MAIN LOOP ---
function drawScene() {
    renderDepthMap();
    renderScene();
    requestAnimationFrame(drawScene);
}
