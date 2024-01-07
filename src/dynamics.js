// ----------------------------------- CONSTANTS -----------------------------------
const k_f = 0.00141446535;
const k_m = 0.0004215641;
const m = 1.0;
const L = 0.23;
const I_hat = vecToDiagMat3f([0.0121, 0.0223, 0.0119]);
const g = 9.81;
const omega_min = 20
const omega_max = 66

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 41.66;
var omega_2 = 41.65;
var omega_3 = 41.65;
var omega_4 = 41.65;

var glob_lin_vel = [0.0, 0.0, 0.0];
var loc_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_pos = [0.0, 0.0, 0.0];

setInterval(function () {

	let F1 = k_f * omega_1 * omega_1;
	let F2 = k_f * omega_2 * omega_2;
	let F3 = k_f * omega_3 * omega_3;
	let F4 = k_f * omega_4 * omega_4;

	let M1 = k_m * omega_1 * omega_1;
	let M2 = k_m * omega_2 * omega_2;
	let M3 = k_m * omega_3 * omega_3;
	let M4 = k_m * omega_4 * omega_4;

	let R = transpMat3f(multMat3f(xRotMat3f(glob_rot_pos[0]), multMat3f(yRotMat3f(glob_rot_pos[1]), zRotMat3f(glob_rot_pos[2]))));

	// --- THRUST AND POSITION ---
	let glob_thrust = multMatVec3f(R, [0, F1 + F2 + F3 + F4, 0]);
	let glob_lin_acc = [glob_thrust[0] / m, glob_thrust[1] / m - g, glob_thrust[2] / m];
	glob_lin_vel = addVec3f(glob_lin_vel, multScalVec3f(dt, glob_lin_acc));

	// --- TORQUE AND ROTATION ---
	let torque = [L * ((F3 + F4) - (F2 + F1)), (M1 + M3) - (M2 + M4), L * ((F2 + F3) - (F1 + F4))];
	let loc_rot_acc = multMatVec3f(invMat3f(I_hat), subVec3f(torque, crossVec3f(loc_rot_vel, multMatVec3f(I_hat, loc_rot_vel))));
	loc_rot_vel = addVec3f(loc_rot_vel, multScalVec3f(dt, loc_rot_acc));
	let glob_rot_vel = multMatVec3f(R, loc_rot_vel);
	glob_rot_pos = addVec3f(glob_rot_pos, multScalVec3f(dt, glob_rot_vel));


	// --- UPDATE MODEL MATRIX ---
	//droneModelMatrix = multMat4f(transMat4f(glob_lin_vel[0], glob_lin_vel[1], glob_lin_vel[2]), droneModelMatrix);
	/*droneModelMatrix = multMat4f(xRotMat4f(glob_rot_vel[0]), droneModelMatrix);
	droneModelMatrix = multMat4f(yRotMat4f(glob_rot_vel[1]), droneModelMatrix);
	droneModelMatrix = multMat4f(zRotMat4f(glob_rot_vel[2]), droneModelMatrix);*/

}, dt * 1000);
