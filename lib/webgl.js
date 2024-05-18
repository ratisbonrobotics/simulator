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

function drawDrawable(gl, drawable, attribLocations, uniformLocations) {
    gl.activeTexture(gl.TEXTURE16);
    gl.uniform1i(uniformLocations["tex"], 16);
    
    gl.uniformMatrix4fv(uniformLocations["modelmat"], false, drawable["modelmatrix"]);
    for (let p = 0; p < drawable["vertexbuffer"].length; p++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drawable["vertexbuffer"][p]["verticies"], attribLocations["vertexpos"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drawable["normalbuffer"][p], attribLocations["vertexnorm"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drawable["texcoordbuffer"][p], attribLocations["texcoord"], 2);

        gl.bindTexture(gl.TEXTURE_2D, drawable["texture"][p]);
        gl.uniform3fv(uniformLocations["Ka"], drawable["material"][p]["Ka"]);
        
        gl.drawArrays(gl.TRIANGLES, 0, drawable["vertexbuffer"][p]["n_verticies"]);
    }
}

function createTexture(gl, source) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            const [width, height] = [
                Math.pow(2, Math.round(Math.log(img.width) / Math.log(2))),
                Math.pow(2, Math.round(Math.log(img.height) / Math.log(2)))
            ];
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

function getAllAttribLocations(gl, program) {
    var attrib_count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    var attribs = {};
    for (var i = 0; i < attrib_count; i++) {
        var attrib_info = gl.getActiveAttrib(program, i);
        if (attrib_info) {
            var name = attrib_info.name;
            var location = gl.getAttribLocation(program, name);
            attribs[name] = location;
        }
    }
    return attribs;
}

function getAllUniformLocations(gl, program) {
    var uniform_count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    var uniforms = {};
    for (var i = 0; i < uniform_count; i++) {
        var uniform_info = gl.getActiveUniform(program, i);
        if (uniform_info) {
            var name = uniform_info.name;
            var is_array = name.endsWith("]");
            var uniform_name = name.replace(/\[.*?\]/, "");
            var location = gl.getUniformLocation(program, name);
            if (is_array) {
                var array_length = uniform_info.size;
                uniforms[uniform_name] = [];
                for (var j = 0; j < array_length; j++) {
                    var array_element_name = uniform_name + "[" + j + "]";
                    var array_element_location = gl.getUniformLocation(program, array_element_name);
                    uniforms[uniform_name][j] = array_element_location;
                }
            } else {
                uniforms[uniform_name] = location;
            }
        }
    }
    return uniforms;
}