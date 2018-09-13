var placeBrick;
var canPlaceBrick;
var countAllBricks;
var baseBricks = [];

function initBricks() {
    // Store these in memory for quickly duplicating to GPU. Don't render by default.
    // Making a new one for each duplicate would make it moot, plus colors can't be changed on GPU copies
    var brick1x1red = new Brick("Brick1x1_red", 1, 1, 1, new BABYLON.Vector3(0,-999,0), COLORRED, scene);
    var brick1x1green = new Brick("Brick1x1_green", 1, 1, 1, new BABYLON.Vector3(0,-998,0), COLORGREEN, scene);
    var brick1x1blue = new Brick("Brick1x1_blue", 1, 1, 1, new BABYLON.Vector3(0,-997,0), COLORBLUE, scene);
    var brick1x1default = new Brick("Brick1x1_default", 1, 1, 1, new BABYLON.Vector3(0,-996,0), COLORDEFAULT, scene);
    baseBricks.push(brick1x1red);
    baseBricks.push(brick1x1green);
    baseBricks.push(brick1x1blue);
    baseBricks.push(brick1x1default);

    var brick1x2red = new Brick("Brick1x2_red", 1, 1, 2, new BABYLON.Vector3(10, -999, 0), COLORRED, scene);
    var brick1x2green = new Brick("Brick1x2_green", 1, 1, 2, new BABYLON.Vector3(10, -998, 0), COLORGREEN, scene);
    var brick1x2blue = new Brick("Brick1x2_blue", 1, 1, 2, new BABYLON.Vector3(10, -997, 0), COLORBLUE, scene);
    var brick1x2default = new Brick("Brick1x2_default", 1, 1, 2, new BABYLON.Vector3(10, -996, 0), COLORDEFAULT, scene);
    baseBricks.push(brick1x2red);
    baseBricks.push(brick1x2green);
    baseBricks.push(brick1x2blue);
    baseBricks.push(brick1x2default);

    var brick2x2red = new Brick("Brick2x2_red", 2, 1, 2, new BABYLON.Vector3(10, -999, 0), COLORRED, scene);
    var brick2x2green = new Brick("Brick2x2_green", 2, 1, 2, new BABYLON.Vector3(10, -998, 0), COLORGREEN, scene);
    var brick2x2blue = new Brick("Brick2x2_blue", 2, 1, 2, new BABYLON.Vector3(10, -997, 0), COLORBLUE, scene);
    var brick2x2default = new Brick("Brick2x2_default", 2, 1, 2, new BABYLON.Vector3(10, -996, 0), COLORDEFAULT, scene);
    baseBricks.push(brick2x2red);
    baseBricks.push(brick2x2green);
    baseBricks.push(brick2x2blue);
    baseBricks.push(brick2x2default);

    canPlaceBrick = function(brick) {
        // TODO: Placement checks
        return true;
    }
    placeBrick = function(width, height, depth, x, y, z, color, rotated = false) {
        if(!canPlaceBrick()) {
            return;
        }
        var newBrick; // A Mesh
        color = color.trim().toLowerCase();
        if (width == 1 && height == 1 && depth == 1) {
            if(color === "red") {
                newBrick = brick1x1red.makeDuplicate(new BABYLON.Vector3(x, y, z));
            }
            else if (color === "green") {
                newBrick = brick1x1green.makeDuplicate(new BABYLON.Vector3(x, y, z));
            }
            else if (color === "blue") {
                newBrick = brick1x1blue.makeDuplicate(new BABYLON.Vector3(x, y, z));
            }
            else {
                newBrick = brick1x1default.makeDuplicate(new BABYLON.Vector3(x, y, z));
            }
        }
        else if (width == 1 && height == 1 && depth == 2) {
            if(color === "red") {
                newBrick = brick1x2red.setRotation(rotated ? 90 * Math.PI / 180 : 0).
                    makeDuplicate(new BABYLON.Vector3(x, y, z), 0,
                    rotated ? 1.5 : 0.5);
            }
            else if (color === "green") {
                newBrick = brick1x2green.setRotation(rotated ? 90 * Math.PI / 180 : 0).
                    makeDuplicate(new BABYLON.Vector3(x, y, z), 0,
                    rotated ? 1.5 : 0.5);
            }
            else if (color === "blue") {
                newBrick = brick1x2blue.setRotation(rotated ? 90 * Math.PI / 180 : 0).
                    makeDuplicate(new BABYLON.Vector3(x, y, z), 0,
                    rotated ? 1.5 : 0.5);
            }
            else {
                newBrick = brick1x2default.setRotation(rotated ? 90 * Math.PI / 180 : 0).
                    makeDuplicate(new BABYLON.Vector3(x, y, z),
                    rotated ? 1.5 : 0.5);
            }
        }
        else if (width == 2 && height == 1 && depth == 2) {
            if(color === "red") {
                newBrick = brick2x2red.makeDuplicate(new BABYLON.Vector3(x, y, z), 0.5, 0.5);
            }
            else if (color === "green") {
                newBrick = brick2x2green.makeDuplicate(new BABYLON.Vector3(x, y, z), 0.5, 0.5);
            }
            else if (color === "blue") {
                newBrick = brick2x2blue.makeDuplicate(new BABYLON.Vector3(x, y, z), 0.5, 0.5);
            }
            else {
                newBrick = brick2x2default.makeDuplicate(new BABYLON.Vector3(x, y, z), 0.5, 0.5);
            }
        }
        else {
            console.log("Invalid brick specified!");
            return;
        }
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
}