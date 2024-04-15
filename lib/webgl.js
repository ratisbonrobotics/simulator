function createProgram(gl, vertexshader, fragmentshader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexshader);
    gl.attachShader(program, fragmentshader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) { return program; }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
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
    var attriblocations = {};
    for (var i = 0; i < names.length; i++) {
        attriblocations[names[i]] = gl.getAttribLocation(program, names[i]);
        gl.enableVertexAttribArray(attriblocations[names[i]]);
    }
    return attriblocations;
}

function getUniformLocations(gl, program, names) {
    var uniformlocations = {};
    for (var i = 0; i < names.length; i++) { uniformlocations[names[i]] = gl.getUniformLocation(program, names[i]); }
    return uniformlocations;
}

function createBuffer(gl, type, data) {
    var buffer = gl.createBuffer();
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

    // Calculate the hash of the image source
    const hash = hashCode(source);

    // Check if the texture is already in the hashmap
    if (hash in texturesHashMap) {
        //console.log("Returning hashed index for", source);
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

        // Get the original width and height of the image
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Calculate the nearest power of two dimensions
        const width = nearestPowerOfTwo(originalWidth);
        const height = nearestPowerOfTwo(originalHeight);

        // Create a temporary canvas to scale the image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Scale the image to the nearest power of two dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Upload the scaled image to the texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    img.addEventListener("error", function () {
        console.error("Error loading texture image:", source);
    });

    // Store the texture index in the hashmap
    texturesHashMap[hash] = idx;

    //console.log("Added texture for", source);
    return idx;
}

// Helper function to calculate the nearest power of two
function nearestPowerOfTwo(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
}

// Helper function to calculate the hash of a string
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32-bit integer
    }
    return hash;
}