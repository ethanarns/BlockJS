var brickList = [];

class Brick {
    // This is for making a BaseBrick
    constructor (name, x, y, z, locVec, color, scene) {
        var material = new BABYLON.StandardMaterial(name + " Material", scene);
            material.emissiveColor = new BABYLON.Color3(
                color.r / EMISSDARKERBY, color.g / EMISSDARKERBY, color.b / EMISSDARKERBY
            );
            material.diffuseColor = color;
        this._mesh = BABYLON.MeshBuilder.CreateBox(name, {width: x, height:y, depth:z}, scene);
        locVec.x += x / 2;
        locVec.y += y / 2;
        locVec.z += z / 2;
        // Make pivot lower corner
        this._mesh.setPivotMatrix(BABYLON.Matrix.Translation(x/2, y/2, z/2));
        this._mesh.position = locVec;
        this._mesh.material = material;
        // Remember to undo these before duplicating
        this._mesh.material.freeze();
        this._mesh.isPickable = false;
        this._mesh.checkCollisions = false;
        this._mesh.freezeWorldMatrix();
        this.id = ++lastId; // Increment THEN return
        this.duplicates = [];
        this._mesh.isVisible = false; // Since this will be a reference for the GPU bricks
    }

    setColor(color) {
        if (!color.r) {
            console.log("ERROR: specify a color constant, not string");
            return;
        }
        this._mesh.material.unfreeze();
        this._mesh.material.emissiveColor = new BABYLON.Color3 (
            color.r / EMISSDARKERBY, color.g / EMISSDARKERBY, color.b / EMISSDARKERBY
        );
        this._mesh.material.diffuseColor = color;
        this._mesh.material.freeze();
        return this.material;
    }

    getName() {
        return this._mesh.name;
    }
    getMesh() {
        return this._mesh;
    }
    getMaterial() {
        return this._mesh.material;
    }

    setX(xVal) {
        this._mesh.unfreezeWorldMatrix();
        xVal += this._mesh.scaling.x / 2;
        this._mesh.position.x = xVal;
        this._mesh.freezeWorldMatrix();
    }
    setY(yVal) {
        this._mesh.unfreezeWorldMatrix();
        yVal += this._mesh.scaling.y / 2;
        this._mesh.position.y = yVal;
        this._mesh.freezeWorldMatrix();
    }
    setZ(zVal) {
        this._mesh.unfreezeWorldMatrix();
        zVal += this._mesh.scaling.z / 2;
        this._mesh.position.z = zVal;
        this._mesh.freezeWorldMatrix();
    }

    getPosition() {
        return this._mesh.position;
    }

    setRotation(rVal) {
        let slide = 0;
        this._mesh.unfreezeWorldMatrix();
        this._mesh.rotation.y = rVal;
        if (slide !== 0) {
            console.log("Sliding " + slide);
            this._mesh.position.y -= slide;
        }
        this._mesh.freezeWorldMatrix();
        return this;
    }

    centerPivot() {
        var centerPointWorld = _mesh.getBoundingInfo().boundingBox.centerWorld;
        this.setPivotPoint(centerPointWorld, BABYLON.Space.WORLD);
    }
}

class BrickUtils {
    static placeBrick(width, height, depth, x, y, z, color, rotated = false) {
        var brick;
        return brick;
    }

    static canPlaceBrick(brick) {
        for (let i = 0; i < brickList.length; i++) {
            if (brick.intersectsMesh(brickList[i], false) && brick !== brickList[i]) {
                console.log("Intersection! Cannot place brick.");
                return false;
            }
        }
        return true;
    }

    static countAllBricks() {
        var count = 0;
        return count;
    }

    static handlePlayerPick() {

    }
}