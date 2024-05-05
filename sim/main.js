// --- CREATE DEPTH FRAMEBUFFERS, TEXTURES AND LIGHT PROJECTION MATRICES ---
const lights = { "res": 2048, "num": 3, "framebuf": gl.createFramebuffer(), "tex": [], "proj": [], "pos": [[-7, 2.9, -6.3], [-1, 2.9, -1.5], [-6, 2.9, 0]], "look": [[-7, 0, -6], [-1, 0, -1.2], [-6.3, 0, 0.3]] }

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
    gl.uniform3fv(uniform_locs["camerapos"], [viewmatrix[12], viewmatrix[13], viewmatrix[14]]);

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
let scene_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "verticies": [], "keys": [], "aabbs": [] };
let drone_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(-2.0, 1.0, -2.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01), "verticies": [], "keys": [] };

function computeAABB(vertices) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < vertices.length; i += 3) {
        let x = vertices[i];
        let y = vertices[i + 1];
        let z = vertices[i + 2];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
    }
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
}

function checkAABBCollision(a, b) {
    return (a.min[0] <= b.max[0] && a.max[0] >= b.min[0]) &&
        (a.min[1] <= b.max[1] && a.max[1] >= b.min[1]) &&
        (a.min[2] <= b.max[2] && a.max[2] >= b.min[2]);
}

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/sim/data/drone.obj', drone_drawable);
    await loadDrawable('/sim/data/scene.obj.gz', scene_drawable);
    document.getElementById('loading_overlay').style.display = 'none';
    drawScene();

    for (let i = 0; i < scene_drawable["verticies"].length; i++) {
        scene_drawable["aabbs"][i] = computeAABB(scene_drawable["verticies"][i]);
    }

    let startup_collisions = { "temp": [], "final": [] }; // we assume an initially valid position and thus startup collisions to be invalid.
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

    }, 100);

})();

// --- MAIN LOOP ---
function drawScene() {
    renderDepthMap();
    renderScene();
    requestAnimationFrame(drawScene);
}
