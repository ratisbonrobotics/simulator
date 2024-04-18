function multMat4f(a, b) {
    return [
        a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
        a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
        a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
        a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],

        a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
        a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
        a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
        a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],

        a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
        a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
        a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
        a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],

        a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
        a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
        a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
        a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]];
}

function inv4Mat4f(m) {
    var s0 = m[0] * m[5] - m[4] * m[1];
    var s1 = m[0] * m[6] - m[4] * m[2];
    var s2 = m[0] * m[7] - m[4] * m[3];
    var s3 = m[1] * m[6] - m[5] * m[2];
    var s4 = m[1] * m[7] - m[5] * m[3];
    var s5 = m[2] * m[7] - m[6] * m[3];

    var c5 = m[10] * m[15] - m[14] * m[11];
    var c4 = m[9] * m[15] - m[13] * m[11];
    var c3 = m[9] * m[14] - m[13] * m[10];
    var c2 = m[8] * m[15] - m[12] * m[11];
    var c1 = m[8] * m[14] - m[12] * m[10];
    var c0 = m[8] * m[13] - m[12] * m[9];

    // Should check if determinant is zero (i.e., the matrix is singular).
    var invdet = 1.0 / (s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0);

    var b = [
        (m[5] * c5 - m[6] * c4 + m[7] * c3) * invdet,
        (-m[1] * c5 + m[2] * c4 - m[3] * c3) * invdet,
        (m[13] * s5 - m[14] * s4 + m[15] * s3) * invdet,
        (-m[9] * s5 + m[10] * s4 - m[11] * s3) * invdet,

        (-m[4] * c5 + m[6] * c2 - m[7] * c1) * invdet,
        (m[0] * c5 - m[2] * c2 + m[3] * c1) * invdet,
        (-m[12] * s5 + m[14] * s2 - m[15] * s1) * invdet,
        (m[8] * s5 - m[10] * s2 + m[11] * s1) * invdet,

        (m[4] * c4 - m[5] * c2 + m[7] * c0) * invdet,
        (-m[0] * c4 + m[1] * c2 - m[3] * c0) * invdet,
        (m[12] * s4 - m[13] * s2 + m[15] * s0) * invdet,
        (-m[8] * s4 + m[9] * s2 - m[11] * s0) * invdet,

        (-m[4] * c3 + m[5] * c1 - m[6] * c0) * invdet,
        (m[0] * c3 - m[1] * c1 + m[2] * c0) * invdet,
        (-m[12] * s3 + m[13] * s1 - m[14] * s0) * invdet,
        (m[8] * s3 - m[9] * s1 + m[10] * s0) * invdet
    ];

    return b;
}

function inv3Mat4f(m) {
    var a = m[0], b = m[1], c = m[2];
    var d = m[4], e = m[5], f = m[6];
    var g = m[8], h = m[9], i = m[10];

    var det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

    if (det === 0) {
        throw new Error("Matrix is not invertible");
    }

    var invDet = 1.0 / det;

    return [
        invDet * (e * i - f * h), invDet * (c * h - b * i), invDet * (b * f - c * e), 0,
        invDet * (f * g - d * i), invDet * (a * i - c * g), invDet * (c * d - a * f), 0,
        invDet * (d * h - e * g), invDet * (b * g - a * h), invDet * (a * e - b * d), 0,
        0, 0, 0, 1
    ];
}

function transp4Mat4f(m) {
    return [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
}

function transp3Mat4f(m) {
    return [
        m[0], m[4], m[8], m[3],
        m[1], m[5], m[9], m[7],
        m[2], m[6], m[10], m[11],
        m[12], m[13], m[14], m[15]
    ];
}

function identMat4f() {
    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function translMat4f(tx, ty, tz) {
    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        tx, ty, tz, 1.0];
}

function xRotMat4f(rads) {
    var s = Math.sin(rads);
    var c = Math.cos(rads);
    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, c, -s, 0.0,
        0.0, s, c, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function yRotMat4f(rads) {
    var s = Math.sin(rads);
    var c = Math.cos(rads);
    return [
        c, 0.0, s, 0.0,
        0.0, 1.0, 0.0, 0.0,
        -s, 0.0, c, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function zRotMat4f(rads) {
    var s = Math.sin(rads);
    var c = Math.cos(rads);
    return [
        c, -s, 0.0, 0.0,
        s, c, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function scaleMat4f(sx, sy, sz) {
    return [
        sx, 0.0, 0.0, 0.0,
        0.0, sy, 0.0, 0.0,
        0.0, 0.0, sz, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function modelMat4f(tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    var modelmatrix = identMat4f();
    modelmatrix = multMat4f(translMat4f(tx, ty, tz), modelmatrix);
    modelmatrix = multMat4f(multMat4f(multMat4f(xRotMat4f(rx), yRotMat4f(ry)), zRotMat4f(rz)), modelmatrix);
    modelmatrix = multMat4f(scaleMat4f(sx, sy, sz), modelmatrix);
    return modelmatrix;
}

function perspecMat4f(fov, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    var rangeInv = 1.0 / (near - far);

    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}

function getXRotFromMat4f(m) {
    return Math.atan2(m[9], m[10]);
}

function getYRotFromMat4f(m) {
    return Math.atan2(-m[8], Math.sqrt(m[9] * m[9] + m[10] * m[10]));
}

function getZRotFromMat4f(m) {
    return Math.atan2(m[1], m[0]);
}

function setXYZ(m, x, y, z) {
    var result = [...m];
    result[12] = x;
    result[13] = y;
    result[14] = z;
    return result;
}

function getRotationMatrixFromModelMatrix(modelMatrix) {
    var rotationMatrix = identMat4f();

    // Extract the rotation components from the model matrix
    rotationMatrix[0] = modelMatrix[0];
    rotationMatrix[1] = modelMatrix[1];
    rotationMatrix[2] = modelMatrix[2];
    rotationMatrix[4] = modelMatrix[4];
    rotationMatrix[5] = modelMatrix[5];
    rotationMatrix[6] = modelMatrix[6];
    rotationMatrix[8] = modelMatrix[8];
    rotationMatrix[9] = modelMatrix[9];
    rotationMatrix[10] = modelMatrix[10];

    return rotationMatrix;
}

function setRotationMatrixOfModelMatrix(modelMatrix, rotationMatrix) {
    var result = [...modelMatrix];

    // Set the rotation components of the model matrix
    result[0] = rotationMatrix[0];
    result[1] = rotationMatrix[1];
    result[2] = rotationMatrix[2];
    result[4] = rotationMatrix[4];
    result[5] = rotationMatrix[5];
    result[6] = rotationMatrix[6];
    result[8] = rotationMatrix[8];
    result[9] = rotationMatrix[9];
    result[10] = rotationMatrix[10];

    return result;
}