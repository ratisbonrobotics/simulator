function createProgram(gl, vertexshader, fragmentshader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexshader);
    gl.attachShader(program, fragmentshader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) { return program; }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function compileShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { return shader; }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createAndUseProgram(gl, vertexshadersource, fragmentshadersource) {
    let program = createProgram(gl, compileShader(gl, gl.VERTEX_SHADER, vertexshadersource), compileShader(gl, gl.FRAGMENT_SHADER, fragmentshadersource));
    gl.useProgram(program);
    return program;
}

function init3D(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
}

function prepareGLState(gl, width, height, program, framebuffer, cullface) {
    gl.viewport(0, 0, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.cullFace(cullface);
}

function getAttribLocations(gl, program, names) {
    let attriblocations = {};
    for (let i = 0; i < names.length; i++) {
        attriblocations[names[i]] = gl.getAttribLocation(program, names[i]);
    }
    return attriblocations;
}

function getUniformLocations(gl, program, names) {
    let uniformlocations = {};
    for (let i = 0; i < names.length; i++) { uniformlocations[names[i]] = gl.getUniformLocation(program, names[i]); }
    return uniformlocations;
}

function getAllUniformLocations(gl, program) {
    var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    var uniforms = {};
    for (var i = 0; i < uniformCount; i++) {
        var uniformInfo = gl.getActiveUniform(program, i);
        if (uniformInfo) {
            var name = uniformInfo.name;
            var uniformName = name.replace(/\[.*?\]/, "");
            var location = gl.getUniformLocation(program, uniformName);
            uniforms[uniformName] = location;
        }
    }
    return uniforms;
}

function getAllAttribLocations(gl, program) {
    var attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    var attribs = {};
    for (var i = 0; i < attribCount; i++) {
        var attribInfo = gl.getActiveAttrib(program, i);
        if (attribInfo) {
            var name = attribInfo.name;
            var location = gl.getAttribLocation(program, name);
            attribs[name] = location;
        }
    }
    return attribs;
}

function createBuffer(gl, type, data) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
}

function setBufferData(gl, type, buffer, data) {
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);
}

function connectBufferToAttribute(gl, type, buffer, attriblocation, valuespervertex) {
    gl.bindBuffer(type, buffer);
    gl.vertexAttribPointer(attriblocation, valuespervertex, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attriblocation);
}

function createTexture(gl, source) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            const [width, height] = [nearestPowerOfTwo(img.width), nearestPowerOfTwo(img.height)];
            const canvas = document.createElement('canvas');
            Object.assign(canvas, { width, height });
            const ctx = canvas.getContext('2d');
            ctx.setTransform(1, 0, 0, -1, 0, height);
            ctx.drawImage(img, 0, 0, width, height);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
            gl.generateMipmap(gl.TEXTURE_2D);
            resolve(texture);
        };
        img.onerror = () => {
            console.error("Error loading texture image:", source);
            reject(new Error("Error loading texture image: " + source));
        };
        img.src = source;
    });
}
