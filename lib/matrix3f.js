function multMat3f(a, b) {
    return [
        a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],

        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],

        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
        a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
    ];
}

function multMatVec3f(m, v) {
    return [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
        m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
        m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ];
}

function vecToDiagMat3f(v) {
    return [
        v[0], 0.0, 0.0,
        0.0, v[1], 0.0,
        0.0, 0.0, v[2]
    ];
}

function invMat3f(m) {
    let det =
        m[0] * (m[4] * m[8] - m[7] * m[5]) -
        m[1] * (m[3] * m[8] - m[5] * m[6]) +
        m[2] * (m[3] * m[7] - m[4] * m[6]);

    if (det === 0) {
        throw new Error("Matrix is not invertible");
    }

    let invDet = 1.0 / det;

    return [
        invDet * (m[4] * m[8] - m[7] * m[5]),
        invDet * (m[2] * m[7] - m[1] * m[8]),
        invDet * (m[1] * m[5] - m[2] * m[4]),

        invDet * (m[5] * m[6] - m[3] * m[8]),
        invDet * (m[0] * m[8] - m[2] * m[6]),
        invDet * (m[3] * m[2] - m[0] * m[5]),

        invDet * (m[3] * m[7] - m[6] * m[4]),
        invDet * (m[6] * m[1] - m[0] * m[7]),
        invDet * (m[0] * m[4] - m[3] * m[1])
    ];
}

function transpMat3f(m) {
    return [
        m[0], m[3], m[6],
        m[1], m[4], m[7],
        m[2], m[5], m[8]
    ];
}

function identMat3f() {
    return [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
    ];
}

function xRotMat3f(rads) {
    let s = Math.sin(rads);
    let c = Math.cos(rads);
    return [
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    ];
}

function yRotMat3f(rads) {
    let s = Math.sin(rads);
    let c = Math.cos(rads);
    return [
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    ];
}

function zRotMat3f(rads) {
    let s = Math.sin(rads);
    let c = Math.cos(rads);
    return [
        c, -s, 0.0,
        s, c, 0.0,
        0.0, 0.0, 1.0
    ];
}

function so3hat(v) {
    return [
        0.0, -v[2], v[1],
        v[2], 0.0, -v[0],
        -v[1], v[0], 0.0,
    ];
}

function so3vee(m) {
    return [
        m[7], m[2], m[3]
    ];
    /*
    // if you have numerical issues, try this.
    return [
        (-m[5] + m[7]) / 2, (-m[6] + m[2]) / 2, (-m[1] + m[3]) / 2
    ];
    */
}

function addMat3f(a, b) {
    return [
        a[0] + b[0], a[1] + b[1], a[2] + b[2],
        a[3] + b[3], a[4] + b[4], a[5] + b[5],
        a[6] + b[6], a[7] + b[7], a[8] + b[8]
    ];
}

function multScalMat3f(s, m) {
    return [
        s * m[0], s * m[1], s * m[2],
        s * m[3], s * m[4], s * m[5],
        s * m[6], s * m[7], s * m[8]
    ];
}

function xRotMat3f(rads) {
    var s = Math.sin(rads);
    var c = Math.cos(rads);
    return [
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    ];
}

function yRotMat3f(rads) {
    var s = Math.sin(rads);
    var c = Math.cos(rads);
    return [
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    ];
}

function zRotMat3f(rads) {
    var s = Math.sin(rads);
    var c = Math.cos(rads);
    return [
        c, -s, 0.0,
        s, c, 0.0,
        0.0, 0.0, 1.0
    ];
}

function subMat3f(a, b) {
    return [
        a[0] - b[0], a[1] - b[1], a[2] - b[2],
        a[3] - b[3], a[4] - b[4], a[5] - b[5],
        a[6] - b[6], a[7] - b[7], a[8] - b[8]
    ];
}