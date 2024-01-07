// --- SETUP ENVIRONMENT ---
var keys = {};
var mouse = {
    horizontal: 0,
    vertical: 0
};
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");
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
var cameraModelMatrix = modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
var droneModelMatrix = modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
const terrainModelMatrix = modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);