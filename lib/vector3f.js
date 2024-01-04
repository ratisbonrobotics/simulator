function crossVec3f(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}

function multScalarVec3f(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

function addScalarVec3f(v, s) {
    return [v[0] + s, v[1] + s, v[2] + s];
}

function subVec3f(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function addVec3f(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function normVec3f(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.000001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

function lookAt(cameraPosition, target) {
    var zAxis = normVec3f(subVec3f(cameraPosition, target));
    var xAxis = normVec3f(crossVec3f([0, 1, 0], zAxis));
    var yAxis = normVec3f(crossVec3f(zAxis, xAxis));

    return [
        xAxis[0], xAxis[1], xAxis[2], 0,
        yAxis[0], yAxis[1], yAxis[2], 0,
        zAxis[0], zAxis[1], zAxis[2], 0,
        cameraPosition[0], cameraPosition[1], cameraPosition[2], 1
    ];
}
