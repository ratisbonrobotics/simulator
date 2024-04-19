// ----------------------------------- CONTROL PARAMETERS -----------------------------------
var linear_position_d_W = [1, 1, 1];
var linear_velocity_d_W = [0, 0, 0];
var angular_velocity_d_B = [0, 0, 0];
var R_W_d = multMat3f(multMat3f(xRotMat3f(0), yRotMat3f(0)), zRotMat3f(0));
var yaw_d = 3.14;

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    let error_p = subVec3f(linear_position_W, linear_position_d_W);
    let error_v = subVec3f(linear_position_W, linear_position_d_W);
    let error_r = so3vee(subMat3f(multMat3f(transpMat3f(R_W_d), R_W_B), multMat3f(transpMat3f(R_W_B), R_W_d)));
    let error_w = subVec3f(angular_velocity_B, multMatVec3f(multMat3f(transpMat3f(R_W_d), R_W_B), angular_velocity_d_B));

}, dt * 10);