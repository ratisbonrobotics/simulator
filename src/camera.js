function getKeyboardInput(s) {
    var x = (keys["a"] ? -1 : keys["d"] ? 1 : 0) * s;
    var y = (keys["q"] ? -1 : keys["e"] ? 1 : 0) * s;
    var z = (keys["w"] ? -1 : keys["s"] ? 1 : 0) * s;

    return [x, y, z];
}

function getMouseInput(s) {
    var x = mouse["x"] * s;
    var y = mouse["y"] * s;

    return [x, y];
}

function resetMouseInput() {
    mouse["x"] = 0;
    mouse["y"] = 0;
}

let yrot = 0;

setInterval(function () {

    if (keys["r"]) {
        cameraModelMatrix = multMat4f(yRotMat4f(-yrot), cameraModelMatrix);
        yrot = 0;
    }

    var movementVector = getKeyboardInput(0.01);
    var rotationVector = getMouseInput(0.01);
    yrot += rotationVector[0];

    cameraModelMatrix = multMat4f(yRotMat4f(rotationVector[0]), cameraModelMatrix);
    cameraModelMatrix = multMat4f(transMat4f(movementVector[0], movementVector[1], movementVector[2]), cameraModelMatrix);

    resetMouseInput();
}, 10);
