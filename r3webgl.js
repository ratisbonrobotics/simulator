/*
* Copyright 2021 Markus Heimerl, OTH Regensburg
* Licensed under CC BY-NC 4.0
*
* ANY USE OF THIS SOFTWARE MUST COMPLY WITH THE
* CREATIVE COMMONS ATTRIBUTION-NONCOMMERCIAL 4.0 INTERNATIONAL LICENSE
* AGREEMENTS
*/

function getBaseLog(x, y) {
	return Math.log(y) / Math.log(x);
}

const m4 = {

	degreeToRadians: function (angle) { return angle * Math.PI / 180; },

	mult: function (mat4_a, mat4_b) {
		return [mat4_a[0] * mat4_b[0] + mat4_a[1] * mat4_b[4] + mat4_a[2] * mat4_b[8] + mat4_a[3] * mat4_b[12],
		mat4_a[0] * mat4_b[1] + mat4_a[1] * mat4_b[5] + mat4_a[2] * mat4_b[9] + mat4_a[3] * mat4_b[13],
		mat4_a[0] * mat4_b[2] + mat4_a[1] * mat4_b[6] + mat4_a[2] * mat4_b[10] + mat4_a[3] * mat4_b[14],
		mat4_a[0] * mat4_b[3] + mat4_a[1] * mat4_b[7] + mat4_a[2] * mat4_b[11] + mat4_a[3] * mat4_b[15],

		mat4_a[4] * mat4_b[0] + mat4_a[5] * mat4_b[4] + mat4_a[6] * mat4_b[8] + mat4_a[7] * mat4_b[12],
		mat4_a[4] * mat4_b[1] + mat4_a[5] * mat4_b[5] + mat4_a[6] * mat4_b[9] + mat4_a[7] * mat4_b[13],
		mat4_a[4] * mat4_b[2] + mat4_a[5] * mat4_b[6] + mat4_a[6] * mat4_b[10] + mat4_a[7] * mat4_b[14],
		mat4_a[4] * mat4_b[3] + mat4_a[5] * mat4_b[7] + mat4_a[6] * mat4_b[11] + mat4_a[7] * mat4_b[15],

		mat4_a[8] * mat4_b[0] + mat4_a[9] * mat4_b[4] + mat4_a[10] * mat4_b[8] + mat4_a[11] * mat4_b[12],
		mat4_a[8] * mat4_b[1] + mat4_a[9] * mat4_b[5] + mat4_a[10] * mat4_b[9] + mat4_a[11] * mat4_b[13],
		mat4_a[8] * mat4_b[2] + mat4_a[9] * mat4_b[6] + mat4_a[10] * mat4_b[10] + mat4_a[11] * mat4_b[14],
		mat4_a[8] * mat4_b[3] + mat4_a[9] * mat4_b[7] + mat4_a[10] * mat4_b[11] + mat4_a[11] * mat4_b[15],

		mat4_a[12] * mat4_b[0] + mat4_a[13] * mat4_b[4] + mat4_a[14] * mat4_b[8] + mat4_a[15] * mat4_b[12],
		mat4_a[12] * mat4_b[1] + mat4_a[13] * mat4_b[5] + mat4_a[14] * mat4_b[9] + mat4_a[15] * mat4_b[13],
		mat4_a[12] * mat4_b[2] + mat4_a[13] * mat4_b[6] + mat4_a[14] * mat4_b[10] + mat4_a[15] * mat4_b[14],
		mat4_a[12] * mat4_b[3] + mat4_a[13] * mat4_b[7] + mat4_a[14] * mat4_b[11] + mat4_a[15] * mat4_b[15]];
	},


	createIdentityMatrix: function () {
		return [1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0];
	},

	createTranslationMatrix: function (transx, transy, transz) {
		return [1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			transx, transy, transz, 1.0];
	},

	createXRotationMatrix: function (angleInRadians) {
		var s = Math.sin(angleInRadians);
		var c = Math.cos(angleInRadians);
		return [1.0, 0.0, 0.0, 0.0,
			0.0, c, s, 0.0,
			0.0, -s, c, 0.0,
			0.0, 0.0, 0.0, 1.0];
	},

	createYRotationMatrix: function (angleInRadians) {
		var s = Math.sin(angleInRadians);
		var c = Math.cos(angleInRadians);
		return [c, 0.0, -s, 0.0,
			0.0, 1.0, 0.0, 0.0,
			s, 0.0, c, 0.0,
			0.0, 0.0, 0.0, 1.0];
	},

	createZRotationMatrix: function (angleInRadians) {
		var s = Math.sin(angleInRadians);
		var c = Math.cos(angleInRadians);
		return [c, s, 0.0, 0.0,
			-s, c, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0];
	},

	createScaleMatrix: function (scalex, scaley, scalez) {
		return [scalex, 0.0, 0.0, 0.0,
			0.0, scaley, 0.0, 0.0,
			0.0, 0.0, scalez, 0.0,
			0.0, 0.0, 0.0, 1.0];
	},

	createOrthographicMatrix: function (left, right, bottom, top, near, far) {
		return [2 / (right - left), 0, 0, 0,
			0, 2 / (top - bottom), 0, 0,
			0, 0, 2 / (near - far), 0,
		(left + right) / (left - right), (bottom + top) / (bottom + top), (near + far) / (near - far), 1];
	},

	createSimpleProjectionMatrix: function (width, height, depth) {
		return [(2 / width), 0.0, 0.0, 0.0,
			0.0, (-2 / height), 0.0, 0.0,
			0.0, 0.0, (2 / depth), 0.0,
		-1.0, 1.0, 0.0, 1.0];
	},

	createPerspectiveMatrix: function (fovInRadians, aspect, near, far) {
		var f = Math.tan(Math.PI * 0.5 - 0.5 * fovInRadians);
		var rangeInv = 1.0 / (near - far);

		return [f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (near + far) * rangeInv, -1,
			0, 0, near * far * rangeInv * 2, 0
		];
	},

	// leibnitz forumlar: InvA = 1/det(A) * Aadj
	inverse: function (m) {
		var m00 = m[0 * 4 + 0];
		var m01 = m[0 * 4 + 1];
		var m02 = m[0 * 4 + 2];
		var m03 = m[0 * 4 + 3];
		var m10 = m[1 * 4 + 0];
		var m11 = m[1 * 4 + 1];
		var m12 = m[1 * 4 + 2];
		var m13 = m[1 * 4 + 3];
		var m20 = m[2 * 4 + 0];
		var m21 = m[2 * 4 + 1];
		var m22 = m[2 * 4 + 2];
		var m23 = m[2 * 4 + 3];
		var m30 = m[3 * 4 + 0];
		var m31 = m[3 * 4 + 1];
		var m32 = m[3 * 4 + 2];
		var m33 = m[3 * 4 + 3];
		var tmp_0 = m22 * m33;
		var tmp_1 = m32 * m23;
		var tmp_2 = m12 * m33;
		var tmp_3 = m32 * m13;
		var tmp_4 = m12 * m23;
		var tmp_5 = m22 * m13;
		var tmp_6 = m02 * m33;
		var tmp_7 = m32 * m03;
		var tmp_8 = m02 * m23;
		var tmp_9 = m22 * m03;
		var tmp_10 = m02 * m13;
		var tmp_11 = m12 * m03;
		var tmp_12 = m20 * m31;
		var tmp_13 = m30 * m21;
		var tmp_14 = m10 * m31;
		var tmp_15 = m30 * m11;
		var tmp_16 = m10 * m21;
		var tmp_17 = m20 * m11;
		var tmp_18 = m00 * m31;
		var tmp_19 = m30 * m01;
		var tmp_20 = m00 * m21;
		var tmp_21 = m20 * m01;
		var tmp_22 = m00 * m11;
		var tmp_23 = m10 * m01;

		var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
			(tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
		var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
			(tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
		var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
			(tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
		var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
			(tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

		var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

		return [
			d * t0,
			d * t1,
			d * t2,
			d * t3,
			d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
				(tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
			d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
				(tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
			d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
				(tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
			d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
				(tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
			d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
				(tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
			d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
				(tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
			d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
				(tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
			d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
				(tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
			d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
				(tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
			d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
				(tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
			d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
				(tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
			d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
				(tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
		];
	},

	transpose: function (m) {

		return [m[0], m[4], m[8], m[12],
		m[1], m[5], m[9], m[13],
		m[2], m[6], m[10], m[14],
		m[3], m[7], m[11], m[15]
		];
	},

	cross: function (a, b) {
		return [a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]];
	},

	subtractVectors: function (a, b) {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	},

	normalize: function (v) {
		var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		if (length > 0.000001) {
			return [v[0] / length, v[1] / length, v[2] / length];
		} else {
			return [0, 0, 0];
		}
	},

	lookAt: function (cameraPosition, target, up) {
		var zAxis = m4.normalize(m4.subtractVectors(cameraPosition, target));
		var xAxis = m4.normalize(m4.cross(up, zAxis));
		var yAxis = m4.normalize(m4.cross(zAxis, xAxis));

		return [
			xAxis[0], xAxis[1], xAxis[2], 0,
			yAxis[0], yAxis[1], yAxis[2], 0,
			zAxis[0], zAxis[1], zAxis[2], 0,
			cameraPosition[0],
			cameraPosition[1],
			cameraPosition[2],
			1,
		];
	}

};


const parentr3webgl = {

	createProgram: function (vertexshader, fragmentshader) {
		var gl = this.gl;
		var program = gl.createProgram();
		gl.attachShader(program, vertexshader);
		gl.attachShader(program, fragmentshader);
		gl.linkProgram(program);
		if (gl.getProgramParameter(program, gl.LINK_STATUS)) { return program; }
		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	},

	compileShader: function (type, source) {
		var gl = this.gl;
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { return shader; }
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	},

	createShaderProgram: function (vertexshadersource, fragmentshadersource) {
		var gl = this.gl;
		return this.createProgram(this.compileShader(gl.VERTEX_SHADER, vertexshadersource), this.compileShader(gl.FRAGMENT_SHADER, fragmentshadersource));
	},

	getAttribLocations: function (program, names) {
		var attriblocations = {};
		for (var i = 0; i < names.length; i++) { attriblocations[names[i]] = this.gl.getAttribLocation(program, names[i]); }
		return attriblocations;
	},

	getUniformLocations: function (program, names) {
		var uniformlocations = {};
		for (var i = 0; i < names.length; i++) { uniformlocations[names[i]] = this.gl.getUniformLocation(program, names[i]); }
		return uniformlocations;
	},

	init3D: function () {
		var gl = this.gl;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
	},

	createModelMatrix: function (tx, ty, tz, rx, ry, rz, sx, sy, sz) {
		var modelmatrix = m4.createIdentityMatrix();
		modelmatrix = m4.mult(m4.createTranslationMatrix(tx, ty, tz), modelmatrix);
		modelmatrix = m4.mult(m4.createXRotationMatrix(m4.degreeToRadians(rx)), modelmatrix);
		modelmatrix = m4.mult(m4.createYRotationMatrix(m4.degreeToRadians(ry)), modelmatrix);
		modelmatrix = m4.mult(m4.createZRotationMatrix(m4.degreeToRadians(rz)), modelmatrix);
		modelmatrix = m4.mult(m4.createScaleMatrix(sx, sy, sz), modelmatrix);
		return modelmatrix;
	},

	createBuffer: function (type, data) {
		var gl = this.gl;
		var buffer = gl.createBuffer();
		gl.bindBuffer(type, buffer);
		gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);
		return buffer;
	},

	connectBufferToAttribute: function (type, buffer, attriblocation, valuespervertex, enable) {
		var gl = this.gl;
		if (enable) gl.enableVertexAttribArray(attriblocation);
		gl.bindBuffer(type, buffer);
		gl.vertexAttribPointer(attriblocation, valuespervertex, gl.FLOAT, false, 0, 0);
	},

	createTexture: function (dim) {
		dim = dim ? dim : { x: 1, y: 1 };
		var gl = this.gl;
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dim.x, dim.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		return texture;
	},

	createRandomNoiseTexture: function (dim) {
		var gl = this.gl;
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		var data = [];
		for (var i = 0; i < gl.canvas.width * gl.canvas.height; i++) { var col = Math.round(Math.random() * Math.random()) * 255; data.push(col, col, col); }
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, dim.x, dim.y, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array(data));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		return tex;
	},

	attachTextureSourceAsync: function (texture, source, flipVertically) {
		var gl = this.gl;
		var image = new Image();
		image.src = source;

		image.addEventListener("load", function () {
			if (flipVertically) {
				var canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				canvas.getContext("2d").scale(1, -1);
				canvas.getContext("2d").drawImage(image, 0, image.height * -1);
				var flipImage = new Image();
				flipImage.src = canvas.toDataURL("image/png");
				flipImage.addEventListener("load", function () {
					addTexture(flipImage);
				});
			} else {
				addTexture(image);
			}
		});

		function addTexture(img) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.generateMipmap(gl.TEXTURE_2D);
		}
	}
};
