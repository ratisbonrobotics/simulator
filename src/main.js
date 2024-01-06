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

// --- GET DATA FROM OBJ ---
var terrain_vertexbuffer;
var terrain_texcoordbuffer;
var terrain_texture;
loadTerrain();
async function loadTerrain() {
    let [obj, mtl] = await parseOBJ('data/terrain.obj');
    terrain_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["terrain"]["v"]);
    terrain_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["terrain"]["vt"]);
    terrain_texture = addTexture(gl, mtl["Material"]["map_Kd"].src);
}

var drone_vertexbuffer;
var drone_texcoordbuffer;
var drone_texture;
loadDrone();
async function loadDrone() {
    let [obj, mtl] = await parseOBJ('data/drone.obj');
    drone_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["v"]);
    drone_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vt"]);
    drone_texture = addTexture(gl, mtl["Material"]["map_Kd"].src);
}

var camera = {
    x: 0.0,
    y: 0.2,
    z: 1.0,
    rx: 0.1,
    ry: 0.0,
    rz: 0.0
};

// --- DRAW ---
requestAnimationFrame(drawScene);
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- SETUP PROJECTION MATRIX ---
    var projectionmatrix = perspecMat4f(degToRad(46.0), canvas.clientWidth / canvas.clientHeight, 0.01, 100);
    gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);

    // --- SETUP VIEWMATRIX ---
    var inp = getKeyboardInput(0.01);
    camera.x += inp[0];
    camera.y += inp[1];
    camera.z += inp[2];
    var viewmatrix = identMat4f();
    viewmatrix = multMat4f(multMat4f(xRotMat4f(camera.rx), multMat4f(yRotMat4f(camera.ry), zRotMat4f(camera.rz))), viewmatrix);
    viewmatrix = multMat4f(transMat4f(camera.x, camera.y, camera.z), viewmatrix);
    viewmatrix = inv4Mat4f(viewmatrix);
    gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, viewmatrix);

    // --- DRAW TERRAIN ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, terrain_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, terrain_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], terrain_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, terrainModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // --- DRAW DRONE ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 1668);

    requestAnimationFrame(drawScene);
}
