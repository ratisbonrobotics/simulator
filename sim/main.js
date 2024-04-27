// --- CREATE SHADOW FRAMEBUFFERS, TEXTURES AND LIGHT PROJECTION MATRICES ---
const shadowMapResolution = 4096;
const numLights = 2;
const shadowFramebuffers = new Array(numLights);
const shadowTextures = new Array(numLights);
const lightProjectionMatrices = new Array(numLights);
const lightPositions = [
    [0.5, 1, 0],
    [-0.5, 1, 0],
    [0, 1, 0.5],
    [0, 1, -0.5],
];
const lookAt = [
    [-1, 1, 0],
    [1, 1, 0],
    [0, 1, -1],
    [0, 1, 1],
];
const lightViewMatrices = new Array(numLights);

for (let i = 0; i < numLights; i++) {
    shadowFramebuffers[i] = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffers[i]);

    shadowTextures[i] = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + textures);
    textures = textures + 1;
    gl.bindTexture(gl.TEXTURE_2D, shadowTextures[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, shadowMapResolution, shadowMapResolution, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTextures[i], 0);

    lightProjectionMatrices[i] = perspecMat4f(degToRad(120.0), 1.0, 0.0001, 1000);
}

// --- SHADER CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec3 vertexnormal;
    attribute vec2 texturecoordinate;
    uniform mat4 modelmatrix;
    uniform mat4 viewmatrix;
    uniform mat4 projectionmatrix;
    uniform mat4 lightViewMatrices[` + numLights + `];
    uniform mat4 lightProjectionMatrices[` + numLights + `];

    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    varying vec4 o_shadowCoords[` + numLights + `];
    
    void main() {
        o_texturecoordinate = texturecoordinate;
        o_vertexnormal = normalize((modelmatrix * vec4(vertexnormal, 0.0)).xyz);
        vec4 worldPosition = modelmatrix * vertexposition;
        for (int i = 0; i < ` + numLights + `; i++) {
            o_shadowCoords[i] = lightProjectionMatrices[i] * lightViewMatrices[i] * worldPosition;
        }
        gl_Position = projectionmatrix * viewmatrix * worldPosition;
    }
`;

const fragmentshadersource = `
    precision highp float;

    uniform sampler2D texture;
    uniform sampler2D shadowTextures[` + numLights + `];
    uniform vec3 lightPositions[` + numLights + `];
    varying vec2 o_texturecoordinate;
    varying vec3 o_vertexnormal;
    varying vec4 o_shadowCoords[` + numLights + `];

    float calculateShadow(vec4 shadowCoord, sampler2D shadowTexture, vec3 lightPosition) {
        vec3 projCoords = shadowCoord.xyz / shadowCoord.w;

        if(projCoords.z < -1.0 || projCoords.z > 1.0){
            return 0.0;
        }
        
        // Calculate the distance from the center of the frustum
        float distanceFromCenter = length(projCoords.xy);
        
        // Calculate the shadow reduction factor based on the distance
        float shadowReduction = 1.0 - smoothstep(0.0, 1.0, distanceFromCenter);
        
        projCoords = projCoords * 0.5 + 0.5;
        float closestDepth = texture2D(shadowTexture, projCoords.xy).r;
        float currentDepth = projCoords.z;
    
        float bias = max(0.9 * (1.0 - dot(o_vertexnormal, normalize(lightPosition))), 0.000001);
    
        float shadow = 0.0;
        vec2 texelSize = 1.0 / vec2(` + shadowMapResolution + `.0, ` + shadowMapResolution + `.0);
        float totalWeight = 0.0;
        const int neighborhoodsize = 4;
        for (int x = -neighborhoodsize; x <= neighborhoodsize; x++) {
            for (int y = -neighborhoodsize; y <= neighborhoodsize; y++) {
                float pcfDepth = texture2D(shadowTexture, projCoords.xy + vec2(x, y) * texelSize).r;
                float weight = max(1.0 - length(vec2(x, y) * texelSize), 0.0);
                shadow += (currentDepth - bias > pcfDepth ? 0.0 : 1.0) * weight;
                totalWeight += weight;
            }
        }
        shadow /= totalWeight;
        
        // Apply the shadow reduction factor to the final shadow value
        shadow *= shadowReduction;
        
        return shadow;
    }

    void main() {
        vec4 textureColor = texture2D(texture, o_texturecoordinate);
        
        float shadow = 0.0;
        for (int i = 0; i < ` + numLights + `; i++) {
            shadow = max(shadow, calculateShadow(o_shadowCoords[i], shadowTextures[i], lightPositions[i]));
        }
        
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
const attribLocations = getAllAttribLocations(gl, program);
const attribLocationsShadow = getAllAttribLocations(gl, shadowProgram);
const uniformLocations = getAllUniformLocations(gl, program);
for (let i = 0; i < numLights; i++) {
    uniformLocations["shadowTextures[" + i + "]"] = gl.getUniformLocation(program, "shadowTextures[" + i + "]");
    uniformLocations["lightViewMatrices[" + i + "]"] = gl.getUniformLocation(program, "lightViewMatrices[" + i + "]");
    uniformLocations["lightProjectionMatrices[" + i + "]"] = gl.getUniformLocation(program, "lightProjectionMatrices[" + i + "]");
}
const uniformLocationsShadow = getAllUniformLocations(gl, shadowProgram);

// --- RENDER DEPTH MAPS ---
function renderDepthMap() {
    for (let i = 0; i < numLights; i++) {
        prepareGLState(gl, shadowMapResolution, shadowMapResolution, shadowProgram, shadowFramebuffers[i], gl.BACK);

        lightViewMatrices[i] = lookAtMat4f(lightPositions[i], lookAt[i], [0, 1, 0]);
        gl.uniformMatrix4fv(uniformLocationsShadow["lightViewMatrix"], false, lightViewMatrices[i]);
        gl.uniformMatrix4fv(uniformLocationsShadow["lightProjectionMatrix"], false, lightProjectionMatrices[i]);
        gl.uniform3fv(uniformLocationsShadow["lightPosition"], lightPositions[i]);

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

    // Set up light view and projection matrices and shadow textures
    for (let i = 0; i < numLights; i++) {
        gl.uniformMatrix4fv(uniformLocations["lightViewMatrices[" + i + "]"], false, lightViewMatrices[i]);
        gl.uniformMatrix4fv(uniformLocations["lightProjectionMatrices[" + i + "]"], false, lightProjectionMatrices[i]);

        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, shadowTextures[i]);
        gl.uniform1i(uniformLocations["shadowTextures[" + i + "]"], i);
    }

    gl.activeTexture(gl.TEXTURE16);
    gl.uniform1i(uniformLocations["texture"], 16);

    // Draw scene with shadows
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocations.vertexposition, 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_texcoordbuffer[primitive], attribLocations.texturecoordinate, 2);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_normalbuffer[primitive], attribLocations.vertexnormal, 3);
        gl.bindTexture(gl.TEXTURE_2D, scene_texture[primitive]);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, sceneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    // Draw drone with shadows
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_normalbuffer, attribLocations.vertexnormal, 3);
    gl.bindTexture(gl.TEXTURE_2D, drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);
}