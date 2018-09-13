class Block {
    constructor (name, x, y, z, locVec, color, scene) {
        var material = new BABYLON.StandardMaterial(name + " Material", scene);
            material.emissiveColor = color;
        this._mesh = BABYLON.MeshBuilder.CreateBox(name, {width: x, height:y, depth:z}, scene);
        locVec.x += x / 2;
        locVec.y += y / 2;
        locVec.z += z / 2;
        this._mesh.setPivotMatrix(BABYLON.Matrix.Translation(x/2, y/2, z/2));
        this._mesh.position = locVec;
        this._mesh.material = material;
        this._mesh.material.freeze();
        this._mesh.isPickable = true;
        this._mesh.checkCollisions = true;
        //this._mesh.freezeWorldMatrix();
        this.id = ++lastId;
        this.duplicates = [];
    }
    getName() {
        return this._mesh.name;
    }
    setX(xVal) {
        xVal += this._mesh.scaling.x / 2;
        this._mesh.position.x = xVal;
    }
    setY(yVal) {
        yVal += this._mesh.scaling.y / 2;
        this._mesh.position.y = yVal;
    }
    setZ(zVal) {
        zVal += this._mesh.scaling.z / 2;
        this._mesh.position.z = zVal;
    }
    getPosition() {
        return this._mesh.position;
    }
    setRotation(rVal) {
        this._mesh.rotation.y = rVal;
    }

    makeDuplicate(pos) {
        var brickInstance = this._mesh.createInstance("Brick");
        pos.x += this._mesh.scaling.x / 2;
        pos.y += this._mesh.scaling.y / 2;
        pos.z += this._mesh.scaling.z / 2;
        brickInstance.position = pos;
        brickInstance.isPickable = true;
        brickInstance.checkCollisions = true;
        brickInstance.material.freeze();
        brickInstance.freezeWorldMatrix();
        this.duplicates.push(brickInstance);
    }
}