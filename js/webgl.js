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
function gl_getProgramParameter(gl, program, pname) {
    return idToObject(gl).getProgramParameter(idToObject(program), pname);
}
function gl_getProgramInfoLog(gl, program) {
    return stringToPtr(idToObject(gl).getProgramInfoLog(idToObject(program)));
}
function gl_createShader(gl, type) {
    return objectToId(idToObject(gl).createShader(type));
}
function gl_shaderSource(gl, shader, source) {
    idToObject(gl).shaderSource(idToObject(shader), getString(source));
}
function gl_compileShader(gl, shader) {
    idToObject(gl).compileShader(idToObject(shader));
}
function gl_getShaderParameter(gl, shader, pname) {
    return idToObject(gl).getShaderParameter(idToObject(shader), pname);
}
function gl_createBuffer(gl) {
    return objectToId(idToObject(gl).createBuffer());
}
function gl_bindBuffer(gl, target, buffer) {
    idToObject(gl).bindBuffer(target, idToObject(buffer));
}
function gl_getUniformLocation(gl, program, name) {
    return objectToId(idToObject(gl).getUniformLocation(idToObject(program), getString(name)));
}
function gl_getAttribLocation(gl, program, name) {
    return idToObject(gl).getAttribLocation(idToObject(program), getString(name));
}
function gl_vertexAttribPointer(gl, index, size, type, normalized, stride, offset) {
    idToObject(gl).vertexAttribPointer(index, size, type, normalized, stride, offset);
}
function gl_enableVertexAttribArray(gl, index) {
    idToObject(gl).enableVertexAttribArray(index);
}
function gl_createTexture(gl) {
    return objectToId(idToObject(gl).createTexture());
}
function gl_bindTexture(gl, target, texture) {
    idToObject(gl).bindTexture(target, idToObject(texture));
}