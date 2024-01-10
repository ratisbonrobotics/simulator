function generateGaussianNoise(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

var mean = 0;
var stdDev = 0.00001;

var loc_rot_vel_measured = [0.0, 0.0, 0.0];

setInterval(function () {

    for (var i = 0; i < 3; i++) {
        loc_rot_vel_measured[i] = loc_rot_vel[i] + generateGaussianNoise(mean, stdDev);
    }

    console.log(loc_rot_vel, loc_rot_vel_measured);



}, 1000);
