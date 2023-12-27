// ----------------------------------- LOGIC -----------------------------------
droneModelMatrix = createModelMatrix(0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0);

droneLogic();
function droneLogic() {
	if (running) {
		// here we need to adjust the drones modelmatrix according to the speed of the rotors.

	}
	setTimeout(droneLogic, 100);
}
