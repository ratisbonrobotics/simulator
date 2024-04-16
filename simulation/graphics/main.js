// --- SHADER CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec2 texturecoordinate;
    uniform mat4 modelmatrix;
    uniform mat4 viewmatrix;
    uniform mat4 projectionmatrix;

    varying vec2 o_texturecoordinate;

    void main(){
        o_texturecoordinate = texturecoordinate;
        gl_Position = projectionmatrix * viewmatrix * modelmatrix * vertexposition;
    }
`;

const fragmentshadersource = `
    precision highp float;

    uniform sampler2D texture;

    varying vec2 o_texturecoordinate;

    void main(){
        gl_FragColor = texture2D(texture, o_texturecoordinate);
    }
`;

// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, vertexshadersource, fragmentshadersource);

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attribLocations = getAttribLocations(gl, program, ["vertexposition", "texturecoordinate"]);
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture"]);

// --- INIT 3D ---
init3D(gl);

// --- GET DATA FROM 3D FILES ---
var scene_vertexbuffer = [];
var scene_texcoordbuffer = [];
var scene_texture = [];
async function loadScene() {
    let glb_data = await parseGLB('graphics/data/scene.glb');
    for (let primitive = 0; primitive < glb_data.length; primitive++) {
        scene_vertexbuffer[primitive] = [];
        scene_vertexbuffer[primitive][0] = createBuffer(gl, gl.ARRAY_BUFFER, glb_data[primitive]["vertexData"]);
        scene_vertexbuffer[primitive][1] = glb_data[primitive]["vertexData"].length;
        scene_texcoordbuffer[primitive] = createBuffer(gl, gl.ARRAY_BUFFER, glb_data[primitive]["texCoordData"]);
        scene_texture[primitive] = addTexture(gl, glb_data[primitive]["textureURL"]);
    }
}

var drone_vertexbuffer;
var drone_texcoordbuffer;
var drone_texture;
loadDrone();
async function loadDrone() {
    let [obj, mtl] = await parseOBJ('graphics/data/drone.obj');
    drone_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["v"]);
    drone_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vt"]);
    drone_texture = addTexture(gl, mtl["Material"]["map_Kd"].src);
    await loadScene();
    requestAnimationFrame(drawScene);
}

// --- SETUP PROJECTION MATRIX ---
let projectionmatrix = perspecMat4f(degToRad(46.0), canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);

// --- DRAW ---

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- SETUP VIEWMATRIX ---
    if (attachedToDrone) {
        droneModelMatrixAttached = droneModelMatrix;
        roty = yRotMat4f(degToRad(180));
        droneModelMatrixAttached = multMat4f(roty, droneModelMatrixAttached);
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(droneModelMatrixAttached));
    } else {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(cameraModelMatrix));
    }

    // --- DRAW SCENE ---
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocations.vertexposition, 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_texcoordbuffer[primitive], attribLocations.texturecoordinate, 2);
        gl.uniform1i(uniformLocations["texture"], scene_texture[primitive]);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, sceneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    // --- DRAW DRONE ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    requestAnimationFrame(drawScene);
}
