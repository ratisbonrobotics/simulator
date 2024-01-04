// ----------------------------------- TEMP HELPER -----------------------------------
const k_f = 0.00141446535;
const k_m = 0.0004215641;
const m = 1.0;
const L = 0.23;
const i_theta = 0.0121;
const i_phi = 0.0119;
const i_psi = 0.0223;
const g = 9.81;
const omega_min = 20
const omega_max = 66
var omega_1 = 45.0;
var omega_2 = 45.0;
var omega_3 = 45.0;
var omega_4 = 45.0;
var paused = false;

setInterval(() => {
	if (!paused) {
		console.clear();
		console.log("Console was cleared");
	}
}, 5000);

setInterval(() => {
	if (!paused) {
		console.log("x: " + X[0].toFixed(1) +
			" y: " + X[1].toFixed(1) +
			" z: " + X[2].toFixed(1) +
			" theta: " + X[3].toFixed(1) +
			" phi: " + X[4].toFixed(1) +
			" psi: " + X[5].toFixed(1));
		console.log("omega_1: " + omega_1.toFixed(1) +
			" omega_2: " + omega_2.toFixed(1) +
			" omega_3: " + omega_3.toFixed(1) +
			" omega_4: " + omega_4.toFixed(1));
	}
}, 1000);

setInterval(() => {
	if (keys["p"]) {
		paused = true;
	}

	if (keys["g"]) {
		paused = false;
	}

	var factoromega = (keys["h"] ? 0.1 : keys["j"] ? -0.1 : 0.0);
	var factoromega_1 = (keys["1"] ? 0.1 : keys["2"] ? -0.1 : 0.0);
	var factoromega_2 = (keys["3"] ? 0.1 : keys["4"] ? -0.1 : 0.0);
	var factoromega_3 = (keys["5"] ? 0.1 : keys["6"] ? -0.1 : 0.0);
	var factoromega_4 = (keys["7"] ? 0.1 : keys["8"] ? -0.1 : 0.0);
	omega_1 = Math.min(Math.max(20, omega_1 + factoromega + factoromega_1), omega_max);
	omega_2 = Math.min(Math.max(20, omega_2 + factoromega + factoromega_2), omega_max);
	omega_3 = Math.min(Math.max(20, omega_3 + factoromega + factoromega_3), omega_max);
	omega_4 = Math.min(Math.max(20, omega_4 + factoromega + factoromega_4), omega_max);
	if (keys["r"]) {
		X = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		omega_1 = 50.0;
		omega_2 = 50.0;
		omega_3 = 50.0;
		omega_4 = 50.0;

	}
	droneModelMatrix = createModelMatrix(X[0], X[1], X[2], X[3], X[4], X[5], 1.0, 1.0, 1.0);

}, 10);


// ----------------------------------- DYNAMICS -----------------------------------
var X = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var Xdot = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dt = 0.001;

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

		let thrust = [0, F1 + F2 + F3 + F4, 0, 1];
		thrust = mult(createXRotationMatrix(degreeToRadians(X[3])), thrust);
		thrust = mult(createYRotationMatrix(degreeToRadians(X[4])), thrust);
		thrust = mult(createZRotationMatrix(degreeToRadians(X[5])), thrust);
		let global_linear_accelerations = [thrust[0] / m, thrust[1] / m - g, thrust[2] / m, 1];

		let torque = [L * ((F3 + F4) - (F2 + F1)), (M1 + M3) - (M2 + M4), L * ((F2 + F3) - (F1 + F4)), 1];
		let local_rotational_velocities = [Xdot[9], Xdot[10], Xdot[11], 1];
		let local_inerta_matrix = mult(createIdentityMatrix(), [i_theta, i_phi, i_psi, 1]);
		let local_rotational_accelerations = mult(inverse(local_inerta_matrix), sub(torque, cross(local_rotational_velocities, mult(local_inerta_matrix, local_rotational_velocities))));

		// we need to continue here

		X = X.map((val, index) => val + dt * Xdot[index]);
	}
	setTimeout(droneDynamics, 1000);
}
