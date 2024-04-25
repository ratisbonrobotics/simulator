// --- SHADER CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec3 vertexnormal;
    attribute vec2 texturecoordinate;
    uniform mat4 modelmatrix;
    uniform mat4 viewmatrix;
    uniform mat4 projectionmatrix;
    uniform mat4 lightViewMatrix;
    uniform mat4 lightProjectionMatrix;

    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    varying vec4 o_shadowCoord;
    
    void main() {
        o_texturecoordinate = texturecoordinate;
        o_vertexnormal = normalize((modelmatrix * vec4(vertexnormal, 0.0)).xyz);
        vec4 worldPosition = modelmatrix * vertexposition;
        o_shadowCoord = lightProjectionMatrix * lightViewMatrix * worldPosition;
        gl_Position = projectionmatrix * viewmatrix * worldPosition;
    }
`;

const fragmentshadersource = `
    precision highp float;

    uniform sampler2D texture;
    uniform sampler2D shadowTexture;
    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    varying vec4 o_shadowCoord;

    void main() {
        vec3 lightDirection = normalize(vec3(10.0, 10.0, 0.0));
        float lightIntensity = max(dot(o_vertexnormal, lightDirection), 0.0);
        vec4 textureColor = texture2D(texture, o_texturecoordinate);
        
        vec3 projCoords = o_shadowCoord.xyz / o_shadowCoord.w;
        projCoords = projCoords * 0.5 + 0.5;
        float closestDepth = texture2D(shadowTexture, projCoords.xy).r;
        float currentDepth = projCoords.z;
        float shadow = currentDepth > closestDepth ? 0.0 : 1.0;
        
        gl_FragColor = vec4(textureColor.rgb * lightIntensity * shadow, 1.0);
    }
`;

const shadowVertexShaderSource = `
    precision highp float;

    attribute vec4 vertexposition;
    uniform mat4 modelmatrix;
    uniform mat4 lightViewMatrix;
    uniform mat4 lightProjectionMatrix;

    void main() {
        gl_Position = lightProjectionMatrix * lightViewMatrix * modelmatrix * vertexposition;
    }
`;

const shadowFragmentShaderSource = `
    precision highp float;

    void main() {
        // Empty fragment shader
    }
`;

// --- MAKE SHADERS AND PROGRAM ---
const shadowProgram = createAndUseProgram(gl, shadowVertexShaderSource, shadowFragmentShaderSource);
const program = createAndUseProgram(gl, vertexshadersource, fragmentshadersource);

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attribLocations = getAttribLocations(gl, program, ["vertexposition", "texturecoordinate", "vertexnormal"]);
const attribLocationsShadow = getAttribLocations(gl, shadowProgram, ["vertexposition"]);
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture", "shadowTexture", "lightViewMatrix", "lightProjectionMatrix"]);
const uniformLocationsShadow = getUniformLocations(gl, shadowProgram, ["modelmatrix", "lightViewMatrix", "lightProjectionMatrix"]);

// --- INIT 3D ---
init3D(gl);

// --- CREATE SHADOW FRAMEBUFFER AND TEXTURE ---
const shadowFramebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);

const shadowTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, 1024, 1024, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTexture, 0);

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

const lightPosition = [10, 10, 0];
const lookAtPoint = [0, 0, 0];
const upDirection = [0, 1, 0];

const lightViewMatrix = lookAtMat4f(lightPosition, lookAtPoint, upDirection);
const lightProjectionMatrix = orthoMat4f(-1000, 1000, -1000, 1000, 0.1, 10000);

// --- DRAW ---
function drawScene() {
    // --- RENDER DEPTH MAP ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
    gl.viewport(0, 0, 1024, 1024);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shadowProgram);

    // Draw scene and drone for depth map
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocationsShadow.vertexposition, 3);
        gl.uniformMatrix4fv(uniformLocationsShadow["modelmatrix"], false, sceneModelMatrix);
        gl.uniformMatrix4fv(uniformLocationsShadow["lightViewMatrix"], false, lightViewMatrix);
        gl.uniformMatrix4fv(uniformLocationsShadow["lightProjectionMatrix"], false, lightProjectionMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocationsShadow.vertexposition, 3);
    gl.uniformMatrix4fv(uniformLocationsShadow["modelmatrix"], false, droneModelMatrix);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightViewMatrix"], false, lightViewMatrix);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightProjectionMatrix"], false, lightProjectionMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    // --- RENDER SCENE WITH SHADOWS ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    // Set up view and projection matrices
    if (attachedToDrone) {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), droneModelMatrix)));
    } else {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(cameraModelMatrix));
    }
    gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);

    // Set up light view and projection matrices
    gl.uniformMatrix4fv(uniformLocations["lightViewMatrix"], false, lightViewMatrix);
    gl.uniformMatrix4fv(uniformLocations["lightProjectionMatrix"], false, lightProjectionMatrix);

    // Set up shadow texture
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.uniform1i(uniformLocations["shadowTexture"], 1);

    // Draw scene with shadows
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocations.vertexposition, 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_texcoordbuffer[primitive], attribLocations.texturecoordinate, 2);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_normalbuffer[primitive], attribLocations.vertexnormal, 3);
        gl.uniform1i(uniformLocations["texture"], scene_texture[primitive]);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, sceneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    // Draw drone with shadows
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_normalbuffer, attribLocations.vertexnormal, 3);
    gl.uniform1i(uniformLocations["texture"], drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    requestAnimationFrame(drawScene);
}