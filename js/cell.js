function getBaseLog(x, y) {
	return Math.log(y) / Math.log(x);
}

// ----------------------------------- LOGIC -----------------------------------
cellularautomata3d();
function cellularautomata3d() {

	function parseRulestring3D(rulestring) {
		var res = rulestring.split("/");
		res[0] = res[0].substring(1);
		res[1] = res[1].substring(1);

		var bornValues = [];
		if (res[0] == "") {
			bornValues[0] = -9999;
		} else {
			var commasplit = res[0].split(",");
			for (var i = 0; i < commasplit.length; i++) {
				bornValues[i] = parseInt(commasplit[i]);
			}
		}

		var surviveValues = [];
		if (res[1] == "") {
			surviveValues[1] = -9999;
		} else {
			var commasplit = res[1].split(",");
			for (var i = 0; i < commasplit.length; i++) {
				surviveValues[i] = parseInt(commasplit[i]);
			}
		}

		return [bornValues, surviveValues];
	}

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
	var survivevalues = parseRulestring3D($("#cellRuleInput3D").val())[1];
	var bornvalues = parseRulestring3D($("#cellRuleInput3D").val())[0];

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

						// if cell alive and neighborcount 2,3 or 8, it stays alive
						if (status == 1 && checkRuleConditions(neighborcount, survivevalues)) {
							cellgridnextframe[x][y][z] = 1;
						}
						// if cell is dead and neighborcount is 3, it is born
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



	// --- DRAWING CODE ---
	function parseOBJ(data) {

		var allVerticies = [];
		var allTexCoords = [];
		var allNormals = [];


		var objects = {};
		var objname = "";

		var individualLines = data.split('\n');

		for (var i = 0; i < individualLines.length; i++) {
			var lineElements = individualLines[i].split(' ');
			var type = lineElements[0];
			switch (type) {
				case "#":
					break;
				case " ":
					break;
				case "o":
					objname = lineElements[1];
					objects[objname] = {};
					objects[objname].positions = [];
					objects[objname].texcoords = [];
					objects[objname].normals = [];
					break;
				case "v":
					allVerticies.push([lineElements[1], lineElements[2], lineElements[3]].map(parseFloat));
					break;
				case "vt":
					allTexCoords.push([lineElements[1], lineElements[2]].map(parseFloat));
					break;
				case "vn":
					allNormals.push([lineElements[1], lineElements[2], lineElements[3]].map(parseFloat));
					break;
				case "f":
					var faceParts = [];
					for (var j = 0; j < lineElements.length - 1; j++) {
						faceParts[j] = lineElements[j + 1].split('/').map(str => parseInt(str) - 1);
					}
					objects[objname].positions.push(allVerticies[faceParts[0][0]], allVerticies[faceParts[1][0]], allVerticies[faceParts[2][0]]);
					objects[objname].texcoords.push(allTexCoords[faceParts[0][1]], allTexCoords[faceParts[1][1]], allTexCoords[faceParts[2][1]]);
					objects[objname].normals.push(allNormals[faceParts[0][2]], allNormals[faceParts[1][2]], allNormals[faceParts[2][2]]);
					break;
				default:
				//console.warn("objloader: unhandled keyword: ", type);
			}
		}

		for (var obj in objects) {
			objects[obj].positions = objects[obj].positions.flat();
			objects[obj].texcoords = objects[obj].texcoords.flat();
			objects[obj].normals = objects[obj].normals.flat();
		}

		return objects;
	}


	const vertexshadersource = `
		precision highp float;

		attribute vec4 vertexposition;
		attribute vec2 texturecoordinate;
		attribute vec3 normal;

		uniform mat4 modelmatrix;
		uniform mat4 projectionmatrix;
		uniform mat4 viewmatrix;

		varying vec2 o_texturecoordinate;
		varying vec3 o_normal;

		void main(){
			o_texturecoordinate = texturecoordinate;
			o_normal = mat3(modelmatrix) * normal;
			gl_Position = projectionmatrix * viewmatrix * modelmatrix * vertexposition;
		}
	`;

	const fragmentshadersource = `
		precision highp float;

		varying vec2 o_texturecoordinate;
		varying vec3 o_normal;

		uniform sampler2D texture;
		uniform vec3 reverseLightDirection;

		void main(){
			vec3 normal = normalize(o_normal);
			float light = dot(normal, reverseLightDirection);

			gl_FragColor = texture2D(texture, o_texturecoordinate);
			//gl_FragColor.rgb *= light;
		}
	`;
	// --- GET CANVAS CONTEXT AND SETUP KEY LISTENERS ---
	var running = true;

	var fscanvas = $("#canvas")[0];
	fscanvas.width = Math.pow(2, Math.floor(getBaseLog(2, $(window).width() * 0.88)));
	window.addEventListener("orientationchange", function () {
		setTimeout(function () {
			var newwidth = Math.pow(2, Math.floor(getBaseLog(2, $(window).width() * 0.88)));
			fscanvas.width = newwidth;
		}, 200);
	});
	var gl = fscanvas.getContext("webgl"/*, {antialias: true}*/);
	/*
	Anti Aliasing intensity setting
	gl.enable(gl.SAMPLE_COVERAGE);
	gl.sampleCoverage(0.5, false);
	*/

	// --- ADD EVENT LISTENERS ---
	$("#cellauto3dtoggle").click(toggle);
	function toggle() { running ? (running = false, $("#cellauto3dtoggle").html("Start")) : (running = true, $("#cellauto3dtoggle").html("Stop")); }

	$("#cellauto3dapply").click(apply);
	function apply() { survivevalues = parseRulestring3D($("#cellRuleInput3D").val())[1]; bornvalues = parseRulestring3D($("#cellRuleInput3D").val())[0]; }

	$("#cellauto3drandomize").click(randomize);
	function randomize() { cellgrid = createCellGridWireframe(cellularworldsize, true); }

	// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
	fscanvas.onclick = function () {
		fscanvas.requestPointerLock();
	}

	var viewxz = 0;
	var viewy = 0;

	document.addEventListener("pointerlockchange", function () {
		if (document.pointerLockElement === fscanvas) {
			document.addEventListener("mousemove", updatePosition, false);
		} else {
			document.removeEventListener("mousemove", updatePosition, false);
		}
	}, false);

	function updatePosition(e) {
		viewxz -= e.movementX * 0.1;
		viewy = Math.min(90, Math.max(-90, viewy - e.movementY * 0.1));
	}

	var keys = {};
	$("#canvas").keydown(function (event) {
		keys[event.key] = true;
	});
	$("#canvas").keyup(function (event) {
		keys[event.key] = false;
	});
	// --- ---

	// --- MAKE SHADERS AND PROGRAM ---
	const program = createShaderProgram(gl, vertexshadersource, fragmentshadersource);
	gl.useProgram(program);

	// --- GET ALL ATTRIBUTE AND UNIFORM LOCATIONS
	const attribLocations = getAttribLocations(gl, program, ["vertexposition", "texturecoordinate", "normal"]);
	const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture", "reverseLightDirection"]);

	// --- INIT 3D ---
	init3D(gl);

	// --- THERE SHALL BE LIGHT ---
	gl.uniform3fv(uniformLocations.reverseLightDirection, normalize([1.0, 0.0, 0.0, 1.0]));

	// GET DATA FROM OBJ
	var cubevertexbuffer;
	var cubetexcoordbuffer;
	var cubenormalbuffer;
	main();
	async function main() {
		const response = await fetch('data/cube.obj');
		const text = await response.text();
		var data = parseOBJ(text, true);
		console.log(data);
		cubevertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, data["Cube"].positions);
		cubetexcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, data["Cube"].texcoords);
		cubenormalbuffer = createBuffer(gl, gl.ARRAY_BUFFER, data["Cube"].normals);
	}

	// --- GET OBJ TEXTURE ---
	var texturecube = createTexture(gl);
	attachTextureSourceAsync(gl, texturecube, "data/cubetexturetest.png", true);

	// --- ENABLE TEXTURE0 ---
	gl.uniform1i(uniformLocations.texture, 0);

	var camerapos = [30.0, 30.0, -100.0];

	requestAnimationFrame(drawScene);
	toggle();

	var then = 0;
	function drawScene(now) {
		if (running) {
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.clearColor(0.0, 0.0, 0.0, 1.0);

			// convert requestanimationframe timestamp to seconds
			now *= 0.001;
			// subtract the previous time from the current time
			var deltaTime = now - then;
			// remember the current time for the next frame
			then = now;

			// --- SETUP PROJECTION MATRIX --- (MAKE EVERYTHING 3D)
			//var projectionmatrix = createOrthographicMatrix(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, 400, -400);
			var projectionmatrix = createPerspectiveMatrix(degreeToRadians(46.0), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 200000);
			gl.uniformMatrix4fv(uniformLocations.projectionmatrix, false, projectionmatrix);


			// --- SETUP LOOKAT MATRIX ---
			var lookatmatrix = createIdentityMatrix();
			lookatmatrix = mult(createTranslationMatrix(camerapos[0] + Math.sin(degreeToRadians(viewxz)), camerapos[1] + Math.sin(degreeToRadians(viewy)), camerapos[2] + Math.cos(degreeToRadians(viewxz))), lookatmatrix);
			var lookatposition = [lookatmatrix[12], lookatmatrix[13], lookatmatrix[14]];


			// --- FIRST PERSON CAMERA ---
			var movementspeed = 0.8;
			var factorws = (keys["w"] ? 1 : keys["s"] ? -1 : 0);
			lookatposition[0] += Math.sin(degreeToRadians(viewxz)) * movementspeed * factorws;
			lookatposition[1] += Math.sin(degreeToRadians(viewy)) * movementspeed * factorws;
			lookatposition[2] += Math.cos(degreeToRadians(viewxz)) * movementspeed * factorws;
			camerapos[0] += Math.sin(degreeToRadians(viewxz)) * movementspeed * factorws;
			camerapos[1] += Math.sin(degreeToRadians(viewy)) * movementspeed * factorws;
			camerapos[2] += Math.cos(degreeToRadians(viewxz)) * movementspeed * factorws;

			var factorad = (keys["d"] ? 1 : keys["a"] ? -1 : 0);
			var movcamvector = cross([Math.sin(degreeToRadians(viewxz)), Math.sin(degreeToRadians(viewy)), Math.cos(degreeToRadians(viewxz))], [0, 1, 0]);
			lookatposition[0] += movcamvector[0] * movementspeed * factorad;
			lookatposition[2] += movcamvector[2] * movementspeed * factorad;
			camerapos[0] += movcamvector[0] * movementspeed * factorad;
			camerapos[2] += movcamvector[2] * movementspeed * factorad;

			var factoreq = (keys["e"] ? movementspeed : keys["q"] ? -movementspeed : 0);
			lookatposition[1] += factoreq;
			camerapos[1] += factoreq;


			// --- SETUP VIEWMATRIX --- (MOVE THE WORLD INVERSE OF THE CAMERAMOVEMENT)
			var cameramatrix = lookAt(camerapos, lookatposition, [0, 1, 0]);
			var viewmatrix = inverse(cameramatrix);
			var viewmatrixlocation = gl.getUniformLocation(program, "viewmatrix");
			gl.uniformMatrix4fv(uniformLocations.viewmatrix, false, viewmatrix);


			// --- CONNECT BUFFERS TO ATTRIBUTES --- (only has to be done once since the only object vertex data we ever need is that of a cube)
			connectBufferToAttribute(gl, gl.ARRAY_BUFFER, cubevertexbuffer, attribLocations.vertexposition, 3, true);
			connectBufferToAttribute(gl, gl.ARRAY_BUFFER, cubenormalbuffer, attribLocations.normal, 3, true);
			connectBufferToAttribute(gl, gl.ARRAY_BUFFER, cubetexcoordbuffer, attribLocations.texturecoordinate, 2, true);


			// -- DRAW ---
			//console.time("drawloop");
			for (var x = 0; x < cellularworldsize; x++) {
				for (var y = 0; y < cellularworldsize; y++) {
					for (var z = 0; z < cellularworldsize; z++) {
						if (cellgrid[x][y][z] == 1) {
							gl.uniformMatrix4fv(uniformLocations.modelmatrix, false, createModelMatrix(x, y, z, 0, 0, 0, 0.5, 0.5, 0.5));
							gl.drawArrays(gl.TRIANGLES, 0, 6 * 2 * 3);
						}
					}
				}
			}
			//console.timeEnd("drawloop");

		}
		requestAnimationFrame(drawScene);
	}
}
