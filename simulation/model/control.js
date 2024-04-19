// ----------------------------------- CONTROL PARAMETERS -----------------------------------
let linear_position_d_W = [0, 1, 0];
let linear_velocity_d_W = [0, 0, 0];
let linear_acceleration_d_W = [0, 0, 0];
let angular_velocity_d_B = [0, 0, 0];
let angular_acceleration_d_B = [0, 0, 0];
let yaw_d = 0.0;

const k_p = 1.0;
const k_v = 1.0;
const k_R = 1.0;
const k_w = 1.0;

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    // --- LINEAR CONTROL ---
    let error_p = subVec3f(linear_position_W, linear_position_d_W);
    let error_v = subVec3f(linear_velocity_W, linear_velocity_d_W);

    let z_W_d = multScalVec3f(-k_p, error_p);
    z_W_d = addVec3f(z_W_d, multScalVec3f(-k_v, error_v));
    z_W_d = addVec3f(z_W_d, [0, m * g, 0]);
    z_W_d = addVec3f(z_W_d, multScalVec3f(m, linear_acceleration_d_W));
    let z_W_B = multMatVec3f(R_W_B, [0, 1, 0]);
    let f_z_B_control = dotVec3f(z_W_d, z_W_B);

    // --- ATTITIDUE CONTROL ---
    let x_tilde_d_W = [Math.cos(yaw_d), 0, -Math.sin(yaw_d)];
    let R_W_d_column_2 = normVec3f(z_W_d);
    let R_W_d_column_1 = normVec3f(crossVec3f(z_W_d, x_tilde_d_W));
    let R_W_d_column_0 = normVec3f(crossVec3f(crossVec3f(z_W_d, x_tilde_d_W), z_W_d));
    let R_W_d = [
        R_W_d_column_0[0], R_W_d_column_1[0], R_W_d_column_2[0],
        R_W_d_column_0[1], R_W_d_column_1[1], R_W_d_column_2[1],
        R_W_d_column_0[2], R_W_d_column_1[2], R_W_d_column_2[2]
    ];
    R_W_d = R_W_B; // cheat.

    let error_r = multScalVec3f(0.5, so3vee(subMat3f(multMat3f(transpMat3f(R_W_d), R_W_B), multMat3f(transpMat3f(R_W_B), R_W_d))));
    let error_w = subVec3f(angular_velocity_B, multMatVec3f(multMat3f(transpMat3f(R_W_d), R_W_B), angular_velocity_d_B));

    let tau_B_control = multScalVec3f(-k_R, error_r);
    tau_B_control = addVec3f(tau_B_control, multScalVec3f(-k_w, error_w));
    tau_B_control = addVec3f(tau_B_control, crossVec3f(angular_velocity_B, multMatVec3f(loc_I_mat, angular_velocity_B)));
    let term_0 = multMatVec3f(transpMat3f(R_W_B), multMatVec3f(R_W_d, angular_acceleration_d_B));
    let term_1 = crossVec3f(angular_velocity_B, multMatVec3f(transpMat3f(R_W_B), multMatVec3f(R_W_d, angular_velocity_d_B)));
    tau_B_control = subVec3f(tau_B_control, multMatVec3f(loc_I_mat, subVec3f(term_1, term_0)));

    // --- ROTOR SPEEDS ---
    let F_bar_column_0 = addVec3f([0, k_m, 0], crossVec3f(multScalVec3f(k_f, [-L, 0, L]), [0, 1, 0]));
    let F_bar_column_1 = addVec3f([0, -k_m, 0], crossVec3f(multScalVec3f(k_f, [L, 0, L]), [0, 1, 0]));
    let F_bar_column_2 = addVec3f([0, k_m, 0], crossVec3f(multScalVec3f(k_f, [L, 0, -L]), [0, 1, 0]));
    let F_bar_column_3 = addVec3f([0, -k_m, 0], crossVec3f(multScalVec3f(k_f, [-L, 0, -L]), [0, 1, 0]));
    let F_bar = [
        k_f, k_f, k_f, k_f,
        F_bar_column_0[0], F_bar_column_1[0], F_bar_column_2[0], F_bar_column_3[0],
        F_bar_column_0[1], F_bar_column_1[1], F_bar_column_2[1], F_bar_column_3[1],
        F_bar_column_0[2], F_bar_column_1[2], F_bar_column_2[2], F_bar_column_3[2]
    ];
    let F_bar_inv = inv4Mat4f(F_bar);
    //console.log(F_bar);
    let omega_sign_square = multMatVec4f(F_bar_inv, [f_z_B_control, tau_B_control[0], tau_B_control[1], tau_B_control[2]]);
    console.log(omega_sign_square);
    //console.log(omega_sign_square.map(n => Math.sqrt(Math.abs(n))));
    /*omega_1 = Math.sqrt(Math.abs(omega_sign_square[0]));
    omega_2 = Math.sqrt(Math.abs(omega_sign_square[1]));
    omega_3 = Math.sqrt(Math.abs(omega_sign_square[2]));
    omega_4 = Math.sqrt(Math.abs(omega_sign_square[3]));*/

}, dt * 10);