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

  // Read header
  const magic = dataView.getUint32(0, true);
  const version = dataView.getUint32(4, true);
  const length = dataView.getUint32(8, true);

  if (magic !== 0x46546c67) {
    throw new Error("Invalid glTF asset.");
  }

  // Read JSON chunk
  const chunkLength = dataView.getUint32(12, true);
  const chunkType = dataView.getUint32(16, true);

  if (chunkType !== 0x4e4f534a) {
    throw new Error("Invalid glTF asset.");
  }

  const jsonChunk = new Uint8Array(arrayBuffer, 20, chunkLength);
  const jsonString = new TextDecoder().decode(jsonChunk);
  const gltf = JSON.parse(jsonString);

  // Read binary chunk
  const binaryChunkStart = 20 + chunkLength;
  const binaryChunkLength = dataView.getUint32(binaryChunkStart, true);
  const binaryChunkType = dataView.getUint32(binaryChunkStart + 4, true);

  if (binaryChunkType !== 0x004e4942) {
    throw new Error("Invalid glTF asset.");
  }

  const binaryChunk = new Uint8Array(
    arrayBuffer,
    binaryChunkStart + 8,
    binaryChunkLength
  );

  var parsed_gltf = parseGLTF(gltf, binaryChunk);
  console.log(parsed_gltf.nodes[1].mesh.primitives[0]);
  //return { gltf, binaryChunk };
  return parsed_gltf.nodes[1].mesh.primitives[0].attributeData.POSITION.data;
}

function parseGLTF(gltf, binaryChunk) {
  const bufferViews = gltf.bufferViews || [];
  const accessors = gltf.accessors || [];
  const textures = gltf.textures || [];
  const materials = gltf.materials || [];
  const meshes = gltf.meshes || [];
  const nodes = gltf.nodes || [];
  const scenes = gltf.scenes || [];

  // Parse accessors
  const accessorData = accessors.map(accessor => {
    const { bufferView, byteOffset, componentType, count, type } = accessor;
    const bufferViewObject = bufferViews[bufferView];
    const bufferViewArray = new Uint8Array(
      binaryChunk.buffer,
      binaryChunk.byteOffset + (bufferViewObject.byteOffset || 0),
      bufferViewObject.byteLength
    );
    const byteStride = accessor.byteStride || 0;
    let componentSize;
    let TypedArray;
    switch (componentType) {
      case 5120: componentSize = 1; TypedArray = Int8Array; break;
      case 5121: componentSize = 1; TypedArray = Uint8Array; break;
      case 5122: componentSize = 2; TypedArray = Int16Array; break;
      case 5123: componentSize = 2; TypedArray = Uint16Array; break;
      case 5125: componentSize = 4; TypedArray = Uint32Array; break;
      case 5126: componentSize = 4; TypedArray = Float32Array; break;
      default: throw new Error('Invalid component type.');
    }
    const numComponents = type === 'SCALAR' ? 1 : parseInt(type.slice(-1));
    const size = count * numComponents;
    const data = new TypedArray(
      bufferViewArray.buffer,
      bufferViewArray.byteOffset + (byteOffset || 0), size
    );
    return {
      data,
      type,
      componentType,
      count,
      numComponents, byteStride
    };
  });

  // Parse textures
  const textureData = textures.map((texture) => {
    const { source, sampler } = texture;
    const imageData = gltf.images[source];
    const samplerData = gltf.samplers[sampler];

    return {
      imageData,
      samplerData,
    };
  });

  // Parse materials
  const materialData = materials.map((material) => {
    const {
      pbrMetallicRoughness,
      normalTexture,
      occlusionTexture,
      emissiveTexture,
      emissiveFactor,
      alphaMode,
      alphaCutoff,
      doubleSided,
    } = material;

    return {
      pbrMetallicRoughness,
      normalTexture,
      occlusionTexture,
      emissiveTexture,
      emissiveFactor,
      alphaMode,
      alphaCutoff,
      doubleSided,
    };
  });

  // Parse meshes
  const meshData = meshes.map((mesh) => {
    const { primitives } = mesh;

    const primitiveData = primitives.map((primitive) => {
      const { attributes, indices, material, mode } = primitive;

      const attributeData = {};
      for (const [attributeName, accessorIndex] of Object.entries(attributes)) {
        attributeData[attributeName] = accessorData[accessorIndex];
      }

      const indicesData = indices !== undefined ? accessorData[indices] : null;
      const materialIndex = material !== undefined ? material : null;

      return {
        attributeData,
        indicesData,
        materialIndex,
        mode,
      };
    });

    return {
      primitives: primitiveData,
    };
  });

  // Parse nodes
  const nodeData = nodes.map((node) => {
    const { mesh, matrix, translation, rotation, scale, children } = node;

    return {
      mesh: meshData[mesh],
      matrix,
      translation,
      rotation,
      scale,
      children,
    };
  });

  // Parse scenes
  const sceneData = scenes.map((scene) => {
    const { nodes } = scene;
    return nodes.map((nodeIndex) => nodeData[nodeIndex]);
  });

  return {
    scenes: sceneData,
    nodes: nodeData,
    meshes: meshData,
    materials: materialData,
    textures: textureData,
    accessors: accessorData,
  };
}
