// --- SETUP ENVIRONMENT ---
let keys = {};
let mouse = {
    horizontal: 0,
    vertical: 0
};
const canvas = document.getElementById("canvas");
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
gl.getExtension('WEBGL_depth_texture');
resizeCanvas();

// --- ADD EVENT LISTENERS ---
window.addEventListener("orientationchange", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousemove", function (event) {
    if (document.pointerLockElement === canvas) {
        mouse["horizontal"] = event.movementX;
        mouse["vertical"] = event.movementY;
    }
});
canvas.addEventListener("click", canvas.requestPointerLock);
canvas.addEventListener("keydown", function (event) { keys[event.key] = true; });
canvas.addEventListener("keyup", function (event) { keys[event.key] = false; });

// --- OBJECT MODEL MATRICIES ---
let cameraModelMatrix = modelMat4f(0.0, 5.0, 5.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
let droneModelMatrix = modelMat4f(0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01);
let sceneModelMatrix = modelMat4f(2.0, 0.0, 2.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);

// --- GET DATA FROM 3D FILES ---
let scene_vertexbuffer = [];
let scene_normalbuffer = [];
let scene_texcoordbuffer = [];
let scene_texture = [];

async function loadScene() {
    let obj = await parseOBJ('/sim/data/scene.obj');
    let k = 0;
    for (const [_, value] of Object.entries(obj)) {
        scene_vertexbuffer[k] = [];
        scene_vertexbuffer[k][0] = createBuffer(gl, gl.ARRAY_BUFFER, value["v"]);
        scene_vertexbuffer[k][1] = Math.floor(value["v"].length / 3);
        scene_texcoordbuffer[k] = createBuffer(gl, gl.ARRAY_BUFFER, value["vt"]);
        scene_normalbuffer[k] = createBuffer(gl, gl.ARRAY_BUFFER, value["vn"]);

        if (value["m"][0]["map_Kd"] && value["m"][0]["map_Kd"].src) {
            scene_texture[k] = addTexture(gl, value["m"][0]["map_Kd"].src);
        } else {
            const baseColor = value["m"][0]["Ka"] || [1, 1, 1];
            const colorImageURL = createColorImageURL(baseColor);
            scene_texture[k] = addTexture(gl, colorImageURL);
        }
        k = k + 1;
    }
}

let drone_vertexbuffer;
let drone_texcoordbuffer;
let drone_normalbuffer;
let drone_texture;
loadDrone();
async function loadDrone() {
    let obj = await parseOBJ('/sim/data/drone.obj');
    drone_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["v"]);
    drone_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vt"]);
    drone_normalbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vn"]);
    drone_texture = addTexture(gl, obj["drone"]["m"][0]["map_Kd"].src);
    await loadScene();
    startMainLoop();
}

// --- MAIN LOOP ---
function startMainLoop() {
    init3D(gl);
    requestAnimationFrame(drawScene);
}

function drawScene() {
    renderDepthMap();
    renderScene();
    requestAnimationFrame(drawScene);
}
