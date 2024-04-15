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

var alarm_vertexbuffer = [];
var alarm_texcoordbuffer = [];
var alarm_texture = [];
async function loadAlarm() {
    let glb_data = await parseGLB('graphics/data/complete_scene.glb');
    for (let primitive = 0; primitive < glb_data.length; primitive++) {
        alarm_vertexbuffer[primitive] = createBuffer(gl, gl.ARRAY_BUFFER, glb_data[primitive]["vertexData"]);
        alarm_texcoordbuffer[primitive] = createBuffer(gl, gl.ARRAY_BUFFER, glb_data[primitive]["texCoordData"]);
        alarm_texture[primitive] = addTexture(gl, glb_data[primitive]["textureURL"]);
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
    await loadTerrain();
    await loadAlarm();
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

    // --- DRAW ALARM ---
    for (let primitive = 0; primitive < alarm_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, alarm_vertexbuffer[primitive], attribLocations.vertexposition, 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, alarm_texcoordbuffer[primitive], attribLocations.texturecoordinate, 2);
        gl.uniform1i(uniformLocations["texture"], alarm_texture[primitive]);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, alarmModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 20000);
    }

    // --- DRAW DRONE ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    requestAnimationFrame(drawScene);
}
