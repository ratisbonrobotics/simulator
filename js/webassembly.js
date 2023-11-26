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

WebAssembly.instantiateStreaming(fetch('executable.wasm'), { env: { print: print } }).then(function (result) {
    memorybuffer = result.instance.exports.memory.buffer;
    result.instance.exports.main();
    cellularautomata3d();
})
