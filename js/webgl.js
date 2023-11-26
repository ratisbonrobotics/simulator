import { getString } from '/js/webassembly.js';

let id = 0;
let objects = {};

function objectToId(object) {
    objects[id] = object;
    return id++;
}
function idToObject(id) {
    console.log(objects[id])
    return objects[id];
}
export function gl_getContext(canvas) {
    return objectToId(document.getElementById(getString(canvas)).getContext("webgl"));
}
export function gl_createProgram(gl) {
    return objectToId(idToObject(gl).createProgram());
}
export function gl_attachShader(gl, program, shader) {
    return idToObject(gl).attachShader(idToObject(program), getString(shader));
}
export function gl_linkProgram(gl, program) {
    return idToObject(gl).linkProgram(idToObject(program));
}
export function gl_getProgramParameter(gl, program, pname) {
    return idToObject(gl).getProgramParameter(idToObject(program), pname);
}
export function gl_getProgramInfoLog(gl, program) {
    return stringToPtr(idToObject(gl).getProgramInfoLog(idToObject(program)));
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
export function gl_createBuffer(gl) {
    return objectToId(idToObject(gl).createBuffer());
}
export function gl_bindBuffer(gl, target, buffer) {
    idToObject(gl).bindBuffer(target, idToObject(buffer));
}
export function gl_getUniformLocation(gl, program, name) {
    return objectToId(idToObject(gl).getUniformLocation(idToObject(program), getString(name)));
}
export function gl_getAttribLocation(gl, program, name) {
    return idToObject(gl).getAttribLocation(idToObject(program), getString(name));
}
export function gl_vertexAttribPointer(gl, index, size, type, normalized, stride, offset) {
    idToObject(gl).vertexAttribPointer(index, size, type, normalized, stride, offset);
}
export function gl_enableVertexAttribArray(gl, index) {
    idToObject(gl).enableVertexAttribArray(index);
}
export function gl_createTexture(gl) {
    return objectToId(idToObject(gl).createTexture());
}
export function gl_bindTexture(gl, target, texture) {
    idToObject(gl).bindTexture(target, idToObject(texture));
}