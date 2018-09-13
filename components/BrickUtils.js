var placeBrick;
var canPlaceBrick;
var countAllBricks;
var makeBrickDynamic;
var baseBricks = [];

placeBrickDynamic = function(width, height, depth, x, y, z, color, rotated = false) {
    // color input must be a COLOR constant
    let count = 0;
    var baseBrick = null;
    for(let i = 0; i < baseBricks.length; i++) {
        bm = baseBricks[i].getMesh();
        if(bm.name.indexOf("" + width + "x" + depth) != -1 &&
        bm.material.emissiveColor == color) {
            baseBrick = baseBricks[i];
            count++;
        }
    }
    // Should only be one, issue if more
    if (count < 1) {
        console.log(`No base brick [${width}, 1, ${depth}] with color ${color} exists, creating...`);
        var newBaseBrick = new Brick("Brick" + width + "x" + depth + "_" + color, width, height, depth, new BABYLON.Vector3(10, -999, 0), color, scene);
        baseBrick = newBaseBrick;
        baseBricks.push(newBaseBrick);
    }
    else if (count >= 2) {
        console.log("Something is wrong, should not be " + count + " instances of a base mesh...");
    }
    else {
        // console.log("Base brick already exists!");
    }
    // Is a square
    if (width === depth) {
        if (width === 1) {
            baseBrick.makeDuplicate(new BABYLON.Vector3(x, y, z));
        }
        else if (width === 2) {
            baseBrick.makeDuplicate(new BABYLON.Vector3(x, y, z), 0.5, 0.5);
        }
        else {
            console.log("ERROR: Invalid brick dimensions!");
        }
    }
    else {
        if(width == 1 && depth === 2) {
            baseBrick.setRotation(rotated ? 90 * Math.PI / 180 : 0).
                makeDuplicate(new BABYLON.Vector3(x, y, z), 0,
                rotated ? 1.5 : 0.5);
        }
        else {
            console.log("ERROR: Invalid brick dimensions!");
        }
    }
}

canPlaceBrick = function(brick) {
    // TODO: Placement checks
    return true;
}

countAllBricks = function(baseList) {
    var count = 0;
    for (let i = 0; i < baseList.length; i++) {
        if(baseList[i].duplicates) {
            count += baseList[i].duplicates.length;
        }
    }
    return count;
}