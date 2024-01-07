// ----------------------------------- CONSTANTS -----------------------------------
const k_f = 0.00141446535;
const k_m = 0.0004215641;
const L = 0.23;
const I_hat = vecToDiagMat3f([0.0121, 0.0223, 0.0119]);
const inv_I_hat = invMat3f(I_hat);
const g = 9.81;
const m = 1.0;
const omega_min = 20
const omega_max = 66

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 41.68;
var omega_2 = 41.65;
var omega_3 = 41.65;
var omega_4 = 41.65;

var loc_rot_vel = [0.0, 0.0, 0.0];
var glob_lin_vel = [0.0, 0.0, 0.0];

var glob_rot_pos = [0.0, 0.0, 0.0];
var glob_lin_pos = [0.0, 0.2, 0.0];

setInterval(function () {

	let F1 = k_f * omega_1 * omega_1;
	let F2 = k_f * omega_2 * omega_2;
	let F3 = k_f * omega_3 * omega_3;
	let F4 = k_f * omega_4 * omega_4;

	let M1 = k_m * omega_1 * omega_1;
	let M2 = k_m * omega_2 * omega_2;
	let M3 = k_m * omega_3 * omega_3;
	let M4 = k_m * omega_4 * omega_4;

	let R = xRotMat3f(glob_rot_pos[0]);
	R = multMat3f(R, yRotMat3f(glob_rot_pos[1]));
	R = multMat3f(R, zRotMat3f(glob_rot_pos[2]));
	R = transpMat3f(R);

	// --- THRUST AND POSITION ---
	glob_lin_vel = addVec3f(glob_lin_vel, multScalVec3f(dt, subVec3f(multScalVec3f(1 / m, multMatVec3f(R, [0, (F1 + F2 + F3 + F4), 0])), [0, g, 0])));
	glob_lin_pos = addVec3f(glob_lin_pos, multScalVec3f(dt, glob_lin_vel));

	// --- TORQUE AND ROTATION ---
	loc_rot_vel = addVec3f(loc_rot_vel, multScalVec3f(dt, multMatVec3f(inv_I_hat, subVec3f([L * ((F3 + F4) - (F2 + F1)), (M1 + M3) - (M2 + M4), L * ((F2 + F3) - (F1 + F4))], crossVec3f(loc_rot_vel, multMatVec3f(I_hat, loc_rot_vel))))));
	R = transpMat3f(R);
	glob_rot_pos = addVec3f(glob_rot_pos, multScalVec3f(dt, multMatVec3f(R, loc_rot_vel)));


	// --- UPDATE MODEL MATRIX ---
	droneModelMatrix = identMat4f();
	droneModelMatrix = multMat4f(translMat4f(glob_lin_pos[0], glob_lin_pos[1], glob_lin_pos[2]), droneModelMatrix);
	droneModelMatrix = multMat4f(xRotMat4f(glob_rot_pos[0]), droneModelMatrix);
	droneModelMatrix = multMat4f(yRotMat4f(glob_rot_pos[1]), droneModelMatrix);
	droneModelMatrix = multMat4f(zRotMat4f(glob_rot_pos[2]), droneModelMatrix);
	droneModelMatrix = multMat4f(scaleMat4f(0.01, 0.01, 0.01), droneModelMatrix);



	if (glob_lin_pos[0] > 1 || glob_lin_pos[0] < -1 || glob_lin_pos[1] > 1 || glob_lin_pos[1] < -1 || glob_lin_pos[2] > 1 || glob_lin_pos[2] < -1) {
		loc_rot_vel = [0.0, 0.0, 0.0];
		glob_lin_vel = [0.0, 0.0, 0.0];
		glob_lin_pos = [0.0, 0.2, 0.0];
		glob_rot_pos = [0.0, 0.0, 0.0];
	}


}, dt * 1000);
