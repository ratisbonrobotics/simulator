// ----------------------------------- CONSTANTS -----------------------------------
const k_f = 0.00141446535;
const k_m = 0.000001215641;
const L = 0.23;
const l = (L / Math.sqrt(2));
const I = [0.0121, 0.0223, 0.0119];
const loc_I_mat = vecToDiagMat3f(I);
const loc_I_mat_inv = invMat3f(loc_I_mat);
const g = 9.81;
const m = 1.0;
const omega_min = 20
const omega_max = 66

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 41.8;
var omega_2 = 41.65;
var omega_3 = 41.8;
var omega_4 = 41.65;

var loc_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_pos = [0.0, 0.0, 0.0];
var glob_lin_vel = [0.0, 0.0, 0.0];
var glob_lin_pos = [0.0, 0.2, 0.0];

setInterval(function () {

	let F1_up = k_f * omega_1 * omega_1;
	let F2_up = k_f * omega_2 * omega_2;
	let F3_up = k_f * omega_3 * omega_3;
	let F4_up = k_f * omega_4 * omega_4;

	let F1_rot = k_m * omega_1 * omega_1;
	let F2_rot = k_m * omega_2 * omega_2;
	let F3_rot = k_m * omega_3 * omega_3;
	let F4_rot = k_m * omega_4 * omega_4;

	let R = multMat3f(multMat3f(xRotMat3f(glob_rot_pos[0]), yRotMat3f(glob_rot_pos[1])), zRotMat3f(glob_rot_pos[2]));
	let R_T = transpMat3f(R);

	// --- THRUST AND POSITION ---
	let glob_lin_acc = addVec3f(multScalVec3f(1 / m, multMatVec3f(R_T, [0, (F1_up + F2_up + F3_up + F4_up), 0])), [0, -g, 0]);
	glob_lin_vel = addVec3f(glob_lin_vel, multScalVec3f(dt, glob_lin_acc));
	glob_lin_pos = addVec3f(glob_lin_pos, multScalVec3f(dt, glob_lin_vel));

	// --- TORQUE AND ROTATION ---
	let tau_1 = crossVec3f([-l, 0.2 * l, l], [F1_rot / 2, F1_up, F1_rot / 2]);
	let tau_2 = crossVec3f([l, 0.2 * l, l], [F2_rot / 2, F2_up, -F2_rot / 2]);
	let tau_3 = crossVec3f([l, 0.2 * l, -l], [-F3_rot / 2, F3_up, -F3_rot / 2]);
	let tau_4 = crossVec3f([-l, 0.2 * l, -l], [-F4_rot / 2, F4_up, F4_rot / 2]);

	// Sum up all the torques
	let loc_torque = [0, 0, 0];
	loc_torque = addVec3f(loc_torque, tau_1);
	loc_torque = addVec3f(loc_torque, tau_2);
	loc_torque = addVec3f(loc_torque, tau_3);
	loc_torque = addVec3f(loc_torque, tau_4);
	//loc_torque = multScalVec3f(-1, loc_torque);

	let loc_rot_acc = multMatVec3f(loc_I_mat_inv, subVec3f(loc_torque, crossVec3f(loc_rot_vel, multMatVec3f(loc_I_mat, loc_rot_vel))));
	loc_rot_vel = addVec3f(loc_rot_vel, multScalVec3f(dt, loc_rot_acc));

	let glob_rot_acc = multMatVec3f(R_T, loc_rot_acc);
	glob_rot_vel = addVec3f(glob_rot_vel, multScalVec3f(dt, glob_rot_acc));
	glob_rot_pos = addVec3f(glob_rot_pos, multScalVec3f(dt, glob_rot_vel));

	// --- UPDATE MODEL MATRIX ---
	droneModelMatrix = modelMat4f(glob_lin_pos[0], glob_lin_pos[1], glob_lin_pos[2], glob_rot_pos[0], glob_rot_pos[1], glob_rot_pos[2], 0.01, 0.01, 0.01);

	if (glob_lin_pos[0] > 1 || glob_lin_pos[0] < -1 || glob_lin_pos[1] > 1 || glob_lin_pos[1] < -1 || glob_lin_pos[2] > 1 || glob_lin_pos[2] < -1) {
		loc_rot_vel = [0.0, 0.0, 0.0];
		glob_rot_vel = [0.0, 0.0, 0.0];
		glob_rot_pos = [0.0, 0.0, 0.0];
		glob_lin_vel = [0.0, 0.0, 0.0];
		glob_lin_pos = [0.0, 0.2, 0.0];
	}

}, dt * 1000);
