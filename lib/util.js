function loadExternalHTML(url, targetId) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () {
    let parser = new DOMParser();
    let doc = parser.parseFromString(xhr.responseText, "text/html");
    let target = document.getElementById(targetId);

    Array.from(doc.body.childNodes).forEach(function (node) {
      if (node.nodeName.toLowerCase() !== "script") {
        target.appendChild(node.cloneNode(true));
      }
    });

    let scripts = doc.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      let script = document.createElement("script");
      script.text = scripts[i].innerText;
      document.body.appendChild(script);
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function createColorImageURL(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `rgb(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255})`;
  ctx.fillRect(0, 0, 1, 1);
  return canvas.toDataURL();
}

function nearestPowerOfTwo(value) {
  return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
}

function degToRad(angle) {
  return (angle * Math.PI) / 180;
}

function generateGaussianNoise(mean, stdDev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function resizeCanvas(canvas) {
  canvas.width = Math.pow(2, Math.floor(Math.log(window.innerWidth * 0.88) / Math.log(2)));
  canvas.height = canvas.width / 2;
}

async function parseMTL(filename) {
  const data = (await (await fetch(filename)).text())
    .split("\n")
    .map((line) => line.split(/\s+/).filter(Boolean));
  let materials = {};
  let material_name = "";

  for (const line of data) {
    if (line[0] == "newmtl") {
      material_name = line[1];
      materials[material_name] = {};
    } else if (line[0] == "map_Kd") {
      materials[material_name]["map_Kd"] = new Image();
      materials[material_name]["map_Kd"].src =
        filename.split("/").slice(0, -1).join("/") + "/" + line[line.length - 1];

      // Parse texture mapping options
      if (line.includes("-o")) {
        const offsetIndex = line.indexOf("-o");
        materials[material_name]["map_Kd_offset"] = line.slice(offsetIndex + 1, offsetIndex + 4).map(parseFloat);
      }
      if (line.includes("-s")) {
        const scaleIndex = line.indexOf("-s");
        materials[material_name]["map_Kd_scale"] = line.slice(scaleIndex + 1, scaleIndex + 4).map(parseFloat);
      }
    } else if (
      line[0] == "Ns" ||
      line[0] == "Ni" ||
      line[0] == "d" ||
      line[0] == "illum" ||
      line[0] == "Ka" ||
      line[0] == "Ks" ||
      line[0] == "Ke"
    ) {
      materials[material_name][line[0]] = line.slice(1).map(parseFloat);
    }
  }

  return materials;
}

async function parseOBJ(filename) {
  let filename_final;

  if (filename.split(".")[filename.split(".").length - 1] === "gz") {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error('Failed to fetch ' + url);
    }
    const decompressionStream = new DecompressionStream('gzip');
    const decompressedStream = response.body.pipeThrough(decompressionStream);
    const decompressedBlob = await new Response(decompressedStream).blob();
    filename_final = URL.createObjectURL(decompressedBlob);
  } else {
    filename_final = filename;
  }

  const data = (await (await fetch(filename_final)).text())
    .split("\n")
    .map((line) => line.split(/\s+/).filter(Boolean));
  let materials = {};
  let objects = {};

  let all = {
    v: [],
    vt: [],
    vn: [],
  };
  let temp_o = "";
  let temp_g = "";
  let temp_m = "";
  let temp_s = 0;

  for (const line of data) {
    if (line[0] == "mtllib") {
      materials = {
        ...materials,
        ...(await parseMTL(
          filename.split("/").slice(0, -1).join("/") + "/" + line[1]
        )),
      };
    } else if (line[0] == "o") {
      temp_o = line[1];
      temp_g = "";
      temp_s = 0;
      temp_m = "";
      objects[temp_o] = {
        v: [],
        vt: [],
        vn: [],
        m: [],
        g: [],
        s: [],
      };
    } else if (line[0] == "v" || line[0] == "vt" || line[0] == "vn") {
      all[line[0]].push(line.slice(1).map(parseFloat));
    } else if (line[0] == "g") {
      temp_g = line[1];
    } else if (line[0] == "usemtl") {
      temp_m = line[1];
    } else if (line[0] == "s") {
      temp_s = line[1];
      if (temp_s == "off") {
        temp_s = 0;
      }
    } else if (line[0] == "f") {
      let faces = line
        .slice(1)
        .map((str) => str.split("/").map((str) => parseInt(str) - 1));

      for (f of faces) {
        objects[temp_o]["v"].push(...all["v"][f[0]]);
        if (all["vt"][f[1]] !== undefined)
          objects[temp_o]["vt"].push(...all["vt"][f[1]]);
        objects[temp_o]["vn"].push(...all["vn"][f[2]]);
        objects[temp_o]["m"].push(materials[temp_m]);
        objects[temp_o]["g"].push(temp_g);
        objects[temp_o]["s"].push(temp_s);
      }
    }
  }

  if (filename.split(".")[-1] === ".gz") {
    URL.revokeObjectURL(filename_final);
  }

  return objects;
}
