import { getString, setString } from '/js/webassembly.js';

let id = 0;
let objects = {};

function objectToId(object) {
    objects[id] = object;
    return id++;
}
function idToObject(id) {
    console.log(id, objects[id])
    return objects[id];
}

export function gl_getContext(canvas) {
    return objectToId(document.getElementById(getString(canvas)).getContext("webgl"));
}
export function gl_createShader(gl, type) {
    return objectToId(idToObject(gl).createShader(type));
}
export function gl_shaderSource(gl, shader, source) {
    idToObject(gl).shaderSource(idToObject(shader), getString(source));
}
export function gl_compileShader(gl, shader) {
    idToObject(gl).compileShader(idToObject(shader));
}
export function gl_getShaderParameter(gl, shader, pname) {
    return idToObject(gl).getShaderParameter(idToObject(shader), pname);
}
export function gl_getShaderInfoLog(gl, shader, strptr, maxlen) {
    let str = objectToId(idToObject(gl).getShaderInfoLog(idToObject(shader)));
    setString(strptr, str, maxlen);
}

export function gl_createProgram(gl) {
    return objectToId(idToObject(gl).createProgram());
}
export function gl_attachShader(gl, program, shader) {
    idToObject(gl).attachShader(idToObject(program), idToObject(shader));
}
export function gl_linkProgram(gl, program) {
    idToObject(gl).linkProgram(idToObject(program));
}
export function gl_getProgramParameter(gl, program, pname) {
    return idToObject(gl).getProgramParameter(idToObject(program), pname);
}
export function gl_getProgramInfoLog(gl, program, strptr, maxlen) {
    let str = objectToId(idToObject(gl).getProgramInfoLog(idToObject(program)));
    setString(strptr, str, maxlen);
}