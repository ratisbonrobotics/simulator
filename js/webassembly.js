// Memory
let memorybuffer;

function getString(ptr) {
    bytearray = new Uint8Array(memorybuffer, ptr);
    let str = '';
    for (let i = 0; bytearray[i] != 0; i++) {
        str += String.fromCharCode(bytearray[i]);
    }
    return str;
}

function stringToPtr(str, ptr) {
    let bytearray = new Uint8Array(memorybuffer);
    for (let i = 0; i < str.length; i++) {
        bytearray[ptr + i] = str.charCodeAt(i);
    }
    bytearray[ptr + str.length] = 0;
}

// Printing
function print(format, argptr) {
    str = getString(format);
    let argIndex = 0;
    console.log(str.replace(/%[sd]/g, (match) => {
        switch (match) {
            case '%s': {
                let ret = getString(new DataView(memorybuffer).getUint32(argptr + argIndex, true));
                argIndex += 4;
                return ret;
            }
            case '%d': {
                let ret = new DataView(memorybuffer).getUint32(argptr + argIndex, true);
                argIndex += 4;
                return ret;
            }
            default: return match;
        }
    }));
}

const wasmImports = {
    env: {
        print: print,
        /*gl_getContext: gl_getContext,
        gl_createProgram: gl_createProgram,
        gl_attachShader: gl_attachShader,
        gl_linkProgram: gl_linkProgram,
        gl_createShader: gl_createShader,
        gl_shaderSource: gl_shaderSource,
        gl_compileShader: gl_compileShader,
        gl_getShaderParameter: gl_getShaderParameter,
        gl_getShaderInfoLog: gl_getShaderInfoLog,
        gl_createBuffer: gl_createBuffer,
        gl_bindBuffer: gl_bindBuffer,
        gl_bufferData: gl_bufferData,
        gl_getUniformLocation: gl_getUniformLocation,
        gl_uniformMatrix4fv: gl_uniformMatrix4fv,
        gl_getAttribLocation: gl_getAttribLocation,
        gl_vertexAttribPointer: gl_vertexAttribPointer,
        gl_enableVertexAttribArray: gl_enableVertexAttribArray,*/
    },
};
WebAssembly.instantiateStreaming(fetch('executable.wasm'), wasmImports).then(function (result) {
    memorybuffer = result.instance.exports.memory.buffer;
    result.instance.exports.main();
    cellularautomata3d();
})