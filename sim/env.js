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
async function loadScene() {
    let obj = await parseOBJ('/sim/data/scene.obj.gz');
    let k = 0;
    for (const [_, value] of Object.entries(obj)) {
        console.log("Loading...")
        sceneDrawable["vertexbuffer"][k] = {};
        sceneDrawable["vertexbuffer"][k]["verticies"] = createBuffer(gl, gl.ARRAY_BUFFER, value["v"]);
        sceneDrawable["vertexbuffer"][k]["n_verticies"] = Math.floor(value["v"].length / 3);
        sceneDrawable["texcoordbuffer"][k] = createBuffer(gl, gl.ARRAY_BUFFER, value["vt"]);
        sceneDrawable["normalbuffer"][k] = createBuffer(gl, gl.ARRAY_BUFFER, value["vn"]);

        if (value["m"][0]["map_Kd"] && value["m"][0]["map_Kd"].src) {
            sceneDrawable["texture"][k] = await createTexture(gl, value["m"][0]["map_Kd"].src);
        } else {
            const baseColor = value["m"][0]["Ka"] || [1, 1, 1];
            const colorImageURL = createColorImageURL(baseColor);
            sceneDrawable["texture"][k] = await createTexture(gl, colorImageURL);
        }
        k++;
    }
}

let droneDrawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "modelmatrix": modelMat4f(0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01) };
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
    drone_texture = await createTexture(gl, obj["drone"]["m"][0]["map_Kd"].src);
    await loadScene();
    drawScene();
}

// --- MAIN LOOP ---
function drawScene() {
    renderDepthMap();
    renderScene();
    requestAnimationFrame(drawScene);
}
