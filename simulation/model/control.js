// ----------------------------------- CONTROL PARAMETERS -----------------------------------
const Kp_pitch = 0.5;
const Kd_pitch = 0.3;

const Kp_yaw = 0.5;

const Kp_roll = 0.5;
const Kd_roll = 0.3;

var desired_loc_rot_vel = [0.0, 0.0, 0.0];
var desired_loc_rot_pos = [0.0, 0.0, 0.0];

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    omega_1 = omega_stable;
    omega_2 = omega_stable;
    omega_3 = omega_stable;
    omega_4 = omega_stable;

    if (attachedToDrone && keys["w"]) {
        omega_1 -= 0.01;
        omega_2 -= 0.01;
        omega_3 += 0.01;
        omega_4 += 0.01;
    } else if (attachedToDrone && keys["s"]) {
        omega_1 += 0.01;
        omega_2 += 0.01;
        omega_3 -= 0.01;
        omega_4 -= 0.01;
    }

    if (attachedToDrone && keys["a"]) {
        omega_1 += 0.01;
        omega_2 -= 0.01;
        omega_3 -= 0.01;
        omega_4 += 0.01;
    } else if (attachedToDrone && keys["d"]) {
        omega_1 -= 0.01;
        omega_2 += 0.01;
        omega_3 += 0.01;
        omega_4 -= 0.01;
    }

    if (attachedToDrone && keys["q"]) {
        omega_1 += 0.01;
        omega_2 -= 0.01;
        omega_3 += 0.01;
        omega_4 -= 0.01;
    } else if (attachedToDrone && keys["e"]) {
        omega_1 -= 0.01;
        omega_2 += 0.01;
        omega_3 -= 0.01;
        omega_4 += 0.01;
    }

    /*    // --- USER INPUT ---
        if (attachedToDrone && keys["w"]) {
            desired_loc_rot_vel[0] = -0.01; // Pitch forward
        } else if (attachedToDrone && keys["s"]) {
            desired_loc_rot_vel[0] = 0.01; // Pitch backward
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
            desired_loc_rot_vel[2] = 0.01; // Roll left
        } else if (attachedToDrone && keys["d"]) {
            desired_loc_rot_vel[2] = -0.01; // Roll right
        } else {
            desired_loc_rot_vel[2] = 0.0; // No roll input
        }
    
        // --- CONTROL ---
        let pitch_control = Kp_pitch * (desired_loc_rot_vel[0] - loc_rot_vel[0]) + Kd_pitch * (desired_loc_rot_pos[0] - getXRotFromMat4f(droneModelMatrix));
        let yaw_control = Kp_yaw * (desired_loc_rot_vel[1] - loc_rot_vel[1]);
        let roll_control = Kp_roll * (desired_loc_rot_vel[2] - loc_rot_vel[2]) + Kd_roll * (desired_loc_rot_pos[2] - getZRotFromMat4f(droneModelMatrix));
    
        // --- MOTOR COMMANDS ---
        omega_1 = omega_stable + pitch_control - yaw_control + roll_control;
        omega_2 = omega_stable + pitch_control + yaw_control - roll_control;
        omega_3 = omega_stable - pitch_control - yaw_control - roll_control;
        omega_4 = omega_stable - pitch_control + yaw_control + roll_control;
    */
}, dt * 10);