// --- SHADER CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec3 vertexnormal;
    attribute vec2 texturecoordinate;
    uniform mat4 modelmatrix;
    uniform mat4 viewmatrix;
    uniform mat4 projectionmatrix;
    uniform mat4 lightViewMatrix1;
    uniform mat4 lightProjectionMatrix1;
    uniform mat4 lightViewMatrix2;
    uniform mat4 lightProjectionMatrix2;

    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    varying vec4 o_shadowCoord1;
    varying vec4 o_shadowCoord2;
    
    void main() {
        o_texturecoordinate = texturecoordinate;
        o_vertexnormal = normalize((modelmatrix * vec4(vertexnormal, 0.0)).xyz);
        vec4 worldPosition = modelmatrix * vertexposition;
        o_shadowCoord1 = lightProjectionMatrix1 * lightViewMatrix1 * worldPosition;
        o_shadowCoord2 = lightProjectionMatrix2 * lightViewMatrix2 * worldPosition;
        gl_Position = projectionmatrix * viewmatrix * worldPosition;
    }
`;

const fragmentshadersource = `
    precision highp float;

    uniform sampler2D texture;
    uniform sampler2D shadowTexture1;
    uniform sampler2D shadowTexture2;
    uniform vec3 lightPosition1;
    uniform vec3 lightPosition2;
    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    varying vec4 o_shadowCoord1;
    varying vec4 o_shadowCoord2;

    float calculateShadow(vec4 shadowCoord, sampler2D shadowTexture, vec3 lightPosition) {
        vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
        projCoords = projCoords * 0.5 + 0.5;
        float closestDepth = texture2D(shadowTexture, projCoords.xy).r;
        float currentDepth = projCoords.z;

        float bias = max(0.9 * (1.0 - dot(o_vertexnormal, normalize(lightPosition))), 0.000001);

        float shadow = 0.0;
        vec2 texelSize = 1.0 / vec2(8192.0, 8192.0);
        float totalWeight = 0.0;
        const int neighborhoodsize = 8;
        for (int x = -neighborhoodsize; x <= neighborhoodsize; x++) {
            for (int y = -neighborhoodsize; y <= neighborhoodsize; y++) {
                float pcfDepth = texture2D(shadowTexture, projCoords.xy + vec2(x, y) * texelSize).r;
                float weight = max(1.0 - length(vec2(x, y) * texelSize), 0.0);
                shadow += (currentDepth - bias > pcfDepth ? 0.0 : 1.0) * weight;
                totalWeight += weight;
            }
        }
        shadow /= totalWeight;
        
        return shadow;
    }

    void main() {
        vec4 textureColor = texture2D(texture, o_texturecoordinate);
        
        float shadow1 = calculateShadow(o_shadowCoord1, shadowTexture1, lightPosition1);
        float shadow2 = calculateShadow(o_shadowCoord2, shadowTexture2, lightPosition2);
        
        float shadow = min(shadow1, shadow2);
        
        gl_FragColor = vec4(textureColor.rgb * shadow, 1.0);
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
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture", "shadowTexture1", "shadowTexture2", "lightViewMatrix1", "lightProjectionMatrix1", "lightViewMatrix2", "lightProjectionMatrix2"]);
const uniformLocationsShadow = getUniformLocations(gl, shadowProgram, ["modelmatrix", "lightViewMatrix", "lightProjectionMatrix", "lightPosition"]);

// --- CREATE SHADOW FRAMEBUFFERS, TEXTURES AND LIGHT PROJECTION MATRICES ---
const shadowMapResolution = 8192;
const shadowFramebuffer1 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer1);

const shadowTexture1 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, shadowTexture1);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, shadowMapResolution, shadowMapResolution, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTexture1, 0);

const shadowFramebuffer2 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer2);

const shadowTexture2 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, shadowTexture2);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, shadowMapResolution, shadowMapResolution, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTexture2, 0);

const lightProjectionMatrix1 = orthoMat4f(-20, 20, 20, -20, 0.01, 10000);
const lightProjectionMatrix2 = orthoMat4f(-20, 20, 20, -20, 0.01, 10000);
let lightPosition1 = [25, 25, 5];
let lightPosition2 = [-25, 25, 5];
let lightViewMatrix1;
let lightViewMatrix2;

// --- RENDER DEPTH MAPS ---
function renderDepthMap() {
    prepareGLState(gl, shadowMapResolution, shadowMapResolution, shadowProgram, shadowFramebuffer1, gl.FRONT);

    lightViewMatrix1 = lookAtMat4f(lightPosition1, [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightViewMatrix"], false, lightViewMatrix1);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightProjectionMatrix"], false, lightProjectionMatrix1);
    gl.uniform3fv(uniformLocationsShadow["lightPosition"], lightPosition1);

    // Draw scene and drone for depth map of light 1
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocationsShadow.vertexposition, 3);
        gl.uniformMatrix4fv(uniformLocationsShadow["modelmatrix"], false, sceneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocationsShadow.vertexposition, 3);
    gl.uniformMatrix4fv(uniformLocationsShadow["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    // Render depth map for light 2
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer2);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    lightViewMatrix2 = lookAtMat4f(lightPosition2, [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightViewMatrix"], false, lightViewMatrix2);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightProjectionMatrix"], false, lightProjectionMatrix2);
    gl.uniform3fv(uniformLocationsShadow["lightPosition"], lightPosition2);

    // Draw scene and drone for depth map of light 2
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocationsShadow.vertexposition, 3);
        gl.uniformMatrix4fv(uniformLocationsShadow["modelmatrix"], false, sceneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocationsShadow.vertexposition, 3);
    gl.uniformMatrix4fv(uniformLocationsShadow["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);
}

// --- RENDER SCENE WITH SHADOWS ---
function renderScene() {
    prepareGLState(gl, canvas.width, canvas.height, program, null, gl.BACK);

    // Set up view and projection matrices
    if (attachedToDrone) {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), droneModelMatrix)));
    } else {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(cameraModelMatrix));
    }
    gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);

    // Set up light view and projection matrices
    gl.uniformMatrix4fv(uniformLocations["lightViewMatrix1"], false, lightViewMatrix1);
    gl.uniformMatrix4fv(uniformLocations["lightProjectionMatrix1"], false, lightProjectionMatrix1);
    gl.uniformMatrix4fv(uniformLocations["lightViewMatrix2"], false, lightViewMatrix2);
    gl.uniformMatrix4fv(uniformLocations["lightProjectionMatrix2"], false, lightProjectionMatrix2);

    // Set up shadow textures
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture1);
    gl.uniform1i(uniformLocations["shadowTexture1"], 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture2);
    gl.uniform1i(uniformLocations["shadowTexture2"], 2);

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
}