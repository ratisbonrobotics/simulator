// ----------------------------------- LOGIC -----------------------------------
droneModelMatrix = createModelMatrix(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
terrainModelMatrix = createModelMatrix(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);

const k_f = 0.00141446535;
const k_m = 0.0004215641;
const m = 1.0;
const L = 0.23;
const i_x = 0.0121;
const i_y = 0.0119;
const i_z = 0.0223;
const g = 9.81;

var omega_1 = 0.0;
var omega_2 = 0.0;
var omega_3 = 0.0;
var omega_4 = 0.0;

var d = [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dt = 0.0001;

droneDynamics();
function droneDynamics() {
	if (running) {
		droneModelMatrix = createModelMatrix(d[0], d[1], d[2], d[3], d[4], d[5], 1.0, 1.0, 1.0);
		let ddot = [
			d[6],  // \dot x
			d[7],  // \dot y
			d[8],  // \dot z
			d[9] + d[10] * Math.sin(d[3]) * Math.tan(d[4]) + d[11] * Math.cos(d[3]) * Math.tan(d[4]),  // \dot\theta'
			d[10] * Math.cos(d[3]) - d[11] * Math.sin(d[3]),  // \dot\phi'
			d[10] * Math.sin(d[3]) / Math.cos(d[4]) + d[11] * Math.cos(d[3]) / Math.cos(d[4]),  // \dot\psi'

			// Linear accelerations
			m ** (-1) * Math.sin(d[5]) * Math.cos(d[4]) * (k_f * (Math.pow(omega_1, 2) + Math.pow(omega_2, 2) + Math.pow(omega_3, 2) + Math.pow(omega_4, 2))),  // Along x
			m ** (-1) * (Math.sin(d[4]) * Math.sin(d[5]) * Math.sin(d[3]) + Math.cos(d[5]) * Math.cos(d[3])) * (k_f * (Math.pow(omega_1, 2) + Math.pow(omega_2, 2) + Math.pow(omega_3, 2) + Math.pow(omega_4, 2))) - g,  // Along y
			m ** (-1) * (Math.sin(d[4]) * Math.sin(d[5]) * Math.cos(d[3]) - Math.sin(d[3]) * Math.cos(d[5])) * (k_f * (Math.pow(omega_1, 2) + Math.pow(omega_2, 2) + Math.pow(omega_3, 2) + Math.pow(omega_4, 2))),  // Along z

			// Angular accelerations
			i_x ** (-1) * (L * k_f * ((Math.pow(omega_3, 2) + Math.pow(omega_4, 2)) - (Math.pow(omega_2, 2) + Math.pow(omega_1, 2))) - d[11] * d[10] * (i_x - i_y)),  // \dot\theta'
			i_y ** (-1) * (k_m * ((Math.pow(omega_1, 2) + Math.pow(omega_3, 2)) - (Math.pow(omega_2, 2) + Math.pow(omega_4, 2))) - d[11] * d[9] * (i_x - i_z)),  // \dot\phi'
			i_z ** (-1) * (L * ((Math.pow(omega_2, 2) + Math.pow(omega_3, 2)) - (Math.pow(omega_1, 2) + Math.pow(omega_4, 2))) - d[9] * d[10] * (i_y - i_x))  // \dot\psi'
		];

		d = d.map((val, index) => val + dt * ddot[index]);

	}
	setTimeout(droneDynamics, 10);
}
