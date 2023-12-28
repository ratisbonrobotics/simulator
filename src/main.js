// --- DRAWING CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec2 texturecoordinate;
    uniform mat4 modelmatrix;
    uniform mat4 projectionmatrix;
    uniform mat4 viewmatrix;

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
const program = createShaderProgram(gl, vertexshadersource, fragmentshadersource);
gl.useProgram(program);

// --- GET ALL ATTRIBUTE AND UNIFORM LOCATIONS ---
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

var camerapos = [0.0, 0.1, -1.0];

requestAnimationFrame(drawScene);
toggle();

var then = 0;
function drawScene() {
    if (running) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);


        // --- SETUP PROJECTION MATRIX --- (MAKE EVERYTHING 3D)
        var projectionmatrix = createPerspectiveMatrix(degreeToRadians(46.0), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.01, 200000);
        gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);


        // --- SETUP LOOKAT MATRIX ---
        var lookatmatrix = createIdentityMatrix();
        lookatmatrix = mult(createTranslationMatrix(camerapos[0] + Math.sin(degreeToRadians(viewxz)), camerapos[1] + Math.sin(degreeToRadians(viewy)), camerapos[2] + Math.cos(degreeToRadians(viewxz))), lookatmatrix);
        var lookatposition = [lookatmatrix[12], lookatmatrix[13], lookatmatrix[14]];


        // --- FIRST PERSON CAMERA ---
        var movementspeed = 0.0125;
        var factorws = (keys["w"] ? 1 : keys["s"] ? -1 : 0);
        lookatposition[0] += Math.sin(degreeToRadians(viewxz)) * movementspeed * factorws;
        lookatposition[1] += Math.sin(degreeToRadians(viewy)) * movementspeed * factorws;
        lookatposition[2] += Math.cos(degreeToRadians(viewxz)) * movementspeed * factorws;
        camerapos[0] += Math.sin(degreeToRadians(viewxz)) * movementspeed * factorws;
        camerapos[1] += Math.sin(degreeToRadians(viewy)) * movementspeed * factorws;
        camerapos[2] += Math.cos(degreeToRadians(viewxz)) * movementspeed * factorws;

        var factorad = (keys["d"] ? 1 : keys["a"] ? -1 : 0);
        var movcamvector = cross([Math.sin(degreeToRadians(viewxz)), Math.sin(degreeToRadians(viewy)), Math.cos(degreeToRadians(viewxz))], [0, 1, 0]);
        lookatposition[0] += movcamvector[0] * movementspeed * factorad;
        lookatposition[2] += movcamvector[2] * movementspeed * factorad;
        camerapos[0] += movcamvector[0] * movementspeed * factorad;
        camerapos[2] += movcamvector[2] * movementspeed * factorad;

        var factoreq = (keys["e"] ? movementspeed : keys["q"] ? -movementspeed : 0);
        lookatposition[1] += factoreq;
        camerapos[1] += factoreq;


        // --- SETUP VIEWMATRIX ---
        var cameramatrix = lookAt(camerapos, lookatposition, [0, 1, 0]);
        var viewmatrix = inverse(cameramatrix);
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, viewmatrix);

        // --- DRAW TERRAIN ---
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, terrain_vertexbuffer, attribLocations.vertexposition, 3, true);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, terrain_texcoordbuffer, attribLocations.texturecoordinate, 2, true);
        activateTexture(gl, uniformLocations["texture"], terrain_texture);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, createIdentityMatrix());
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // -- DRAW DRONE ---
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3, false);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2, false);
        activateTexture(gl, uniformLocations["texture"], drone_texture);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 1668);
    }

    requestAnimationFrame(drawScene);
}
