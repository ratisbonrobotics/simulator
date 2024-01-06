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

function invMat3f(a) {
    let det =
        a[0] * (a[4] * a[8] - a[7] * a[5]) -
        a[1] * (a[3] * a[8] - a[5] * a[6]) +
        a[2] * (a[3] * a[7] - a[4] * a[6]);

    if (det === 0) {
        throw new Error("Matrix is not invertible");
    }

    let invDet = 1.0 / det;

    return [
        invDet * (a[4] * a[8] - a[7] * a[5]),
        invDet * (a[2] * a[7] - a[1] * a[8]),
        invDet * (a[1] * a[5] - a[2] * a[4]),

        invDet * (a[5] * a[6] - a[3] * a[8]),
        invDet * (a[0] * a[8] - a[2] * a[6]),
        invDet * (a[3] * a[2] - a[0] * a[5]),

        invDet * (a[3] * a[7] - a[6] * a[4]),
        invDet * (a[6] * a[1] - a[0] * a[7]),
        invDet * (a[0] * a[4] - a[3] * a[1])
    ];
}

function transposeMat3f(a) {
    return [
        a[0], a[3], a[6],
        a[1], a[4], a[7],
        a[2], a[5], a[8]
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