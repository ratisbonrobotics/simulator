// ----------------------------------- CONTROL PARAMETERS -----------------------------------
const Kp_pitch = 0.5;
const Kd_pitch = 0.05;
const Kp_yaw = 0.5;

var desired_loc_rot_vel = [0.0, 0.0, 0.0];
var desired_loc_rot_pos = [0.0, 0.0, 0.0];

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    // --- USER INPUT ---
    if (attachedToDrone && keys["w"]) {
        desired_loc_rot_vel[0] = 0.1; // Pitch forward
    } else if (attachedToDrone && keys["s"]) {
        desired_loc_rot_vel[0] = -0.1; // Pitch backward
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

    // --- CONTROL ---
    let pitch_control = Kp_pitch * (desired_loc_rot_vel[0] - loc_rot_vel[0]) + Kd_pitch * (desired_loc_rot_pos[0] - loc_rot_pos[0]);
    let yaw_control = Kp_yaw * (desired_loc_rot_vel[1] - loc_rot_vel[1]);

    // --- MOTOR COMMANDS ---
    omega_1 = omega_stable + pitch_control - yaw_control;
    omega_2 = omega_stable + pitch_control + yaw_control;
    omega_3 = omega_stable - pitch_control - yaw_control;
    omega_4 = omega_stable - pitch_control + yaw_control;
}, dt * 10);