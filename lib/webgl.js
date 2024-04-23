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
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
}

function getAttribLocations(gl, program, names) {
    let attriblocations = {};
    for (let i = 0; i < names.length; i++) {
        attriblocations[names[i]] = gl.getAttribLocation(program, names[i]);
        gl.enableVertexAttribArray(attriblocations[names[i]]);
    }
    return attriblocations;
}

function getUniformLocations(gl, program, names) {
    let uniformlocations = {};
    for (let i = 0; i < names.length; i++) { uniformlocations[names[i]] = gl.getUniformLocation(program, names[i]); }
    return uniformlocations;
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
}

let textures = 0;
let texturesHashMap = {};

function addTexture(gl, source) {
    let img = new Image();
    img.src = source;

    const hash = hashCode(source);
    if (hash in texturesHashMap) {
        return texturesHashMap[hash];
    }

    let idx = textures;
    if (textures < 31) {
        textures = textures + 1;
    } else {
        console.log("Cannot add any more textures for", source);
        return 31;
    }

    img.addEventListener("load", function () {
        gl.activeTexture(gl.TEXTURE0 + idx);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        const originalWidth = img.width;
        const originalHeight = img.height;
        const width = nearestPowerOfTwo(originalWidth);
        const height = nearestPowerOfTwo(originalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Flip the canvas context vertically
        ctx.translate(0, height);
        ctx.scale(1, -1);

        ctx.drawImage(img, 0, 0, width, height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    img.addEventListener("error", function () {
        console.error("Error loading texture image:", source);
    });

    texturesHashMap[hash] = idx;
    return idx;
}

function nearestPowerOfTwo(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}