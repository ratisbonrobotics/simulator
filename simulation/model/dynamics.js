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
	let tau_B_thrust_1 = crossVec3f([-L, 0, L], F1);
	let tau_B_thrust_2 = crossVec3f([L, 0, L], F2);
	let tau_B_thrust_3 = crossVec3f([L, 0, -L], F3);
	let tau_B_thrust_4 = crossVec3f([-L, 0, -L], F4);
	let tau_B_thrust = addVec3f(tau_B_thrust_1, tau_B_thrust_2);
	tau_B_thrust = addVec3f(tau_B_thrust, tau_B_thrust_3);
	tau_B_thrust = addVec3f(tau_B_thrust, tau_B_thrust_4);
	let tau_B = tau_B_drag + tau_B_thrust;

	// --- ACCELERATIONS ---
	let linear_acceleration = addVec3f([0, -g * m, 0], multMat3f(getRotationMatrix(droneModelMatrix), f_B_thrust));
	let angular_acceleration = crossVec3f(multScalVec3f(-1, angular_velocity_B), multMatVec3f(loc_I_mat, angular_velocity_B));



}, dt);
