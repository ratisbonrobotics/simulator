function degToRad(angle) {
  return (angle * Math.PI) / 180;
}

function generateGaussianNoise(mean, stdDev) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return (
    mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  );
}

function resizeCanvas() {
  var canvas = document.getElementById("canvas");
  canvas.width = Math.pow(
    2,
    Math.floor(Math.log(window.innerWidth * 0.88) / Math.log(2))
  );
  canvas.height = canvas.width / 2;
  init3D(canvas.getContext("webgl"));
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
        filename.split("/").slice(0, -1).join("/") + "/" + line[1];
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
  const data = (await (await fetch(filename)).text())
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
        objects[temp_o]["vt"].push(...all["vt"][f[1]]);
        objects[temp_o]["vn"].push(...all["vn"][f[2]]);
        objects[temp_o]["m"].push(materials[temp_m]);
        objects[temp_o]["g"].push(temp_g);
        objects[temp_o]["s"].push(temp_s);
      }
    }
  }

  return [objects, materials];
}

async function parseGLB(filename) {
  const response = await fetch(filename);
  const arrayBuffer = await response.arrayBuffer();
  const dataView = new DataView(arrayBuffer);
  if (dataView.getUint32(0, true) !== 0x46546c67 || dataView.getUint32(16, true) !== 0x4e4f534a)
    throw new Error("Invalid glTF asset.");

  // Read binary chunk
  const chunkLength = dataView.getUint32(12, true);
  const jsonChunk = new Uint8Array(arrayBuffer, 20, chunkLength);
  const jsonString = new TextDecoder().decode(jsonChunk);
  const gltf = JSON.parse(jsonString);

  const binaryChunkStart = 20 + chunkLength;
  if (dataView.getUint32(binaryChunkStart + 4, true) !== 0x004e4942)
    throw new Error("Invalid glTF asset.");

  const binaryChunkLength = dataView.getUint32(binaryChunkStart, true);
  const binaryChunk = new Uint8Array(arrayBuffer, binaryChunkStart + 8, binaryChunkLength);

  // Extract the image data from the binary chunk
  for (let i = 0; i < 6; i++) {
    const imageBufferViewIndex = gltf.images[i].bufferView;
    const imageBufferView = gltf.bufferViews[imageBufferViewIndex];
    const imageByteOffset = imageBufferView.byteOffset;
    const imageByteLength = imageBufferView.byteLength;
    const imageData = new Uint8Array(binaryChunk.buffer, binaryChunk.byteOffset + imageByteOffset, imageByteLength);
    const blob = new Blob([imageData], { type: gltf.images[i].mimeType });
    const blobUrl = URL.createObjectURL(blob);
    console.log(blobUrl);
  }
  console.log(gltf);


  for (let i = 0; i < gltf.scenes.length; i++) {
    console.log("Scene name: ", gltf.scenes[i].name);
    for (let j = 0; j < gltf.scenes[i].nodes.length; j++) {
      let node = gltf.nodes[gltf.scenes[i].nodes[j]];
      console.log("Scene Node name: ", node.name);
      visitAllChildren(node, gltf, binaryChunk, 0);
    }
  }

}

function visitAllChildren(node, gltf, binaryChunk, depth) {
  for (let k = 0; k < node.children.length; k++) {
    let child = gltf.nodes[node.children[k]];
    console.log("Depth: ", depth, "Node Child: ", child);
    if (child.children !== undefined) visitAllChildren(child, gltf, binaryChunk, depth + 1);
    if (child.mesh !== undefined) {
      let mesh = gltf.meshes[child.mesh];
      console.log("Node Child Mesh: ", mesh);
      for (let p = 0; p < mesh.primitives.length; p++) {
        let primitive = mesh.primitives[p];
        // Get the position data
        let positionAccessor = gltf.accessors[primitive.attributes.POSITION];
        let positionBufferView = gltf.bufferViews[positionAccessor.bufferView];
        let posData = new Float32Array(
          binaryChunk.buffer,
          binaryChunk.byteOffset + positionBufferView.byteOffset,
          positionAccessor.count * 3
        );
        // Get the indices data
        let indicesAccessor = gltf.accessors[primitive.indices];
        let indicesBufferView = gltf.bufferViews[indicesAccessor.bufferView];
        let indicesComponentType = indicesAccessor.componentType;
        let indicesDataType;
        if (indicesComponentType === 5121) {
          indicesDataType = Uint8Array;
        } else if (indicesComponentType === 5123) {
          indicesDataType = Uint16Array;
        } else if (indicesComponentType === 5125) {
          indicesDataType = Uint32Array;
        }
        let indicesData = new indicesDataType(
          binaryChunk.buffer,
          binaryChunk.byteOffset + indicesBufferView.byteOffset,
          indicesAccessor.count
        );
        // Create a single Float32Array for the final vertex data
        let vertexData = new Float32Array(indicesData.length * 3);
        for (let i = 0; i < indicesData.length; i++) {
          let index = indicesData[i];
          vertexData[i * 3] = posData[index * 3];
          vertexData[i * 3 + 1] = posData[index * 3 + 1];
          vertexData[i * 3 + 2] = posData[index * 3 + 2];
        }
        console.log("Vertex Data:", vertexData);
      }
    }
  }
}