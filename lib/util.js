function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

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

async function parseMTLNew(filename) {
    const data = ((await (await fetch(filename)).text()).split('\n')).map(line => line.split(/\s+/).filter(Boolean));
    let materials = {};
    let material_name = "";

    for (const line of data) {
        if (line[0] == "newmtl") {
            material_name = line[1];
            materials[material_name] = {};
        } else if (line[0] == "map_Kd") {
            materials[material_name]["map_Kd"] = new Image();
            materials[material_name]["map_Kd"].src = filename.split('/').slice(0, -1).join('/') + '/' + line[1];
        } else if (line[0] == "Ns" || line[0] == "Ni" || line[0] == "d" || line[0] == "illum" || line[0] == "Ka" || line[0] == "Ks" || line[0] == "Ke") {
            materials[material_name][line[0]] = line.slice(1).map(parseFloat);
        }
    }

    return materials;
}

async function parseOBJNew(filename) {
    const data = ((await (await fetch(filename)).text()).split('\n')).map(line => line.split(/\s+/).filter(Boolean));
    let materials = {};
    let objects = {};

    let all = {
        "v": [],
        "vt": [],
        "vn": []
    };
    let temp_o = "";
    let temp_g = "";
    let temp_m = "";
    let temp_s = 0;

    for (const line of data) {
        if (line[0] == "mtllib") {
            materials = { ...materials, ...await parseMTLNew(filename.split('/').slice(0, -1).join('/') + '/' + line[1]) };
        } else if (line[0] == "o") {
            temp_o = line[1];
            temp_g = "";
            temp_s = 0;
            temp_m = "";
            objects[temp_o] = {
                "v": [],
                "vt": [],
                "vn": [],
                "m": [],
                "g": [],
                "s": []
            };
        } else if (line[0] == "v" || line[0] == "vt" || line[0] == "vn") {
            all[line[0]].push(line.slice(1).map(parseFloat));
        } else if (line[0] == "g") {
            temp_g = line[1];
        } else if (line[0] == "usemtl") {
            temp_m = line[1];
        }
        else if (line[0] == "s") {
            temp_s = line[1];
            if (temp_s == "off") {
                temp_s = 0;
            }
        } else if (line[0] == "f") {
            let faces = line.slice(1).map(str => str.split('/').map(str => parseInt(str) - 1));

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

    return objects;
}
