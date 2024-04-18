// ----------------------------------- CONSTANTS -----------------------------------
const k_f = 0.0004905;
const k_m = 0.00004905;
const L = 0.25;
const l = (L / Math.sqrt(2));
const I = [0.01, 0.02, 0.01];
const loc_I_mat = vecToDiagMat3f(I);
const loc_I_mat_inv = invMat3f(loc_I_mat);
const g = 9.81;
const m = 0.5;
const dt = 0.01;
const omega_min = 30;
const omega_max = 70;
const omega_stable = 50;

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = omega_stable;
var omega_2 = omega_stable;
var omega_3 = omega_stable;
var omega_4 = omega_stable;

var angular_velocity_B = [0, 0, 0];
var linear_velocity_W = [0, 0, 0];

var time = 0.0;

setInterval(function () {
	// --- ADVANCE TIME ---
	time += dt;

	// --- LIMIT MOTOR SPEEDS ---
	omega_1 = Math.max(Math.min(omega_1, omega_max), omega_min);
	omega_2 = Math.max(Math.min(omega_2, omega_max), omega_min);
	omega_3 = Math.max(Math.min(omega_3, omega_max), omega_min);
	omega_4 = Math.max(Math.min(omega_4, omega_max), omega_min);

	// --- FORCES AND MOMENTS ---
	let F1 = k_f * omega_1 * Math.abs(omega_1);
	let F2 = k_f * omega_2 * Math.abs(omega_2);
	let F3 = k_f * omega_3 * Math.abs(omega_3);
	let F4 = k_f * omega_4 * Math.abs(omega_4);

	let M1 = k_m * omega_1 * Math.abs(omega_1);
	let M2 = k_m * omega_2 * Math.abs(omega_2);
	let M3 = k_m * omega_3 * Math.abs(omega_3);
	let M4 = k_m * omega_4 * Math.abs(omega_4);

	// --- THRUST ---
	let f_B_thrust = [0, F1 + F2 + F3 + F4, 0];

	// --- TORQUE ---
	let tau_B_drag = [0, M1 - M2 + M3 - M4, 0];
	let tau_B_thrust_1 = crossVec3f([-L, 0, L], [0, F1, 0]);
	let tau_B_thrust_2 = crossVec3f([L, 0, L], [0, F2, 0]);
	let tau_B_thrust_3 = crossVec3f([L, 0, -L], [0, F3, 0]);
	let tau_B_thrust_4 = crossVec3f([-L, 0, -L], [0, F4, 0]);
	let tau_B_thrust = addVec3f(tau_B_thrust_1, tau_B_thrust_2);
	tau_B_thrust = addVec3f(tau_B_thrust, tau_B_thrust_3);
	tau_B_thrust = addVec3f(tau_B_thrust, tau_B_thrust_4);
	let tau_B = addVec3f(tau_B_drag, tau_B_thrust);

	// --- ACCELERATIONS ---
	let linear_acceleration = addVec3f([0, -g * m, 0], multMatVec3f(getRotationMatrixFromModelMatrix(droneModelMatrix), f_B_thrust));
	linear_acceleration = multScalVec3f(1 / m, linear_acceleration);
	let angular_acceleration = addVec3f(crossVec3f(multScalVec3f(-1, angular_velocity_B), multMatVec3f(loc_I_mat, angular_velocity_B)), tau_B);
	angular_acceleration[0] = angular_acceleration[0] / I[0];
	angular_acceleration[1] = angular_acceleration[1] / I[1];
	angular_acceleration[2] = angular_acceleration[2] / I[2];

	// --- ADVANCE STATE ---
	linear_velocity_W = addVec3f(linear_velocity_W, multScalVec3f(dt, linear_acceleration));
	angular_velocity_B = addVec3f(angular_velocity_B, multScalVec3f(dt, angular_acceleration));

	// --- UPDATE MODEL MATRIX ---
	let rot_dot = multMat3f(getRotationMatrixFromModelMatrix(droneModelMatrix), so3hat(angular_velocity_B));
	let new_rot = addMat3f(getRotationMatrixFromModelMatrix(droneModelMatrix), multScalMat3f(dt, rot_dot));
	/*droneModelMatrix = multMat4f(translMat4f(linear_velocity_W[0] * dt, linear_velocity_W[1] * dt, linear_velocity_W[2] * dt), droneModelMatrix);

	droneModelMatrix = setRotationMatrixOfModelMatrix(droneModelMatrix, new_rot);
*/
	console.log(setRotationMatrixOfModelMatrix(droneModelMatrix, new_rot).map(n => n.toFixed(2)));

}, dt);
