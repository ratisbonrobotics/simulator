function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

async function parseMTL(filename) {
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

async function parseOBJ(filename) {
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
            materials = { ...materials, ...await parseMTL(filename.split('/').slice(0, -1).join('/') + '/' + line[1]) };
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
