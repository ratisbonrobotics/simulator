function getKeyboardInput(s) {
    let x = (keys["a"] ? -1 : keys["d"] ? 1 : 0) * s;
    let y = (keys["q"] ? -1 : keys["e"] ? 1 : 0) * s;
    let z = (keys["w"] ? -1 : keys["s"] ? 1 : 0) * s;

    return [x, y, z];
}

function getMouseInput(s) {
    let inp = [mouse["horizontal"] * s, mouse["vertical"] * s];
    mouse["horizontal"] = 0;
    mouse["vertical"] = 0;
    return inp;
}

let projectionmatrix = perspecMat4f(degToRad(46.0), canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
let cameraModelMatrixOld = cameraModelMatrix;
let rotx = 0.0;
let attachedToDrone = false;

setInterval(function () {
    if (keys["1"])
        attachedToDrone = true;

    if (keys["2"])
        attachedToDrone = false;

    if (!attachedToDrone) {
        let movementVector = getKeyboardInput(0.01);
        let rotationVector = getMouseInput(0.01);
        rotx = Math.min(Math.max((rotx + rotationVector[1]), -0.75), 0.75);

        cameraModelMatrix = cameraModelMatrixOld;
        cameraModelMatrix = multMat4f(yRotMat4f(rotationVector[0]), cameraModelMatrix);
        cameraModelMatrix = multMat4f(translMat4f(movementVector[0], movementVector[1], movementVector[2]), cameraModelMatrix);
        cameraModelMatrixOld = cameraModelMatrix;
        cameraModelMatrix = multMat4f(xRotMat4f(rotx), cameraModelMatrix);
    }
}, 10);