function getVertexShaderSource(num) {
    return `
        precision highp float;

        attribute vec4 vertexpos;
        attribute vec3 vertexnorm;
        attribute vec2 texcoord;

        uniform mat4 modelmat;
        uniform mat4 viewmat;
        uniform mat4 projmat;
        uniform mat4 l_viewmat[${num}];
        uniform mat4 l_projmat[${num}];

        varying vec2 o_texcoord;
        varying vec3 o_vertexnorm;
        varying vec4 ol_coord[${num}];
        
        void main() {
            gl_Position = projmat * viewmat * modelmat * vertexpos;

            o_texcoord = texcoord;
            o_vertexnorm = normalize((modelmat * vec4(vertexnorm, 0.0)).xyz);
            for (int i = 0; i < ${num}; i++) 
                ol_coord[i] = l_projmat[i] * l_viewmat[i] * modelmat * vertexpos;
        }
    `;
}

function getFragmentShaderSource(num, res) {
    return `
        precision highp float;

        uniform sampler2D tex;
        uniform sampler2D l_tex[${num}];
        uniform vec3 l_pos[${num}];

        varying vec2 o_texcoord;
        varying vec3 o_vertexnorm;
        varying vec4 ol_coord[${num}];

        float calculateLight(vec4 l_coord, sampler2D l_tex, vec3 l_pos) {
            vec3 proj_coord = l_coord.xyz / l_coord.w;
            if (proj_coord.z < -1.0 || proj_coord.z > 1.0) return 0.0;

            float distance = length(proj_coord.xy);
            float attenuation = 1.0 - smoothstep(0.0, 1.0, distance);

            proj_coord = proj_coord * 0.5 + 0.5;
            float bias = max(0.9 * (1.0 - dot(o_vertexnorm, normalize(l_pos))), 0.000001);

            vec2 texel_size = 1.0 / vec2(${res}.0, ${res}.0);
            float light = 0.0;
            float total_weight = 0.0;

            for (int x = -5; x <= 5; x++) {
                for (int y = -5; y <= 5; y++) {
                    vec2 offset = vec2(x, y) * texel_size;
                    float pcf_depth = texture2D(l_tex, proj_coord.xy + offset).r;
                    float weight = max(1.0 - length(offset), 0.0);
                    light += (proj_coord.z - bias > pcf_depth ? 0.0 : 1.0) * weight;
                    total_weight += weight;
                }
            }

            light /= total_weight;
            return light * attenuation;
        }

        void main() {
            float light = 0.0;
            for (int i = 0; i < ${num}; i++) {
                light = max(light, calculateLight(ol_coord[i], l_tex[i], l_pos[i]));
            }

            gl_FragColor = vec4(texture2D(tex, o_texcoord).rgb * light, 1.0);
        }
    `;
}


function getDepthVertexShaderSource() {
    return `
        precision highp float;

        attribute vec4 vertexpos;

        uniform mat4 modelmat;
        uniform mat4 l_viewmat;
        uniform mat4 l_projmat;

        void main() {
            gl_Position = l_projmat * l_viewmat * modelmat * vertexpos;
        }
    `;
}

function getDepthFragmentShaderSource() {
    return `precision highp float; void main() {}`;
}