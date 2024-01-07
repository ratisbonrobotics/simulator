function getKeyboardInput(s) {
    var x = (keys["a"] ? -1 : keys["d"] ? 1 : 0) * s;
    var y = (keys["q"] ? -1 : keys["e"] ? 1 : 0) * s;
    var z = (keys["w"] ? -1 : keys["s"] ? 1 : 0) * s;

    return [x, y, z];
}

function getMouseInput(s) {
    return [mouse["horizontal"] * s, mouse["vertical"] * s];
}

function resetMouseInput() {
    mouse["0"] = 0;
    mouse["1"] = 0;
}

setInterval(function () {

    var movementVector = getKeyboardInput(0.01);
    var rotationVector = getMouseInput(0.01);

    //cameraModelMatrix = multMat4f(yRotMat4f(rotationVector[1]), cameraModelMatrix);
    cameraModelMatrix = multMat4f(transMat4f(movementVector[0], movementVector[1], movementVector[2]), cameraModelMatrix);

    resetMouseInput();
}, 10);
