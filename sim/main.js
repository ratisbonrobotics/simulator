const urlParams = new URLSearchParams(window.location.search);
const sceneIndex = urlParams.get("scene") ? parseInt(urlParams.get("scene")) : 0;
const scene_configurations = [
    {
        "path": '/sim/data/scene0/scene.obj.gz',
        "lights": {
            "res": 2048,
            "num": 3,
            "framebuf": gl.createFramebuffer(),
            "tex": [],
            "proj": [],
            "pos": [[-7, 2.9, -6.3], [-1, 2.9, -1.5], [-6, 2.9, 0]],
            "look": [[-7, 0, -6], [-1, 0, -1.2], [-6.3, 0, 0.3]]
        },
        "dronemodelmatrix": modelMat4f(-2.0, 1.0, -2.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01)
    },
    {
        "path": '/sim/data/scene1/scene.obj.gz',
        "lights": {
            "res": 2048,
            "num": 3,
            "framebuf": gl.createFramebuffer(),
            "tex": [],
            "proj": [],
            "pos": [[-5, 2.8, -9.3], [-4, 2.8, -2.5], [-1, 2.8, -6.8]],
            "look": [[-5, 0, -9], [-3.1, 0, -3.2], [-1.3, 0, -6.5]]
        },
        "dronemodelmatrix": modelMat4f(-3.0, 1.0, -3.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01)
    }
];
const activeScene = scene_configurations[sceneIndex];

// --- CREATE DEPTH FRAMEBUFFERS, TEXTURES AND LIGHT PROJECTION MATRICES ---
activeScene["lights"]["tex"] = Array.from({ length: activeScene["lights"]["num"] }, () => createDepthMap(gl, activeScene["lights"]["res"]));
activeScene["lights"]["proj"] = Array.from({ length: activeScene["lights"]["num"] }, () => perspecMat4f(degToRad(160.0), 1.0, 0.0001, 1000));

// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(activeScene["lights"]["num"]), getFragmentShaderSource(activeScene["lights"]["num"], activeScene["lights"]["res"]));
const depth_program = createAndUseProgram(gl, getDepthVertexShaderSource(), getDepthFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attrib_locs = getAllAttribLocations(gl, program);
const attrib_locs_depth = getAllAttribLocations(gl, depth_program);
const uniform_locs = getAllUniformLocations(gl, program);
const uniform_locs_depth = getAllUniformLocations(gl, depth_program);

// --- RENDER DEPTH MAPS ---
function renderDepthMap() {
    for (let i = 0; i < activeScene["lights"]["num"]; i++) {
        prepareGLState(gl, activeScene["lights"]["res"], activeScene["lights"]["res"], depth_program, activeScene["lights"]["framebuf"], activeScene["lights"]["tex"][i]);
        gl.uniformMatrix4fv(uniform_locs_depth["l_viewmat"], false, lookAtMat4f(activeScene["lights"]["pos"][i], activeScene["lights"]["look"][i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniform_locs_depth["l_projmat"], false, activeScene["lights"]["proj"][i]);
        gl.uniform3fv(uniform_locs_depth["l_pos"], activeScene["lights"]["pos"][i]);

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
    gl.uniform3fv(uniform_locs["camerapos"], [viewmatrix[12], viewmatrix[13], viewmatrix[14]]);

    // Set up light view and projection matrices and depth textures
    for (let i = 0; i < activeScene["lights"]["num"]; i++) {
        gl.uniformMatrix4fv(uniform_locs["l_viewmat"][i], false, lookAtMat4f(activeScene["lights"]["pos"][i], activeScene["lights"]["look"][i], [0, 1, 0]));
        gl.uniformMatrix4fv(uniform_locs["l_projmat"][i], false, activeScene["lights"]["proj"][i]);

        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, activeScene["lights"]["tex"][i]);
        gl.uniform1i(uniform_locs["l_tex"][i], i);
    }

    drawDrawable(gl, scene_drawable, attrib_locs, uniform_locs, true);
    drawDrawable(gl, drone_drawable, attrib_locs, uniform_locs, true);
}

// --- GET DATA FROM 3D FILES ---
let scene_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "verticies": [], "keys": [], "aabbs": [] };
let drone_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": activeScene["dronemodelmatrix"], "verticies": [], "keys": [] };

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/sim/data/drone.obj', drone_drawable);
    await loadDrawable(activeScene["path"], scene_drawable);
    document.getElementById('loading_overlay').style.display = 'none';
    drawScene();

    for (let i = 0; i < scene_drawable["verticies"].length; i++) {
        scene_drawable["aabbs"][i] = computeAABB(scene_drawable["verticies"][i]);
    }

    // we assume an initially valid position and thus startup collisions to be invalid.
    let startup_collisions = { "temp": [], "final": [] };
    setInterval(function () {
        // collision detection
        let dronePosition = linear_position_W;
        let total_collisions = 0;
        for (let i = 0; i < scene_drawable["aabbs"].length; i++) {
            let aabb = scene_drawable["aabbs"][i];
            if (dronePosition[0] >= aabb["min"][0] && dronePosition[0] <= aabb["max"][0] &&
                dronePosition[1] >= aabb["min"][1] && dronePosition[1] <= aabb["max"][1] &&
                dronePosition[2] >= aabb["min"][2] && dronePosition[2] <= aabb["max"][2]) {

                if (startup_collisions["final"].length === 0) {
                    startup_collisions["temp"].push(scene_drawable["keys"][i]);
                } else {
                    if (!startup_collisions["final"].includes(scene_drawable["keys"][i])) {
                        console.log("Collided with ", scene_drawable["keys"][i]);
                        total_collisions++;
                    }
                }

            }
        }
        if (total_collisions > 0) {
            console.log("Total collisions:", total_collisions);
        }
        if (startup_collisions["final"].length === 0) {
            startup_collisions["final"] = startup_collisions["temp"];
        }

    }, 10);

})();

// --- MAIN LOOP ---
function drawScene() {
    renderDepthMap();
    renderScene();
    requestAnimationFrame(drawScene);
}
