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

var glob_lin_pos = [0.0, 1.0, 0.0];
var glob_lin_vel = [0.0, 0.0, 0.0];
var glob_rot_pos = [0.0, 0.0, 0.0];
var loc_rot_vel = [0.0, 0.0, 0.0];

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

	// --- ROTATION MATRIX ---
	let R = multMat3f(multMat3f(xRotMat3f(glob_rot_pos[0]), yRotMat3f(glob_rot_pos[1])), zRotMat3f(glob_rot_pos[2]));
	let R_T = transpMat3f(R);

	// --- THRUST AND POSITION ---
	let loc_lin_acc = [0, (1 / m) * (F1 + F2 + F3 + F4), 0];
	let glob_lin_acc = subVec3f(multMatVec3f(R_T, loc_lin_acc), [0, g, 0]);
	glob_lin_vel = addVec3f(glob_lin_vel, multScalVec3f(dt, glob_lin_acc));
	glob_lin_pos = addVec3f(glob_lin_pos, multScalVec3f(dt, glob_lin_vel));
	glob_lin_pos = [0, 1, 0];

	// --- TORQUE AND ROTATION ---
	let loc_torque = [-l * (F3 + F4 - F2 - F1), -(M1 + M3 - M2 - M4), -l * (F2 + F3 - F1 - F4)];
	let loc_rot_acc = multMatVec3f(loc_I_mat_inv, subVec3f(loc_torque, crossVec3f(loc_rot_vel, multMatVec3f(loc_I_mat, loc_rot_vel))));
	loc_rot_vel = addVec3f(loc_rot_vel, multScalVec3f(dt, loc_rot_acc));

	let glob_rot_vel = multMatVec3f(R_T, loc_rot_vel);
	glob_rot_pos = addVec3f(glob_rot_pos, multScalVec3f(dt, glob_rot_vel));
	console.log(glob_rot_pos.map(n => n.toFixed(2)));

	// --- UPDATE MODEL MATRIX ---
	droneModelMatrix = modelMat4f(glob_lin_pos[0], glob_lin_pos[1], glob_lin_pos[2], glob_rot_pos[0], glob_rot_pos[1], glob_rot_pos[2], 0.01, 0.01, 0.01);

}, dt);











/*
// --------------------------------- SENSOR DATA ----------------------------------
var loc_lin_acc_measured = [0.0, 0.0, 0.0];
var loc_rot_vel_measured = [0.0, 0.0, 0.0];
	// --- UPDATE SENSOR DATA ---
	loc_lin_acc_measured = multMatVec3f(R, glob_lin_acc);
	for (let i = 0; i < 3; i++) {
		loc_rot_vel_measured[i] = loc_rot_vel[i] + generateGaussianNoise(0, loc_rot_vel[i] * 0.003);
		loc_lin_acc_measured[i] = loc_lin_acc_measured[i] + generateGaussianNoise(0, loc_lin_acc_measured[i] * 0.003);
	}

*/