// ----------------------------------- LOGIC -----------------------------------
function checkRuleConditions(neighborcount, values) {
	for (var i = 0; i < values.length; i++) {
		if (neighborcount == values[i]) return true;
	}
	return false;
}

function createCellGridWireframe(cellularworldsize, randomize) {
	var cellgrid = [];
	for (var x = 0; x < cellularworldsize; x++) {
		cellgrid[x] = [];
		for (var y = 0; y < cellularworldsize; y++) {
			cellgrid[x][y] = [];
			for (var z = 0; z < cellularworldsize; z++) {
				if (randomize) cellgrid[x][y][z] = Math.random() >= 0.5 ? 1 : 0;
				else cellgrid[x][y][z] = 0;

				// mark world edges
				if (y == 0 && z == 0) cellgrid[x][y][z] = 1;
				if (x == 0 && z == 0) cellgrid[x][y][z] = 1;
				if (x == 0 && y == 0) cellgrid[x][y][z] = 1;

				if (y == cellularworldsize - 1 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && y == cellularworldsize - 1) cellgrid[x][y][z] = 1;

				if (y == cellularworldsize - 1 && z == 0) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && z == 0) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && y == 0) cellgrid[x][y][z] = 1;

				if (y == 0 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == 0 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == 0 && y == cellularworldsize - 1) cellgrid[x][y][z] = 1;
			}
		}
	}
	return cellgrid;
}

var cellularworldsize = 60;
var cellgrid = createCellGridWireframe(cellularworldsize, true);
var survivevalues = [20, 24]
var bornvalues = [4]

cellularAutomataLogic();
function cellularAutomataLogic() {
	if (running) {

		var cellgridnextframe = createCellGridWireframe(cellularworldsize, false);

		for (var x = 2; x < cellularworldsize - 2; x++) {
			for (var y = 2; y < cellularworldsize - 2; y++) {
				for (var z = 2; z < cellularworldsize - 2; z++) {
					// get cell status
					var status = cellgrid[x][y][z];

					// get neighbor count
					var zm1 = z - 1 < 2 ? cellularworldsize - 3 : z - 1;
					var zp1 = z + 1 == cellularworldsize - 2 ? 2 : z + 1;
					var ym1 = y - 1 < 2 ? cellularworldsize - 3 : y - 1;
					var yp1 = y + 1 == cellularworldsize - 2 ? 2 : y + 1;
					var xm1 = x - 1 < 2 ? cellularworldsize - 3 : x - 1;
					var xp1 = x + 1 == cellularworldsize - 2 ? 2 : x + 1;

					// below
					var neighborcount = cellgrid[x][y][zm1] + cellgrid[x][yp1][zm1] + cellgrid[x][ym1][zm1] + cellgrid[xp1][y][zm1]
						+ cellgrid[xm1][y][zm1] + cellgrid[xp1][yp1][zm1] + cellgrid[xp1][ym1][zm1] + cellgrid[xm1][ym1][zm1] + cellgrid[xm1][yp1][zm1];

					// level
					neighborcount += cellgrid[x][yp1][z] + cellgrid[x][ym1][z] + cellgrid[xp1][y][z]
						+ cellgrid[xm1][y][z] + cellgrid[xp1][yp1][z] + cellgrid[xp1][ym1][z] + cellgrid[xm1][ym1][z] + cellgrid[xm1][yp1][z];

					// above
					neighborcount += cellgrid[x][y][zp1] + cellgrid[x][yp1][zp1] + cellgrid[x][ym1][zp1] + cellgrid[xp1][y][zp1]
						+ cellgrid[xm1][y][zp1] + cellgrid[xp1][yp1][zp1] + cellgrid[xp1][ym1][zp1] + cellgrid[xm1][ym1][zp1] + cellgrid[xm1][yp1][zp1];

					// if cell alive and neighborcount is 20 or 24 it stays alive
					if (status == 1 && checkRuleConditions(neighborcount, survivevalues)) {
						cellgridnextframe[x][y][z] = 1;
					}
					// if cell is dead and neighborcount is 4, it is born
					else if (status == 0 && checkRuleConditions(neighborcount, bornvalues)) {
						cellgridnextframe[x][y][z] = 1;
					}
					// in all other cases the cell remains dead or dies (already initialized as 0)
				}
			}
		}

		cellgrid = cellgridnextframe;
	}
	setTimeout(cellularAutomataLogic, 100);
}
