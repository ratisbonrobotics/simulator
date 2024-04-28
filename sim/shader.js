function getVertexShaderSource(numLights) {
    return `
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
}

function getFragmentShaderSource(numLights, shadowMapResolution) {
    return `
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
}

function getShadowVertexShaderSource() {
    return `
        precision highp float;

        attribute vec4 vertexposition;
        uniform mat4 modelmatrix;
        uniform mat4 lightViewMatrix;
        uniform mat4 lightProjectionMatrix;

        void main() {
            gl_Position = lightProjectionMatrix * lightViewMatrix * modelmatrix * vertexposition;
        }
    `;
}

function getShadowFragmentShaderSource() {
    return `precision highp float; void main() {}`;
}