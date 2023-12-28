// ----------------------------------- LOGIC -----------------------------------
droneModelMatrix = createModelMatrix(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
terrainModelMatrix = createModelMatrix(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);

droneDynamics();
function droneDynamics() {
	if (running) {
		droneModelMatrix = mult(createYRotationMatrix(degreeToRadians(0.1)), droneModelMatrix);
		// here we need to adjust the drones modelmatrix according to the speed of the rotors.

	}
	setTimeout(droneDynamics, 10);
}
