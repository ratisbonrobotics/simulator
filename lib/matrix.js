
function degreeToRadians(angle) { return angle * Math.PI / 180; }

function mult(mat4_a, mat4_b) {
    return [mat4_a[0] * mat4_b[0] + mat4_a[1] * mat4_b[4] + mat4_a[2] * mat4_b[8] + mat4_a[3] * mat4_b[12],
    mat4_a[0] * mat4_b[1] + mat4_a[1] * mat4_b[5] + mat4_a[2] * mat4_b[9] + mat4_a[3] * mat4_b[13],
    mat4_a[0] * mat4_b[2] + mat4_a[1] * mat4_b[6] + mat4_a[2] * mat4_b[10] + mat4_a[3] * mat4_b[14],
    mat4_a[0] * mat4_b[3] + mat4_a[1] * mat4_b[7] + mat4_a[2] * mat4_b[11] + mat4_a[3] * mat4_b[15],

    mat4_a[4] * mat4_b[0] + mat4_a[5] * mat4_b[4] + mat4_a[6] * mat4_b[8] + mat4_a[7] * mat4_b[12],
    mat4_a[4] * mat4_b[1] + mat4_a[5] * mat4_b[5] + mat4_a[6] * mat4_b[9] + mat4_a[7] * mat4_b[13],
    mat4_a[4] * mat4_b[2] + mat4_a[5] * mat4_b[6] + mat4_a[6] * mat4_b[10] + mat4_a[7] * mat4_b[14],
    mat4_a[4] * mat4_b[3] + mat4_a[5] * mat4_b[7] + mat4_a[6] * mat4_b[11] + mat4_a[7] * mat4_b[15],

    mat4_a[8] * mat4_b[0] + mat4_a[9] * mat4_b[4] + mat4_a[10] * mat4_b[8] + mat4_a[11] * mat4_b[12],
    mat4_a[8] * mat4_b[1] + mat4_a[9] * mat4_b[5] + mat4_a[10] * mat4_b[9] + mat4_a[11] * mat4_b[13],
    mat4_a[8] * mat4_b[2] + mat4_a[9] * mat4_b[6] + mat4_a[10] * mat4_b[10] + mat4_a[11] * mat4_b[14],
    mat4_a[8] * mat4_b[3] + mat4_a[9] * mat4_b[7] + mat4_a[10] * mat4_b[11] + mat4_a[11] * mat4_b[15],

    mat4_a[12] * mat4_b[0] + mat4_a[13] * mat4_b[4] + mat4_a[14] * mat4_b[8] + mat4_a[15] * mat4_b[12],
    mat4_a[12] * mat4_b[1] + mat4_a[13] * mat4_b[5] + mat4_a[14] * mat4_b[9] + mat4_a[15] * mat4_b[13],
    mat4_a[12] * mat4_b[2] + mat4_a[13] * mat4_b[6] + mat4_a[14] * mat4_b[10] + mat4_a[15] * mat4_b[14],
    mat4_a[12] * mat4_b[3] + mat4_a[13] * mat4_b[7] + mat4_a[14] * mat4_b[11] + mat4_a[15] * mat4_b[15]];
}


function createIdentityMatrix() {
    return [1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function createTranslationMatrix(transx, transy, transz) {
    return [1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        transx, transy, transz, 1.0];
}

function createXRotationMatrix(angleInRadians) {
    var s = Math.sin(angleInRadians);
    var c = Math.cos(angleInRadians);
    return [1.0, 0.0, 0.0, 0.0,
        0.0, c, -s, 0.0,
        0.0, s, c, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function createYRotationMatrix(angleInRadians) {
    var s = Math.sin(angleInRadians);
    var c = Math.cos(angleInRadians);
    return [c, 0.0, -s, 0.0,
        0.0, 1.0, 0.0, 0.0,
        s, 0.0, c, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function createZRotationMatrix(angleInRadians) {
    var s = Math.sin(angleInRadians);
    var c = Math.cos(angleInRadians);
    return [c, s, 0.0, 0.0,
        -s, c, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function createScaleMatrix(scalex, scaley, scalez) {
    return [scalex, 0.0, 0.0, 0.0,
        0.0, scaley, 0.0, 0.0,
        0.0, 0.0, scalez, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function createOrthographicMatrix(left, right, bottom, top, near, far) {
    return [2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, 2 / (near - far), 0,
    (left + right) / (left - right), (bottom + top) / (bottom + top), (near + far) / (near - far), 1];
}

function createSimpleProjectionMatrix(width, height, depth) {
    return [(2 / width), 0.0, 0.0, 0.0,
        0.0, (-2 / height), 0.0, 0.0,
        0.0, 0.0, (2 / depth), 0.0,
    -1.0, 1.0, 0.0, 1.0];
}

function createPerspectiveMatrix(fovInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fovInRadians);
    var rangeInv = 1.0 / (near - far);

    return [f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}

// leibnitz forumlar: InvA = 1/det(A) * Aadj
function inverse(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
        d * t0,
        d * t1,
        d * t2,
        d * t3,
        d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
        d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
        d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
        d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
        d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
        d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
        d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
        d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
        d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
        d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
        d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
        d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
}

function transpose(m) {
    return [m[0], m[4], m[8], m[12],
    m[1], m[5], m[9], m[13],
    m[2], m[6], m[10], m[14],
    m[3], m[7], m[11], m[15]
    ];
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]];
}

function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.000001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

function lookAt(cameraPosition, target, up) {
    var zAxis = normalize(subtractVectors(cameraPosition, target));
    var xAxis = normalize(cross(up, zAxis));
    var yAxis = normalize(cross(zAxis, xAxis));

    return [
        xAxis[0], xAxis[1], xAxis[2], 0,
        yAxis[0], yAxis[1], yAxis[2], 0,
        zAxis[0], zAxis[1], zAxis[2], 0,
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2],
        1,
    ];
}

