function getKeyboardInput(s) {
    var x = (keys["a"] ? -1 : keys["d"] ? 1 : 0) * s;
    var y = (keys["q"] ? -1 : keys["e"] ? 1 : 0) * s;
    var z = (keys["w"] ? -1 : keys["s"] ? 1 : 0) * s;

    return [x, y, z];
}

function getMouseInput(s) {
    let inp = [mouse["horizontal"] * s, mouse["vertical"] * s];
    mouse["horizontal"] = 0;
    mouse["vertical"] = 0;
    return inp;
}

var cameraModelMatrixOld = cameraModelMatrix;
let rotx = 0.0;

setInterval(function () {
    var movementVector = getKeyboardInput(0.01);
    var rotationVector = getMouseInput(0.01);
    rotx = Math.min(Math.max((rotx + rotationVector[1]), -0.75), 0.75);

    cameraModelMatrix = cameraModelMatrixOld;
    cameraModelMatrix = multMat4f(yRotMat4f(rotationVector[0]), cameraModelMatrix);
    cameraModelMatrix = multMat4f(translMat4f(movementVector[0], movementVector[1], movementVector[2]), cameraModelMatrix);
    cameraModelMatrixOld = cameraModelMatrix;
    cameraModelMatrix = multMat4f(xRotMat4f(rotx), cameraModelMatrix);
}, 10);