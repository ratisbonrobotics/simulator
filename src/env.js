// --- SETUP ENVIRONMENT ---
var running = true;
var keys = {};
var viewxz = 0;
var viewy = 0;
var fscanvas = document.getElementById("canvas");
var gl = fscanvas.getContext("webgl");
resizeCanvas();

// --- ADD EVENT LISTENERS ---
window.addEventListener("orientationchange", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
document.getElementById("startstop").addEventListener("click", toggle);
fscanvas.addEventListener("mousemove", function (event) {
    if (document.pointerLockElement === fscanvas && running) { updatePosition(event); }
});
fscanvas.addEventListener("click", fscanvas.requestPointerLock);
fscanvas.addEventListener("keydown", function (event) { keys[event.key] = true; });
fscanvas.addEventListener("keyup", function (event) { keys[event.key] = false; });
