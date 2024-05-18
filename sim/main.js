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
    prepareGLState(gl, canvas.width, canvas.height, program, null, null);

    // Set up view and projection matrices
    gl.uniformMatrix4fv(uniform_locs["projmat"], false, projectionmatrix);
    gl.uniformMatrix4fv(uniform_locs["viewmat"], false, 
        attachedToDrone ? 
        inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), drone_drawable["modelmatrix"])) :
        inv4Mat4f(viewmatrix)
    );

    drawDrawable(gl, scene_drawable, attrib_locs, uniform_locs, true);
    drawDrawable(gl, drone_drawable, attrib_locs, uniform_locs, true);
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
function drawScene() {
    renderScene();
    requestAnimationFrame(drawScene);
}
