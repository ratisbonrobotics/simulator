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
const omega_min = 300;
const omega_max = 700;
const omega_stable = 500;

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = omega_stable;
var omega_2 = omega_stable;
var omega_3 = omega_stable;
var omega_4 = omega_stable;

var angular_velocity_B = [0, 0, 0];
var linear_velocity_W = [0, 0, 0];
var linear_position_W = [0, 1, 0];

var R_W_B = multMat3f(multMat3f(xRotMat3f(0), yRotMat3f(0)), zRotMat3f(0));

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
	let linear_acceleration_W = addVec3f([0, -g * m, 0], multMatVec3f(R_W_B, f_B_thrust));
	linear_acceleration_W = multScalVec3f(1 / m, linear_acceleration_W);
	let angular_acceleration_B = addVec3f(crossVec3f(multScalVec3f(-1, angular_velocity_B), multMatVec3f(loc_I_mat, angular_velocity_B)), tau_B);
	angular_acceleration_B[0] = angular_acceleration_B[0] / I[0];
	angular_acceleration_B[1] = angular_acceleration_B[1] / I[1];
	angular_acceleration_B[2] = angular_acceleration_B[2] / I[2];

	// --- ADVANCE STATE ---
	linear_velocity_W = addVec3f(linear_velocity_W, multScalVec3f(dt, linear_acceleration_W));
	linear_position_W = addVec3f(linear_position_W, multScalVec3f(dt, linear_velocity_W));
	angular_velocity_B = addVec3f(angular_velocity_B, multScalVec3f(dt, angular_acceleration_B));
	R_W_B = addMat3f(R_W_B, multScalMat3f(dt, multMat3f(R_W_B, so3hat(angular_velocity_B))));

	// --- SET MODEL MATRIX ---

}, dt);
