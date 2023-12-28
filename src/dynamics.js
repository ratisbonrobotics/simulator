// ----------------------------------- LOGIC -----------------------------------
droneModelMatrix = createModelMatrix(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
terrainModelMatrix = createModelMatrix(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);

class Drone3D {
	constructor(k_f, k_m, m, L, i_x, i_y, i_z, omega_square_min, omega_square_max) {
		this.k_f = k_f;
		this.k_m = k_m;
		this.m = m;
		this.l = (L * Math.sqrt(2)) / 2;
		this.i_x = i_x;
		this.i_y = i_y;
		this.i_z = i_z;
		this.omega_square_min = omega_square_min;
		this.omega_square_max = omega_square_max;

		this.X = new Array(12).fill(0.0);
		this.omega = new Array(4).fill(0.0);
		this.g = 9.81;
	}

	// Getters for positions (in the world coordinate system)
	get x() {
		return this.X[0];
	}

	get y() {
		return this.X[1];
	}

	get z() {
		return this.X[2];
	}

	// Getters for Euler angles [rad] (in the world coordinate system)
	get phi() {
		return this.X[3];
	}

	get theta() {
		return this.X[4];
	}

	get psi() {
		return this.X[5];
	}

	// Getters for body axis angular velocities [rad/s]
	get p() {
		return this.X[9];
	}

	get q() {
		return this.X[10];
	}

	get r() {
		return this.X[11];
	}

	// Getters for forces of the four propellers [N]
	f(i) {
		return this.k_f * this.omega[i] ** 2;
	}

	get totalForce() {
		return this.f(0) + this.f(1) + this.f(2) + this.f(3);
	}

	// Getters for moments of the four propellers [N*m]
	calculateMoment(i) {
		return this.k_m * this.omega[i] ** 2;
	}

	// Getters for moments around the axes [N*m]
	get m_x() {
		return this.l * ((this.f(0) + this.f(2)) - (this.f(1) + this.f(3)));
	}

	get m_y() {
		return this.l * ((this.f(0) + this.f(1)) - (this.f(2) + this.f(3)));
	}

	get m_z() {
		return (this.calculateMoment(0) + this.calculateMoment(3)) - (this.calculateMoment(1) + this.calculateMoment(2));
	}

	// Setters for omega (propeller angular velocities) [rads/s]
	set omega1(value) {
		this.omega[0] = value;
	}

	set omega2(value) {
		this.omega[1] = value;
	}

	set omega3(value) {
		this.omega[2] = value;
	}

	set omega4(value) {
		this.omega[3] = value;
	}

	R() {
		return [
			[Math.cos(this.psi) * Math.cos(this.theta), Math.cos(this.psi) * Math.sin(this.theta) * Math.sin(this.phi) - Math.sin(this.psi) * Math.cos(this.phi), Math.sin(this.psi) * Math.sin(this.phi) + Math.cos(this.psi) * Math.sin(this.theta) * Math.cos(this.phi)],
			[Math.sin(this.psi) * Math.cos(this.theta), Math.cos(this.psi) * Math.cos(this.phi) + Math.sin(this.psi) * Math.sin(this.theta) * Math.sin(this.phi), Math.sin(this.psi) * Math.sin(this.theta) * Math.cos(this.phi) - Math.cos(this.psi) * Math.sin(this.phi)],
			[-Math.sin(this.theta), Math.cos(this.theta) * Math.sin(this.phi), Math.cos(this.theta) * Math.cos(this.phi)]
		];
	}

	linearWorldAccelerations() {
		const R = this.R();
		const g = [0, 0, this.g];
		const c = -this.totalForce;
		var v = this.addVectors(g, this.multiplyMatrixVector(R, [0, 0, c]));
		v[0] /= this.m;
		v[1] /= this.m;
		v[2] /= this.m;
		return v;
	}

	bodyAxisAccelerations() {
		const p_dot = (this.m_x - this.r * this.q * (this.i_z - this.i_y)) / this.i_x;
		const q_dot = (this.m_y - this.r * this.p * (this.i_x - this.i_z)) / this.i_y;
		const r_dot = (this.m_z - this.q * this.p * (this.i_y - this.i_x)) / this.i_z;

		return [p_dot, q_dot, r_dot];
	}

	worldAxisAccelerations() {
		const eulerRotationMatrix = [
			[1, Math.sin(this.phi) * Math.tan(this.theta), Math.cos(this.phi) * Math.tan(this.theta)],
			[0, Math.cos(this.phi), -Math.sin(this.phi)],
			[0, Math.sin(this.phi) / Math.cos(this.theta), Math.cos(this.phi) / Math.cos(this.theta)]
		];

		return this.multiplyMatrixVector(eulerRotationMatrix, [this.p, this.q, this.r]);
	}

	advanceState(dt) {
		const worldAxisAcc = this.worldAxisAccelerations();
		console.log('worldAxisAcc:', worldAxisAcc);
		const bodyAxisAcc = this.bodyAxisAccelerations();
		console.log('bodyAxisAcc:', bodyAxisAcc);
		const linearWorldAcc = this.linearWorldAccelerations();
		console.log('linearWorldAcc:', linearWorldAcc);

		const X_dot = [
			this.X[6],
			this.X[7],
			this.X[8],
			worldAxisAcc[0],
			worldAxisAcc[1],
			worldAxisAcc[2],
			linearWorldAcc[0],
			linearWorldAcc[1],
			linearWorldAcc[2],
			bodyAxisAcc[0],
			bodyAxisAcc[1],
			bodyAxisAcc[2]
		];

		for (let i = 0; i < this.X.length; i++) {
			this.X[i] += X_dot[i] * dt;
		}
	}

	// Helper methods for matrix operations
	multiplyMatrix(a, b) {
		const result = [];
		for (let i = 0; i < a.length; i++) {
			result[i] = [];
			for (let j = 0; j < b.length; j++) {
				let sum = 0;
				for (let k = 0; k < a[0].length; k++) {
					sum += a[i][k] * b[k][j];
				}
				result[i][j] = sum;
			}
		}
		return result;
	}

	multiplyMatrixVector(matrix, vector) {
		return matrix.map(row => row.reduce((sum, value, i) => sum + value * vector[i], 0));
	}

	addVectors(a, b) {
		return a.map((val, i) => val + b[i]);
	}
}

// --- Simulation Constants ---
// See chapter "Determination of Simulation Parameters"
const k_f = 0.00141446535;
const k_m = 0.0004215641;
const m = 1.0;
const L = 0.23; // See illustration "3D Drone from above" (in the list of figures)
const i_x = 0.0121;
const i_y = 0.0119;
const i_z = 0.0223;
const omega_square_min = 400;
const omega_square_max = 4356;

// --- Create Drone ---
var drone = new Drone3D(k_f, k_m, m, L, i_x, i_y, i_z, omega_square_min, omega_square_max);
drone.omega1 = 0;
drone.omega2 = 0;
drone.omega3 = 0;
drone.omega4 = 0;


droneDynamics();
function droneDynamics() {
	if (running) {
		drone.advanceState(0.0001);
		droneModelMatrix = createModelMatrix(drone.x, drone.y, drone.z, drone.phi, drone.theta, drone.psi, 1.0, 1.0, 1.0);
		console.log(drone.x, drone.y, drone.z, drone.phi, drone.theta, drone.psi, 1.0, 1.0, 1.0);
	}
	setTimeout(droneDynamics, 10);
}
