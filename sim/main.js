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
    uniform vec3 lightPosition;
    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    varying vec4 o_shadowCoord;

    void main() {
        vec4 textureColor = texture2D(texture, o_texturecoordinate);
        
        vec3 projCoords = o_shadowCoord.xyz / o_shadowCoord.w;
        projCoords = projCoords * 0.5 + 0.5;
        float closestDepth = texture2D(shadowTexture, projCoords.xy).r;
        float currentDepth = projCoords.z;

        // Calculate shadow bias
        float bias = max(0.9 * (1.0 - dot(o_vertexnormal, normalize(lightPosition))), 0.000001);

        // Apply PCF with more samples and Gaussian weighting
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
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture", "shadowTexture", "lightViewMatrix", "lightProjectionMatrix"]);
const uniformLocationsShadow = getUniformLocations(gl, shadowProgram, ["modelmatrix", "lightViewMatrix", "lightProjectionMatrix", "lightPosition"]);

// --- CREATE SHADOW FRAMEBUFFER, TEXTURE AND LIGHT PROJECTION MATRIX ---
const shadowMapResolution = 8192;
const shadowFramebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);

const shadowTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, shadowMapResolution, shadowMapResolution, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTexture, 0);

const lightProjectionMatrix = orthoMat4f(-20, 20, 20, -20, 0.01, 10000);
let lightPosition = [25, 25, 5];
let lightViewMatrix;

// --- RENDER DEPTH MAP ---
function renderDepthMap() {
    prepareGLState(gl, shadowMapResolution, shadowMapResolution, shadowProgram, shadowFramebuffer, gl.FRONT);

    lightViewMatrix = lookAtMat4f(lightPosition, [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightViewMatrix"], false, lightViewMatrix);
    gl.uniformMatrix4fv(uniformLocationsShadow["lightProjectionMatrix"], false, lightProjectionMatrix);
    gl.uniform3fv(uniformLocationsShadow["lightPosition"], lightPosition);

    // Draw scene and drone for depth map
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
}