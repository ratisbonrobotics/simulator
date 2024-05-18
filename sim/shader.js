function getVertexShaderSource() {
    return `
        precision highp float;

        attribute vec4 vertexpos;
        attribute vec3 vertexnorm;
        attribute vec2 texcoord;

        uniform mat4 modelmat;
        uniform mat4 viewmat;
        uniform mat4 projmat;

        varying vec2 o_texcoord;
        varying vec3 o_vertexnorm;
        
        void main() {
            gl_Position = projmat * viewmat * modelmat * vertexpos;
            o_texcoord = texcoord;
            o_vertexnorm = normalize((modelmat * vec4(vertexnorm, 0.0)).xyz);
        }
    `;
}

function getFragmentShaderSource() {
    return `
        precision highp float;
        uniform sampler2D tex;

        uniform vec3 Ka;
        
        varying vec2 o_texcoord;
        varying vec3 o_vertexnorm;

        void main() {
            vec3 color = Ka * vec3(texture2D(tex, o_texcoord).rgb);
            gl_FragColor = vec4(color, 1.0);
        }
    `;
}
