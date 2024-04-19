// ----------------------------------- CONTROL PARAMETERS -----------------------------------
var linear_position_d_W = [1, 1, 1];
var linear_velocity_d_W = [0, 0, 0];
var linear_acceleration_d_W = [0, 0, 0];
var angular_velocity_d_B = [0, 0, 0];
var angular_acceleration_d_B = [0, 0, 0];
var yaw_d = 3.14;

const k_p = 1.0;
const k_v = 1.0;
const k_R = 1.0;
const k_w = 1.0;

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    // --- LINEAR CONTROL ---
    let error_p = subVec3f(linear_position_W, linear_position_d_W);
    let error_v = subVec3f(linear_position_W, linear_position_d_W);

    let z_W_d = multScalVec3f(-k_p, error_p);
    z_W_d = addVec3f(z_W_d, multScalVec3f(-k_v, error_v));
    z_W_d = addVec3f(z_W_d, [0, m * g, 0]);
    z_W_d = addVec3f(z_W_d, multScalVec3f(m, linear_acceleration_d_W));
    let z_W_B = multMatVec3f(R_W_B, [0, 1, 0]);
    let f_z_B_control = dotVec3f(z_W_d, z_W_B);

    // --- ANGULAR CONTROL ---
    let x_tilde_d_W = [Math.cos(yaw_d), 0, Math.sin(yaw_d)];
    let R_W_d_column_2 = normVec3f(z_W_d);
    let R_W_d_column_1 = normVec3f(crossVec3f(z_W_d, x_tilde_d_W));
    let R_W_d_column_0 = normVec3f(crossVec3f(crossVec3f(z_W_d, x_tilde_d_W), z_W_d));
    let R_W_d = [
        R_W_d_column_0[0], R_W_d_column_1[0], R_W_d_column_2[0],
        R_W_d_column_0[1], R_W_d_column_1[1], R_W_d_column_2[1],
        R_W_d_column_0[2], R_W_d_column_1[2], R_W_d_column_2[2]
    ];

    let error_r = so3vee(subMat3f(multMat3f(transpMat3f(R_W_d), R_W_B), multMat3f(transpMat3f(R_W_B), R_W_d)));
    let error_w = subVec3f(angular_velocity_B, multMatVec3f(multMat3f(transpMat3f(R_W_d), R_W_B), angular_velocity_d_B));

    let tau_B_control = multScalVec3f(-k_R, error_r);
    tau_B_control = addVec3f(tau_B_control, multScalVec3f(-k_w, error_w));
    tau_B_control = addVec3f(tau_B_control, crossVec3f(angular_velocity_B, multMatVec3f(loc_I_mat, angular_velocity_B)));
    let term_0 = multMat3f(transpMat3f(R_W_B), multMatVec3f(R_W_d, angular_acceleration_d_B));
    let term_1 = crossVec3f(angular_velocity_B, multMat3f(transpMat3f(R_W_B), multMatVec3f(R_W_d, angular_velocity_d_B)));
    tau_B_control = subVec3f(tau_B_control, multMatVec3f(loc_I_mat, subVec3f(term_1, term_0)));

}, dt * 10);