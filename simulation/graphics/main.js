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
async function loadTerrain() {
    let [obj, mtl] = await parseOBJ('graphics/data/terrain.obj');
    terrain_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["terrain"]["v"]);
    terrain_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["terrain"]["vt"]);
    terrain_texture = addTexture(gl, mtl["Material"]["map_Kd"].src);
}

var sofa_vertexbuffer;
var sofa_texcoordbuffer;
var sofa_texture;
async function loadSofa() {
    let [obj, mtl] = await parseOBJ('graphics/data/sofa.obj');
    let verticies = await parseGLB('graphics/data/alarm.glb');
    sofa_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, verticies[11]["vertexData"]);
    //console.log(verticies);
    sofa_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, verticies[11]["texCoordData"]);
    //console.log(obj["sofa"]["vt"]);
    sofa_texture = addTexture(gl, 'graphics/data/alarm.jpeg');
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
    await loadTerrain();
    await loadSofa();
    requestAnimationFrame(drawScene);
}

// --- SETUP PROJECTION MATRIX ---
let projectionmatrix = perspecMat4f(degToRad(46.0), canvas.clientWidth / canvas.clientHeight, 0.01, 100);
gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);

// --- DRAW ---
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- SETUP VIEWMATRIX ---
    gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(cameraModelMatrix));

    // --- DRAW TERRAIN ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, terrain_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, terrain_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], terrain_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, terrainModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // --- DRAW SOFA ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, sofa_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, sofa_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], sofa_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, sofaModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 1121116);

    // --- DRAW DRONE ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    requestAnimationFrame(drawScene);
}
