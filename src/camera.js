function getKeyboardInput(s) {
    var x = (keys["a"] ? -1 : keys["d"] ? 1 : 0) * s;
    var y = (keys["q"] ? -1 : keys["e"] ? 1 : 0) * s;
    var z = (keys["w"] ? -1 : keys["s"] ? 1 : 0) * s;

    return [x, y, z];
}

var camera = {
    x: 0.0,
    y: 0.2,
    z: 0.0,
    rx: 0.0,
    ry: 0.0,
    rz: 0.0
};

setInterval(function () {

    var movementVector = getKeyboardInput(0.01);

    camera.x += movementVector[0];
    camera.y += movementVector[1];
    camera.z += movementVector[2];

    cameraModelMatrix = multMat4f(transMat4f(camera["x"], camera["y"], camera["z"]), identMat4f());
}, 10);
