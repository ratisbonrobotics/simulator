// --- SETUP ENVIRONMENT ---
var keys = {};
var viewxz = -180.0;
var viewy = 0;
var camerapos = [0.0, 0.2, 1.0];
var droneModelMatrix = modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
const terrainModelMatrix = modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");
resizeCanvas();

// --- ADD EVENT LISTENERS ---
window.addEventListener("orientationchange", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousemove", function (event) {
    if (document.pointerLockElement === canvas) { updatePosition(event); }
});
canvas.addEventListener("click", canvas.requestPointerLock);
canvas.addEventListener("keydown", function (event) { keys[event.key] = true; });
canvas.addEventListener("keyup", function (event) { keys[event.key] = false; });
