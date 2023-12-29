// --- GET CANVAS CONTEXT ---
var running = true;

var fscanvas = document.getElementById("canvas");
fscanvas.width = Math.pow(2, Math.floor(getBaseLog(2, window.innerWidth * 0.88)));
window.addEventListener("orientationchange", function () {
    setTimeout(function () {
        var newwidth = Math.pow(2, Math.floor(getBaseLog(2, window.innerWidth * 0.88)));
        fscanvas.width = newwidth;
    }, 200);
});
var gl = fscanvas.getContext("webgl");

// --- ADD EVENT LISTENERS AND KEY LISTENERS ---
var startstop = document.getElementById("startstop");
startstop.addEventListener("click", toggle);
function toggle() {
    if (running) {
        running = false;
        startstop.innerHTML = "Start";
    } else {
        running = true;
        startstop.innerHTML = "Stop";
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
fscanvas.onclick = function () {
    fscanvas.requestPointerLock();
};

var viewxz = 0;
var viewy = 0;

document.addEventListener("pointerlockchange", function () {
    if (document.pointerLockElement === fscanvas) {
        document.addEventListener("mousemove", updatePosition, false);
    } else {
        document.removeEventListener("mousemove", updatePosition, false);
    }
}, false);

function updatePosition(e) {
    viewxz -= e.movementX * 0.1;
    viewy = Math.min(90, Math.max(-90, viewy - e.movementY * 0.1));
}

var keys = {};
fscanvas.addEventListener("keydown", function (event) {
    keys[event.key] = true;
});
fscanvas.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});
// --- ---
