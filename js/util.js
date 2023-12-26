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
