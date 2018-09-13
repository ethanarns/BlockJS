var placeBrick;
var canPlaceBrick;
var countAllBricks;
var makeBrickDynamic;
var baseBricks = [];

placeBrickDynamic = function(width, height, depth, x, y, z, color, rotated = false) {
    // color input must be a COLOR constant
    let count = 0;
    var baseBrick = null;
    var dupRef = null;
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
        //console.log(`No base brick [${width}, 1, ${depth}] with color ${color} exists, creating...`);
        var newBaseBrick = new Brick("Brick" + width + "x" + depth + "_" + color, width, height, depth, new BABYLON.Vector3(10, -999, 0), color, scene);
        newBaseBrick._mesh.position.y = -999;
        baseBrick = newBaseBrick;
        baseBricks.push(newBaseBrick);
    }
    else if (count >= 2) {
        console.log("Something is wrong, should not be " + count + " instances of a base mesh...");
        return null;
    }
    else {
        // console.log("Base brick already exists!");
    }
    // Is a square
    if (width === depth) {
        if (width === 1) {
            dupRef = baseBrick.makeDuplicate(new BABYLON.Vector3(x, y, z));
        }
        else if (width === 2) {
            dupRef = baseBrick.makeDuplicate(new BABYLON.Vector3(x, y, z), 0.5, 0.5);
        }
        else {
            console.log("ERROR: Invalid brick dimensions!");
        }
    }
    else {
        if(width == 1 && depth === 2) {
            dupRef = baseBrick.setRotation(rotated ? 90 * Math.PI / 180 : 0).
                makeDuplicate(new BABYLON.Vector3(x, y, z), 0,
                rotated ? 1.5 : 0.5);
        }
        else {
            console.log("ERROR: Invalid brick dimensions!");
        }
    }
    // After normal rotations are done, it will never rotate again, so just do this now
    dupRef.setPivotPoint(dupRef.getBoundingInfo().boundingBox.centerWorld, BABYLON.Space.WORLD);
    // Shrink slightly to fix adjacent mesh overlap
    dupRef.scaling = new BABYLON.Vector3(0.9999, 0.9999, 0.9999);
    dupRef.computeWorldMatrix(true);
    dupRef.freezeWorldMatrix();

    if (!canPlaceBrick(dupRef)) {
        dupRef.active = false;
        dupRef.enabled = false;
        dupRef.dispose();
        dupRef = null;
        return null;
    }
    
    baseBrick.duplicates.push(dupRef);

    return dupRef;
}

canPlaceBrick = function(brick) {
    // TODO: Placement checks
    // First go through base blocks
    for (let i = 0; i < baseBricks.length; i++) {
        // Then their lists
        if (!baseBricks[i].duplicates) {
            break;
        }
        var dups = baseBricks[i].duplicates;
        for (let j = 0; j < dups.length; j++) {
            if (brick !== dups[j] && brick.intersectsMesh(dups[j], false)) {
                console.log("Intersection! Cannot place brick.");
                return false;
            }
        }
    }
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
