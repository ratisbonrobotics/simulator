// --- SETUP ENVIRONMENT ---
let keys = {};
let mouse = { horizontal: 0, vertical: 0 }
const canvas = document.getElementById("canvas");
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
init3D(gl);
resizeCanvas(canvas);

// --- ADD EVENT LISTENERS ---
window.addEventListener("orientationchange", function () { resizeCanvas(canvas); });
window.addEventListener("resize", function () { resizeCanvas(canvas); });
canvas.addEventListener("mousemove", function (event) { if (document.pointerLockElement === canvas) { mouse["horizontal"] = event.movementX; mouse["vertical"] = event.movementY; } });
canvas.addEventListener("click", canvas.requestPointerLock);
canvas.addEventListener("keydown", function (event) { keys[event.key] = true; });
canvas.addEventListener("keyup", function (event) { keys[event.key] = false; });

// --- GET DATA FROM 3D FILES ---
let sceneDrawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "modelmatrix": modelMat4f(2.0, 0.0, 2.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0) };
let droneDrawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "modelmatrix": modelMat4f(0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01) };

loadData();
async function loadData() {
    await loadDrawable('/sim/data/drone.obj', droneDrawable);
    await loadDrawable('/sim/data/scene.obj.gz', sceneDrawable);
    drawScene();
}

// --- MAIN LOOP ---
function drawScene() {
    renderDepthMap();
    renderScene();
    requestAnimationFrame(drawScene);
}
