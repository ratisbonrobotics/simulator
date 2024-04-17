// ----------------------------------- CONTROL PARAMETERS -----------------------------------
const Kp_pitch = 0.5;
const Kd_pitch = 0.3;

const Kp_roll = 0.5;
const Kd_roll = 0.3;

const Kp_yaw = 0.5;

var desired_loc_rot_vel = [0.0, 0.0, 0.0];
var desired_loc_rot_pos = [0.0, 0.0, 0.0];

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    // --- USER INPUT ---
    if (attachedToDrone && keys["w"]) {
        desired_loc_rot_vel[0] = -0.1; // Pitch forward
    } else if (attachedToDrone && keys["s"]) {
        desired_loc_rot_vel[0] = 0.1; // Pitch backward
    } else {
        desired_loc_rot_vel[0] = 0.0; // No pitch input
    }

    if (attachedToDrone && keys["q"]) {
        desired_loc_rot_vel[1] = -0.2; // Yaw left
    } else if (attachedToDrone && keys["e"]) {
        desired_loc_rot_vel[1] = 0.2; // Yaw right
    } else {
        desired_loc_rot_vel[1] = 0.0; // No yaw input
    }

    if (attachedToDrone && keys["a"]) {
        desired_loc_rot_vel[2] = 0.1; // Roll left
    } else if (attachedToDrone && keys["d"]) {
        desired_loc_rot_vel[2] = -0.1; // Roll right
    } else {
        desired_loc_rot_vel[2] = 0.0; // No roll input
    }

    // --- CONTROL ---
    let pitch_control = Kp_pitch * (desired_loc_rot_vel[0] - loc_rot_vel[0]) + Kd_pitch * (desired_loc_rot_pos[0] - loc_rot_pos[0]);
    let yaw_control = Kp_yaw * (desired_loc_rot_vel[1] - loc_rot_vel[1]);
    let roll_control = Kp_roll * (desired_loc_rot_vel[2] - loc_rot_vel[2]) + Kd_roll * (desired_loc_rot_pos[2] - loc_rot_pos[2]);

    // --- MOTOR COMMANDS ---
    omega_1 = omega_stable + roll_control + pitch_control - yaw_control;
    omega_2 = omega_stable - roll_control + pitch_control + yaw_control;
    omega_3 = omega_stable - roll_control - pitch_control - yaw_control;
    omega_4 = omega_stable + roll_control - pitch_control + yaw_control;

}, dt * 10);