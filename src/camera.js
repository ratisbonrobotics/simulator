/*var inp = getKeyboardInput(0.01);
camera.x += inp[0];
camera.y += inp[1];
camera.z += inp[2];
//camera.rx += (mouse["x"] * 0.01) % (2 * Math.PI);
//camera.ry += (mouse["y"] * 0.01) % (2 * Math.PI);
var viewmatrix = identMat4f();
viewmatrix = multMat4f(multMat4f(xRotMat4f(camera.rx), multMat4f(yRotMat4f(camera.ry), zRotMat4f(camera.rz))), viewmatrix);
viewmatrix = multMat4f(transMat4f(camera.x, camera.y, camera.z), viewmatrix);*/

var camera = {
    x: 0.0,
    y: 0.2,
    z: 1.0,
    rx: 0.0,
    ry: 0.0,
    rz: 0.0
};

setInterval(function () {
    cameraModelMatrix = modelMat4f(camera["x"], camera["y"], camera["z"], camera["rx"], camera["ry"], camera["rz"], 1.0, 1.0, 1.0);
}, 10);
