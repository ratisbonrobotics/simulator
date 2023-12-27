// --- DRAWING CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec2 texturecoordinate;
    attribute vec3 normal;
    uniform mat4 modelmatrix;
    uniform mat4 projectionmatrix;
    uniform mat4 viewmatrix;

    varying vec2 o_texturecoordinate;
    varying vec3 o_normal;

    void main(){
        o_texturecoordinate = texturecoordinate;
        o_normal = mat3(modelmatrix) * normal;
        gl_Position = projectionmatrix * viewmatrix * modelmatrix * vertexposition;
    }
`;

const fragmentshadersource = `
    precision highp float;

    uniform sampler2D texture;
    uniform vec3 reverseLightDirection;

    varying vec2 o_texturecoordinate;
    varying vec3 o_normal;

    void main(){
        vec3 normal = normalize(o_normal);
        float light = dot(normal, reverseLightDirection);

        gl_FragColor = texture2D(texture, o_texturecoordinate);
        //gl_FragColor.rgb *= light;
    }
`;

// --- MAKE SHADERS AND PROGRAM ---
const program = createShaderProgram(gl, vertexshadersource, fragmentshadersource);
gl.useProgram(program);

// --- GET ALL ATTRIBUTE AND UNIFORM LOCATIONS ---
const attribLocations = getAttribLocations(gl, program, ["vertexposition", "texturecoordinate", "normal"]);
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "reverseLightDirection"]);

// --- INIT 3D ---
init3D(gl);

// --- THERE SHALL BE LIGHT ---
gl.uniform3fv(uniformLocations.reverseLightDirection, normalize([1.0, 0.0, 0.0, 1.0]));

// --- GET DATA FROM OBJ ---
var drone_vertexbuffer;
var drone_texcoordbuffer;
var drone_normalbuffer;
var drone_texture;
load();
async function load() {
    let [obj, mtl] = await parseOBJ('data/drone.obj');
    drone_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["v"]);
    drone_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vt"]);
    drone_normalbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vn"]);
    drone_texture = gl.createTexture();
    addTexture(gl, drone_texture, mtl["Material"]["map_Kd"].src);

    // --- CONNECT BUFFERS TO ATTRIBUTES ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3, true);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_normalbuffer, attribLocations.normal, 3, true);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2, true);
    // ---
}

var camerapos = [50.0, 50.0, -10.0];

requestAnimationFrame(drawScene);
toggle();

var then = 0;
function drawScene(now) {
    if (running) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // convert requestanimationframe timestamp to seconds
        now *= 0.001;
        // subtract the previous time from the current time
        var deltaTime = now - then;
        // remember the current time for the next frame
        then = now;

        // --- SETUP PROJECTION MATRIX --- (MAKE EVERYTHING 3D)
        var projectionmatrix = createPerspectiveMatrix(degreeToRadians(46.0), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 200000);
        gl.uniformMatrix4fv(uniformLocations.projectionmatrix, false, projectionmatrix);


        // --- SETUP LOOKAT MATRIX ---
        var lookatmatrix = createIdentityMatrix();
        lookatmatrix = mult(createTranslationMatrix(camerapos[0] + Math.sin(degreeToRadians(viewxz)), camerapos[1] + Math.sin(degreeToRadians(viewy)), camerapos[2] + Math.cos(degreeToRadians(viewxz))), lookatmatrix);
        var lookatposition = [lookatmatrix[12], lookatmatrix[13], lookatmatrix[14]];


        // --- FIRST PERSON CAMERA ---
        var movementspeed = 0.3;
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


        // --- SETUP VIEWMATRIX --- (MOVE THE WORLD INVERSE OF THE CAMERAMOVEMENT)
        var cameramatrix = lookAt(camerapos, lookatposition, [0, 1, 0]);
        var viewmatrix = inverse(cameramatrix);
        gl.uniformMatrix4fv(uniformLocations.viewmatrix, false, viewmatrix);


        // -- DRAW ---
        for (var x = 0; x < cellularworldsize; x++) {
            for (var y = 0; y < cellularworldsize; y++) {
                for (var z = 0; z < cellularworldsize; z++) {
                    if (cellgrid[x][y][z] == 1) {
                        gl.uniformMatrix4fv(uniformLocations.modelmatrix, false, createModelMatrix(x, y, z, 0, 0, 0, 20.5, 20.5, 20.5));
                        gl.drawArrays(gl.TRIANGLES, 0, 1668);
                    }
                }
            }
        }

    }
    requestAnimationFrame(drawScene);
}
