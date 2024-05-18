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
function drawScene() {
    renderScene();
    requestAnimationFrame(drawScene);
}
