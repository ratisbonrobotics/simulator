/*var inp = getKeyboardInput(0.01);
camera.x += inp[0];
camera.y += inp[1];
camera.z += inp[2];
//camera.rx += (mouse["x"] * 0.01) % (2 * Math.PI);
//camera.ry += (mouse["y"] * 0.01) % (2 * Math.PI);
var viewmatrix = identMat4f();
viewmatrix = multMat4f(multMat4f(xRotMat4f(camera.rx), multMat4f(yRotMat4f(camera.ry), zRotMat4f(camera.rz))), viewmatrix);
viewmatrix = multMat4f(transMat4f(camera.x, camera.y, camera.z), viewmatrix);*/


function getKeyboardInput(s) {
    var ad = (keys["d"] ? 1 : keys["a"] ? -1 : 0) * s;
    var eq = (keys["e"] ? 1 : keys["q"] ? -1 : 0) * s;
    var ws = (keys["w"] ? 1 : keys["s"] ? -1 : 0) * s;

    return [ad, eq, ws];
}

var camera = {
    x: 0.0,
    y: 0.2,
    z: 1.0,
    rx: 0.0,
    ry: 0.0,
    rz: 0.0
};

setInterval(function () {

    var movementVector = getKeyboardInput(0.01);
    // what does that mean in terms of world coordiantes? -> rotation matrix
    let R =
        multMat3f(
            xRotMat3f(
                X["phi"]
            ),
            multMat3f(
                yRotMat3f(
                    X["theta"]
                ),
                zRotMat3f(
                    X["psi"]
                )
            )
        );

    R = transposeMat3f(R);

    var globalMovementVector = multMatVec3f(R, movementVector);
    // now we can add that to the cameras position
    camera.x += globalMovementVector[0];
    camera.y += globalMovementVector[1];
    camera.z += globalMovementVector[2];

    cameraModelMatrix = modelMat4f(camera["x"], camera["y"], camera["z"], camera["rx"], camera["ry"], camera["rz"], 1.0, 1.0, 1.0);
}, 10);
