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

let X_camera;
let X_dot_camera;

function resetState() {
    X_camera = {
        x: 0.0,
        y: 0.2,
        z: 0.0,
        phi: 0.0,
        theta: 0.0,
        psi: 0.0,
        x_dot: 0.0,
        y_dot: 0.0,
        z_dot: 0.0,
        phi_hat_dot: 0.0,
        theta_hat_dot: 0.0,
        psi_hat_dot: 0.0
    };

    X_dot_camera = {
        x_dot: 0.0,
        y_dot: 0.0,
        z_dot: 0.0,
        phi_dot: 0.0,
        theta_dot: 0.0,
        psi_dot: 0.0,
        x_dot_dot: 0.0,
        y_dot_dot: 0.0,
        z_dot_dot: 0.0,
        phi_hat_dot_dot: 0.0,
        theta_hat_dot_dot: 0.0,
        psi_hat_dot_dot: 0.0
    };
}

resetState();
setInterval(function () {
    let movementVector = getKeyboardInput(1);
    let rotationVector = getMouseInput(0.001);

    let F1 = movementVector[0];
    let F2 = movementVector[1];
    let F3 = movementVector[2];

    let R =
        transposeMat3f(
            multMat3f(
                xRotMat3f(
                    X_camera["phi"]
                ),
                multMat3f(
                    yRotMat3f(
                        X_camera["theta"]
                    ),
                    zRotMat3f(
                        X_camera["psi"]
                    )
                )
            )
        );
    let global_thrust = multMatVec3f(R, [F1, F2, F3]);
    let global_linear_accelerations = [global_thrust[0] / m, global_thrust[1] / m, global_thrust[2] / m];


    let torque =
        [
            0,
            rotationVector[0],
            0
        ];

    let local_rotational_velocities = [X_camera["phi_hat_dot"], X_camera["theta_hat_dot"], X_camera["psi_hat_dot"]];
    let local_inerta_matrix = vecToDiagMat3f([0.01, 0.01, 0.01]);
    let local_rotational_accelerations =
        multMatVec3f(
            invMat3f(
                local_inerta_matrix
            ),
            subVec3f(
                torque,
                crossVec3f(
                    local_rotational_velocities,
                    multMatVec3f(
                        local_inerta_matrix,
                        local_rotational_velocities)
                )
            )
        );

    let global_rotational_velocities = multMatVec3f(R, local_rotational_velocities);


    X_dot_camera["x_dot"] = X_camera["x_dot"];
    X_dot_camera["y_dot"] = X_camera["y_dot"];
    X_dot_camera["z_dot"] = X_camera["z_dot"];

    X_dot_camera["x_dot"] = global_linear_accelerations[0];
    X_dot_camera["y_dot_dot"] = global_linear_accelerations[1];
    X_dot_camera["z_dot_dot"] = global_linear_accelerations[2];

    X_dot_camera["phi_dot"] = global_rotational_velocities[0];
    X_dot_camera["theta_dot"] = global_rotational_velocities[1];
    X_dot_camera["psi_dot"] = global_rotational_velocities[2];

    X_dot_camera["phi_hat_dot_dot"] = local_rotational_accelerations[0];
    X_dot_camera["theta_hat_dot_dot"] = local_rotational_accelerations[1];
    X_dot_camera["psi_hat_dot_dot"] = local_rotational_accelerations[2];

    Object.keys(X).forEach(key => {
        if (X_dot_camera.hasOwnProperty(key + "_dot")) {
            X_camera[key] += X_dot_camera[key + "_dot"] * dt;
        }
    });

    cameraModelMatrix = modelMat4f(X_camera["x"], X_camera["y"], X_camera["z"], X_camera["phi"], X_camera["theta"], X_camera["psi"], 1.0, 1.0, 1.0);

}, dt * 1000);
