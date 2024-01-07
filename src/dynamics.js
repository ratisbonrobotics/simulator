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

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 41.8;
var omega_2 = 41.7;
var omega_3 = 41.7;
var omega_4 = 41.7;

var X;
var X_dot;

function resetState() {
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

resetState();
setInterval(function () {

	let F1 = k_f * omega_1 * omega_1;
	let F2 = k_f * omega_2 * omega_2;
	let F3 = k_f * omega_3 * omega_3;
	let F4 = k_f * omega_4 * omega_4;

	let M1 = k_m * omega_1 * omega_1;
	let M2 = k_m * omega_2 * omega_2;
	let M3 = k_m * omega_3 * omega_3;
	let M4 = k_m * omega_4 * omega_4;

	let R = xRotMat3f(X["phi"]);
	R = multMat3f(R, yRotMat3f(X["theta"]));
	R = multMat3f(R, zRotMat3f(X["psi"]));
	R = transposeMat3f(R);

	let global_thrust = multMatVec3f(R, [0, (F1 + F2 + F3 + F4), 0]);
	let global_linear_accelerations = [global_thrust[0] / m, global_thrust[1] / m - g, global_thrust[2] / m];

	// Assuming L, F1, F2, F3, F4, M1, M2, M3, M4, i_phi_hat, i_theta_hat, i_psi_hat are defined elsewhere

	// Step 1: Define the torque vector
	let torque = [
		L * ((F3 + F4) - (F2 + F1)),
		(M1 + M3) - (M2 + M4),
		L * ((F2 + F3) - (F1 + F4))
	];

	// Step 2: Define local rotational velocities
	let local_rotational_velocities = [X["phi_hat_dot"], X["theta_hat_dot"], X["psi_hat_dot"]];

	// Step 3: Convert local inertia values to a diagonal inertia matrix
	function vecToDiagMat3f(vector) {
		return [
			[vector[0], 0, 0],
			[0, vector[1], 0],
			[0, 0, vector[2]]
		];
	}
	let local_inertia_matrix = vecToDiagMat3f([i_phi_hat, i_theta_hat, i_psi_hat]);

	// Step 4: Calculate the cross product term
	function crossProduct(v1, v2) {
		return [
			v1[1] * v2[2] - v1[2] * v2[1],
			v1[2] * v2[0] - v1[0] * v2[2],
			v1[0] * v2[1] - v1[1] * v2[0]
		];
	}

	function matrixVectorMultiply(matrix, vector) {
		return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
	}

	let omega = local_rotational_velocities;
	let inertiaOmega = matrixVectorMultiply(local_inertia_matrix, omega);
	let cross_product_term = crossProduct(omega, inertiaOmega);

	// Step 5: Calculate local rotational accelerations
	function inverseDiagonalMatrix(matrix) {
		return matrix.map((row, index) => row.map((value, colIndex) => index === colIndex ? 1 / value : 0));
	}

	let inverse_inertia = inverseDiagonalMatrix(local_inertia_matrix);
	let local_rotational_accelerations = matrixVectorMultiply(
		inverse_inertia,
		torque.map((t, i) => t - cross_product_term[i])
	);

	let global_rotational_velocities = multMatVec3f(R, local_rotational_velocities);

	X_dot["x_dot"] = X["x_dot"];
	X_dot["y_dot"] = X["y_dot"];
	X_dot["z_dot"] = X["z_dot"];

	X_dot["phi_dot"] = global_rotational_velocities[0];
	X_dot["theta_dot"] = global_rotational_velocities[1];
	X_dot["psi_dot"] = global_rotational_velocities[2];

	X_dot["x_dot_dot"] = global_linear_accelerations[0];
	X_dot["y_dot_dot"] = global_linear_accelerations[1];
	X_dot["z_dot_dot"] = global_linear_accelerations[2];

	X_dot["phi_hat_dot_dot"] = local_rotational_accelerations[0];
	X_dot["theta_hat_dot_dot"] = local_rotational_accelerations[1];
	X_dot["psi_hat_dot_dot"] = local_rotational_accelerations[2];

	Object.keys(X).forEach(key => {
		if (X_dot.hasOwnProperty(key + "_dot")) {
			X[key] += X_dot[key + "_dot"] * dt;
		}
	});

	droneModelMatrix = modelMat4f(X["x"], X["y"], X["z"], X["phi"], X["theta"], X["psi"], 0.01, 0.01, 0.01);

	if (X["y"] < 0.0 || X["x"] > 1.0 || X["x"] < -1.0 || X["z"] > 1.0 || X["z"] < -1.0) {
		resetState();
	}

}, dt * 1000);
