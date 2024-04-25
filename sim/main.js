// --- SHADER CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec3 vertexnormal;
    attribute vec2 texturecoordinate;
    uniform mat4 modelmatrix;
    uniform mat4 viewmatrix;
    uniform mat4 projectionmatrix;

    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    
    void main() {
        o_texturecoordinate = texturecoordinate;
        o_vertexnormal = normalize((modelmatrix * vec4(vertexnormal, 0.0)).xyz);
        gl_Position = projectionmatrix * viewmatrix * modelmatrix * vertexposition;
    }
`;

const fragmentshadersource = `
    precision highp float;

    uniform sampler2D texture;
    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;

    void main() {
        vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
        float lightIntensity = max(dot(o_vertexnormal, lightDirection), 0.0);
        vec4 textureColor = texture2D(texture, o_texturecoordinate);
        
        gl_FragColor = vec4(textureColor.rgb * lightIntensity, 1.0);
    }
`;


// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, vertexshadersource, fragmentshadersource);

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attribLocations = getAttribLocations(gl, program, ["vertexposition", "texturecoordinate", "vertexnormal"]);
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture"]);

// --- INIT 3D ---
init3D(gl);

// --- GET DATA FROM 3D FILES ---
let scene_vertexbuffer = [];
let scene_normalbuffer = [];
let scene_texcoordbuffer = [];
let scene_texture = [];

async function loadScene() {
    let [obj, mtl] = await parseOBJ('/sim/data/scene.obj');
    let k = 0;
    for (const [key, value] of Object.entries(obj)) {
        scene_vertexbuffer[k] = [];
        scene_vertexbuffer[k][0] = createBuffer(gl, gl.ARRAY_BUFFER, value["v"]);
        scene_vertexbuffer[k][1] = Math.floor(value["v"].length / 3);
        scene_texcoordbuffer[k] = createBuffer(gl, gl.ARRAY_BUFFER, value["vt"]);
        scene_normalbuffer[k] = createBuffer(gl, gl.ARRAY_BUFFER, value["vn"]);

        if (value["m"][0]["map_Kd"] && value["m"][0]["map_Kd"].src) {
            scene_texture[k] = addTexture(gl, value["m"][0]["map_Kd"].src);
        } else {
            const baseColor = value["m"][0]["Ka"] || [1, 1, 1];
            const colorImageURL = createColorImageURL(baseColor);
            scene_texture[k] = addTexture(gl, colorImageURL);
        }
        k = k + 1;
    }
}

let drone_vertexbuffer;
let drone_texcoordbuffer;
let drone_normalbuffer;
let drone_texture;
loadDrone();
async function loadDrone() {
    let [obj, mtl] = await parseOBJ('/sim/data/drone.obj');
    drone_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["v"]);
    drone_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vt"]);
    drone_normalbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vn"]);
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
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), droneModelMatrix)));
    } else {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(cameraModelMatrix));
    }

    // --- DRAW SCENE ---
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocations.vertexposition, 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_texcoordbuffer[primitive], attribLocations.texturecoordinate, 2);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_normalbuffer[primitive], attribLocations.vertexnormal, 3);
        gl.uniform1i(uniformLocations["texture"], scene_texture[primitive]);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, sceneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    // --- DRAW DRONE ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_normalbuffer, attribLocations.vertexnormal, 3);
    gl.uniform1i(uniformLocations["texture"], drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    requestAnimationFrame(drawScene);
}
