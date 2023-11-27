import * as webgl from '/js/webgl.js';

let memorybuffer;

export function getString(ptr) {
    let bytearray = new Uint8Array(memorybuffer, ptr);
    let str = '';
    for (let i = 0; bytearray[i] != 0; i++) {
        str += String.fromCharCode(bytearray[i]);
    }
    return str;
}
export function setString(ptr, str, maxlen) {
    let bytearray = new Uint8Array(memorybuffer, ptr);
    for (let i = 0; i < str.length && i < maxlen; i++) {
        bytearray[i] = str.charCodeAt(i);
    }
}

let env = {
    pow: Math.pow,
    fmod: function (a, b) {
        return a % b;
    },
    sinf: Math.sin,
    cosf: Math.cos,
    tanf: Math.tan,
    sqrtf: Math.sqrt,
    print: function (format, argptr) {
        let str = getString(format);
        let argIndex = 0;
        console.log(str.replace(/%[sdf]/g, (match) => {
            switch (match) {
                case '%f':
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
    },
    memset: function (ptr, value, len) {
        let bytearray = new Uint8Array(memorybuffer, ptr, len);
        bytearray.fill(value);
    },
};
for (let key in webgl) {
    if (Object.prototype.hasOwnProperty.call(webgl, key)) {
        env[key] = webgl[key];
    }
}

WebAssembly.instantiateStreaming(fetch('executable.wasm'), { env: env }).then(function (result) {
    memorybuffer = result.instance.exports.memory.buffer;
    result.instance.exports.main();
})
