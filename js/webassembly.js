// Memory
let memorybuffer;

function getInteger(ptr) {
    return new DataView(memorybuffer).getUint32(ptr, true);
}

function getString(ptr) {
    bytearray = new Uint8Array(memorybuffer, ptr);
    let str = '';
    for (let i = 0; bytearray[i] != 0; i++) {
        str += String.fromCharCode(bytearray[i]);
    }
    return str;
}

// Printing
function print(format, argptr) {
    str = getString(format);

    let argIndex = 0;

    console.log(str.replace(/%[sd]/g, (match) => {
        switch (match) {
            case '%s': {
                let ret = getString(getInteger(argptr + argIndex));
                argIndex += 4;
                return ret;
            }
            case '%d': {
                let ret = getInteger(argptr + argIndex);
                argIndex += 4;
                return ret;
            }
            default: return match;
        }
    }));
}


// WebGL
/*
let id = 0;
let objects = {};

function objectToId(object) {
    objects[id] = object;
    return id++;
}

function idToObject(id) {
    return objects[id];
}

function gl_getContext(canvas) {
    return objectToId(document.getElementById(getString(canvas)).getContext("webgl"));
}

function gl_createProgram(gl) {
    return objectToId(idToObject(gl).createProgram());
}

function gl_attachShader(gl, program, shader) {
    return idToObject(gl).attachShader(idToObject(program), getString(shader));
}

function gl_linkProgram(gl, program) {
    return idToObject(gl).linkProgram(idToObject(program));
}

gl.linkProgram(program);
*/