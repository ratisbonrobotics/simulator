// ----------------------------------- CONSTANTS -----------------------------------
const coff = 100;
const k_f = 1.0;
const k_m = k_f / coff;
const L = 0.25;
const l = (L / Math.sqrt(2));
const I = [0.01, 0.02, 0.01];
const loc_I_mat = vecToDiagMat3f(I);
const loc_I_mat_inv = invMat3f(loc_I_mat);
const g = 9.81;
const m = 1.0;
const omega_min = 20
const omega_max = 60

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 40.0;
var omega_2 = 40.0;
var omega_3 = 40.0;
var omega_4 = 40.0;

var loc_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_pos = [0.0, 0.0, 0.0];
var glob_lin_vel = [0.0, 0.0, 0.0];
var glob_lin_pos = [0.0, 0.2, 0.0];

setInterval(function () {

	let R = multMat3f(multMat3f(xRotMat3f(glob_rot_pos[0]), yRotMat3f(glob_rot_pos[1])), zRotMat3f(glob_rot_pos[2]));
	let R_T = transpMat3f(R);

	// --- THRUST AND POSITION ---
	let F1_up = k_f * omega_1 * omega_1;
	let F2_up = k_f * omega_2 * omega_2;
	let F3_up = k_f * omega_3 * omega_3;
	let F4_up = k_f * omega_4 * omega_4;

	let F1_perp = k_m * omega_1 * omega_1;
	let F2_perp = k_m * omega_2 * omega_2;
	let F3_perp = k_m * omega_3 * omega_3;
	let F4_perp = k_m * omega_4 * omega_4;

	let loc_F1 = crossVec3f([-l, 0.2 * l, l], [F1_perp / 2, F1_up, F1_perp / 2]);
	let loc_F2 = crossVec3f([l, 0.2 * l, l], [F2_perp / 2, F2_up, -F2_perp / 2]);
	let loc_F3 = crossVec3f([l, 0.2 * l, -l], [-F3_perp / 2, F3_up, -F3_perp / 2]);
	let loc_F4 = crossVec3f([-l, 0.2 * l, -l], [-F4_perp / 2, F4_up, F4_perp / 2]);

	let loc_F = [0, 0, 0];
	loc_F = addVec3f(loc_F, loc_F1);
	loc_F = addVec3f(loc_F, loc_F2);
	loc_F = addVec3f(loc_F, loc_F3);
	loc_F = addVec3f(loc_F, loc_F4);
	let loc_lin_acc = multScalVec3f(1 / m, loc_F);

	console.log(loc_lin_acc);

	let glob_lin_acc = addVec3f(multMatVec3f(R_T, loc_lin_acc), [0, -g, 0]);

	glob_lin_vel = addVec3f(glob_lin_vel, multScalVec3f(dt, glob_lin_acc));
	glob_lin_pos = addVec3f(glob_lin_pos, multScalVec3f(dt, glob_lin_vel));

	// --- TORQUE AND ROTATION ---
	let loc_rot_acc = multMatVec3f(loc_I_mat_inv, subVec3f(loc_F, crossVec3f(loc_rot_vel, multMatVec3f(loc_I_mat, loc_rot_vel))));
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
