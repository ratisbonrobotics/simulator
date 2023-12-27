// ----------------------------------- LOGIC -----------------------------------
droneModelMatrix = createModelMatrix(0, 0, 0, 0, 0, 0, 1.0, 1.0, 1.0);

droneLogic();
function droneLogic() {
	if (running) {

	}
	setTimeout(droneLogic, 100);
}
