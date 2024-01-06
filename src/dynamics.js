// ----------------------------------- CONSTANTS -----------------------------------
const k_f = 0.00141446535;
const k_m = 0.0004215641;
const m = 1.0;
const L = 0.23;
const i_phi_hat = 0.0121;
const i_theta_hat = 0.0223;
const i_psi_hat = 0.0119;
const g = 9.81;
const omega_min = 20
const omega_max = 66
var paused = false;

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 41.7;
var omega_2 = 41.8;
var omega_3 = 41.7;
var omega_4 = 41.7;

var X;
var X_dot;

function reset() {
	X = {
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

	X_dot = {
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

var dt = 0.01;

reset();
droneDynamics();
function droneDynamics() {
	if (!paused) {
		let F1 = k_f * omega_1 * omega_1;
		let F2 = k_f * omega_2 * omega_2;
		let F3 = k_f * omega_3 * omega_3;
		let F4 = k_f * omega_4 * omega_4;

		let M1 = k_m * omega_1 * omega_1;
		let M2 = k_m * omega_2 * omega_2;
		let M3 = k_m * omega_3 * omega_3;
		let M4 = k_m * omega_4 * omega_4;

		let local_thrust = [0, F1 + F2 + F3 + F4, 0];
		let R = transposeMat3f(multMat3f(xRotMat3f(X["phi"]), multMat3f(yRotMat3f(X["theta"]), zRotMat3f(X["psi"]))));
		let global_thrust = multMatVec3f(R, local_thrust);
		let global_linear_accelerations = [global_thrust[0] / m, global_thrust[1] / m - g, global_thrust[2] / m];

		let torque = [L * ((F3 + F4) - (F2 + F1)), (M1 + M3) - (M2 + M4), L * ((F2 + F3) - (F1 + F4))];

		let local_rotational_velocities = [X["phi_hat_dot"], X["theta_hat_dot"], X["psi_hat_dot"]];
		let local_inerta_matrix = vecToDiagMat3f([i_phi_hat, i_theta_hat, i_psi_hat]);
		let local_rotational_accelerations =
			multMatVec3f(invMat3f(local_inerta_matrix),
				subVec3f(torque, crossVec3f(local_rotational_velocities,
					multMatVec3f(local_inerta_matrix, local_rotational_velocities))));
		let global_rotational_accelerations = multMatVec3f(R, local_rotational_accelerations);

		X_dot["x_dot"] = X["x_dot"];
		X_dot["y_dot"] = X["y_dot"];
		X_dot["z_dot"] = X["z_dot"];

		X_dot["phi_dot"] = global_rotational_accelerations[0];
		X_dot["theta_dot"] = global_rotational_accelerations[1];
		X_dot["psi_dot"] = global_rotational_accelerations[2];

		X_dot["x_dot_dot"] = global_linear_accelerations[0];
		X_dot["y_dot_dot"] = global_linear_accelerations[1];
		X_dot["z_dot_dot"] = global_linear_accelerations[2];

		X_dot["phi_hat_dot_dot"] = local_rotational_accelerations[0];
		X_dot["theta_hat_dot_dot"] = local_rotational_accelerations[1];
		X_dot["psi_hat_dot_dot"] = local_rotational_accelerations[2];

		for (let key in X) {
			X[key] += X_dot[key + "_dot"] * dt;
		}

		droneModelMatrix = modelMat4f(X["x"], X["y"], X["z"], X["phi"], X["theta"], X["psi"], 1.0, 1.0, 1.0);

		if (X["y"] < 0.0 || X["x"] > 1.0 || X["x"] < -1.0 || X["z"] > 1.0 || X["z"] < -1.0) {
			reset();
		}

	}
	setTimeout(droneDynamics, dt * 1000);
}
