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

const omega_min = 20
const omega_max = 66

var omega_1 = 46.0;
var omega_2 = 45.0;
var omega_3 = 45.0;
var omega_4 = 45.0;

var d = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dt = 0.001;

var paused = false;

setInterval(() => {
	if (!paused) {
		console.clear();
		console.log("Console was cleared");
	}
}, 5000);


setInterval(() => {
	if (keys["p"]) {
		paused = true;
	}

	if (keys["g"]) {
		paused = false;
	}

	var factoromega = (keys["h"] ? 0.1 : keys["j"] ? -0.1 : 0.0);
	var factoromega_1 = (keys["1"] ? 0.1 : keys["2"] ? -0.1 : 0.0);
	var factoromega_2 = (keys["3"] ? 0.1 : keys["4"] ? -0.1 : 0.0);
	var factoromega_3 = (keys["5"] ? 0.1 : keys["6"] ? -0.1 : 0.0);
	var factoromega_4 = (keys["7"] ? 0.1 : keys["8"] ? -0.1 : 0.0);
	omega_1 = Math.min(Math.max(20, omega_1 + factoromega + factoromega_1), omega_max);
	omega_2 = Math.min(Math.max(20, omega_2 + factoromega + factoromega_2), omega_max);
	omega_3 = Math.min(Math.max(20, omega_3 + factoromega + factoromega_3), omega_max);
	omega_4 = Math.min(Math.max(20, omega_4 + factoromega + factoromega_4), omega_max);
	if (keys["r"]) {
		d = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		omega_1 = 50.0;
		omega_2 = 50.0;
		omega_3 = 50.0;
		omega_4 = 50.0;

	}

}, 10);


droneDynamics();
function droneDynamics() {
	if (!paused) {
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

		console.log("x: " + d[0].toFixed(1) +
			" y: " + d[1].toFixed(1) +
			" z: " + d[2].toFixed(1) +
			" theta: " + d[3].toFixed(1) +
			" phi: " + d[4].toFixed(1) +
			" psi: " + d[5].toFixed(1));
		console.log("omega_1: " + omega_1.toFixed(1) +
			" omega_2: " + omega_2.toFixed(1) +
			" omega_3: " + omega_3.toFixed(1) +
			" omega_4: " + omega_4.toFixed(1));
	}
	setTimeout(droneDynamics, 1000);
}
