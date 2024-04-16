// ----------------------------------- CONTROL PARAMETERS -----------------------------------
const Kp_pitch = 0.5;
const Kd_pitch = 0.05;

const Kp_yaw = 0.5;
const Kd_yaw = 0.05;

var desired_loc_rot_pos = [0.0, 0.0, 0.0];
var desired_loc_rot_vel = [0.0, 0.0, 0.0];
var desired_loc_rot_acc = [0.0, 0.0, 0.0];

var desired_loc_lin_pos = [0.0, 0.0, 0.0];
var desired_loc_lin_vel = [0.0, 0.0, 0.0];
var desired_loc_lin_acc = [0.0, 0.0, 0.0];

var desired_glob_lin_pos = [0.0, 1.0, 0.0];
var desired_glob_lin_vel = [0.0, 0.0, 0.0];
var desired_glob_lin_acc = [0.0, 0.0, 0.0];

var forward_backward = 0.0;
var turn_left_right = 0.0;

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    // --- PITCH INPUT ---
    if (attachedToDrone && keys["w"]) {
        forward_backward = 0.1;
    } else if (attachedToDrone && keys["s"]) {
        forward_backward = -0.1;
    } else {
        forward_backward = 0.0;
    }

    // --- YAW INPUT ---
    if (attachedToDrone && keys["q"]) {
        turn_left_right = 0.1;
    } else if (attachedToDrone && keys["e"]) {
        turn_left_right = -0.1;
    } else {
        turn_left_right = 0.0;
    }

    

    // --- MOTOR COMMANDS ---
    omega_1 = omega_stable - forward_backward + turn_left_right;
    omega_2 = omega_stable - forward_backward - turn_left_right;
    omega_3 = omega_stable + forward_backward + turn_left_right;
    omega_4 = omega_stable + forward_backward - turn_left_right;

}, dt * 10);
