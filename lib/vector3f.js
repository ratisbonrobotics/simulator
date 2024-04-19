function crossVec3f(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}

function addScalVec3f(s, v) {
    return [v[0] + s, v[1] + s, v[2] + s];
}

function multScalVec3f(s, v) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

function addVec3f(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function subVec3f(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function dotVec3f(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function normVec3f(v) {
    var magnitude = Math.sqrt(dotVec3f(v, v));
    if (magnitude === 0) {
        console.log("Normalization impossible.")
        return v;
    }
    return [v[0] / magnitude, v[1] / magnitude, v[2] / magnitude];
}