// --- GET CANVAS CONTEXT AND SETUP KEY LISTENERS ---
var running = true;

var fscanvas = $("#canvas")[0];
fscanvas.width = Math.pow(2, Math.floor(getBaseLog(2, $(window).width() * 0.88)));
window.addEventListener("orientationchange", function () {
    setTimeout(function () {
        var newwidth = Math.pow(2, Math.floor(getBaseLog(2, $(window).width() * 0.88)));
        fscanvas.width = newwidth;
    }, 200);
});
var gl = fscanvas.getContext("webgl"/*, {antialias: true}*/);
/*
Anti Aliasing intensity setting
gl.enable(gl.SAMPLE_COVERAGE);
gl.sampleCoverage(0.5, false);
*/

// --- ADD EVENT LISTENERS ---
$("#cellauto3dtoggle").click(toggle);
function toggle() { running ? (running = false, $("#cellauto3dtoggle").html("Start")) : (running = true, $("#cellauto3dtoggle").html("Stop")); }

$("#cellauto3dapply").click(apply);
function apply() { survivevalues = parseRulestring3D($("#cellRuleInput3D").val())[1]; bornvalues = parseRulestring3D($("#cellRuleInput3D").val())[0]; }

$("#cellauto3drandomize").click(randomize);
function randomize() { cellgrid = createCellGridWireframe(cellularworldsize, true); }

// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
fscanvas.onclick = function () {
    fscanvas.requestPointerLock();
}

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
$("#canvas").keydown(function (event) {
    keys[event.key] = true;
});
$("#canvas").keyup(function (event) {
    keys[event.key] = false;
});
// --- ---
