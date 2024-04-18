// ----------------------------------- CONTROL PARAMETERS -----------------------------------
var linear_position_d_W = [1, 1, 1];
var linear_velocity_d_W = [0, 0, 0];
var yaw_d = 3.14;

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    let error_p = subVec3f(linear_position_W, linear_position_d_W);
    let error_v = subVec3f(linear_position_W, linear_position_d_W);

}, dt * 10);