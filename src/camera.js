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
    var x = (keys["d"] ? 1 : keys["a"] ? -1 : 0) * s;
    var y = (keys["e"] ? 1 : keys["q"] ? -1 : 0) * s;
    var z = (keys["w"] ? 1 : keys["s"] ? -1 : 0) * s;

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
    camera.x += movementVector[0];
    camera.y += movementVector[1];
    camera.z += movementVector[2];

    var rotationVector = getMouseInput(0.01);
    camera.rx -= rotationVector[1];
    camera.ry -= rotationVector[0];
    console.log(camera.rx, camera.ry);
    resetMouseInput();

    var modelmatrix = identMat4f();
    modelmatrix = multMat4f(transMat4f(camera["x"], camera["y"], camera["z"]), modelmatrix);
    modelmatrix = multMat4f(transpose3Mat4f(multMat4f(xRotMat4f(camera["rx"]), multMat4f(yRotMat4f(camera["ry"]), zRotMat4f(camera["rz"])))), modelmatrix);
    modelmatrix = multMat4f(scaleMat4f(1.0, 1.0, 1.0), modelmatrix);
    cameraModelMatrix = multMat4f(transMat4f(camera["x"], camera["y"], camera["z"]), identMat4f());

    //cameraModelMatrix = modelMat4f(camera["x"], camera["y"], camera["z"], camera["rx"], camera["ry"], camera["rz"], 1.0, 1.0, 1.0);
}, 10);
