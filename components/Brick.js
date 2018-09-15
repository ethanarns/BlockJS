/**
 * Class representing a Block with an attached mesh, as well as static helper methods
 * @author Ethan Arns <contact@ethanarns.com>
 */
class Brick {
    /**
     * Create a Brick
     * @param {string} name Name of brick (applied to Mesh)
     * @param {number} x Width
     * @param {number} y Height
     * @param {number} z Depth
     * @param {BABYLON.Vector3} locVec Vector3 representing placement location
     * @param {BABYLON.Color3} color Color3 representing Material color, usually a constant
     * @param {BABYLON.Scene} scene Scene Brick will be placed into
     * @constructs
     * @public
     */
    constructor (name, x, y, z, locVec, color, scene) {
        var material = new BABYLON.StandardMaterial(name + " Material", scene);
            material.emissiveColor = new BABYLON.Color3(
                color.r / COLORS.EMISSDARKERBY, color.g / COLORS.EMISSDARKERBY, color.b / COLORS.EMISSDARKERBY
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

    /**
     * Sets the material color of the Brick mesh
     * @param {BABYLON.Color3} color Color to set the Brick's Mesh to
     * @public
     */
    setColor(color) {
        if (!color.r) {
            if (isDebugMode)
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

    /**
     * Gets the name of the Brick (mesh)
     * @returns {number} The name of the Brick's mesh
     * @public
     */
    getName() {
        return this._mesh.name;
    }

    /**
     * Gets the mesh attached to the Brick class
     * @returns {BABYLON.Mesh} The Brick's Mesh
     * @public
     */
    getMesh() {
        return this._mesh;
    }

    /**
     * Gets the Material attached to this Brick, usually StandardMaterial
     * @returns {BABYLON.Material} Material of Brick Mesh
     * @public
     */
    getMaterial() {
        return this._mesh.material;
    }

    /**
     * Sets the X position, in world space, of the Brick mesh
     * @param {number} xVal The X value
     * @public
     */
    setX(xVal) {
        this._mesh.unfreezeWorldMatrix();
        xVal += this._mesh.scaling.x / 2;
        this._mesh.position.x = xVal;
        this._mesh.freezeWorldMatrix();
    }

    /**
     * Sets the Y position, in world space, of the Brick mesh
     * @param {number} yVal The Y value
     * @public
     */
    setY(yVal) {
        this._mesh.unfreezeWorldMatrix();
        yVal += this._mesh.scaling.y / 2;
        this._mesh.position.y = yVal;
        this._mesh.freezeWorldMatrix();
    }

    /**
     * Sets the Z position, in world space, of the Brick mesh
     * @param {number} zVal The Z value
     * @public
     */
    setZ(zVal) {
        this._mesh.unfreezeWorldMatrix();
        zVal += this._mesh.scaling.z / 2;
        this._mesh.position.z = zVal;
        this._mesh.freezeWorldMatrix();
    }

    /**
     * Gets the position of the Brick's mesh
     * @returns {number} Position of Brick's mesh
     * @public
     */
    getPosition() {
        return this._mesh.position;
    }

    /**
     * Sets the rotation of the Brick's mesh
     * @param {number} rVal The rotational value
     */
    setRotation(rVal) {
        let slide = 0;
        this._mesh.unfreezeWorldMatrix();
        this._mesh.rotation.y = rVal;
        if (slide !== 0) {
            if (isDebugMode)
                console.log("Sliding: " + slide);
            this._mesh.position.y -= slide;
        }
        this._mesh.freezeWorldMatrix();
        return this;
    }

    /**
     * Centers the pivot of the Brick's mesh
     * @public
     */
    centerPivot() {
        var centerPointWorld = _mesh.getBoundingInfo().boundingBox.centerWorld;
        this.setPivotPoint(centerPointWorld, BABYLON.Space.WORLD);
    }

    /**
     * Given constructed brick, should it be able to be placed? Helper for when creating bricks
     * @param {Brick} brick The brick to check if can be placed
     * @returns {boolean} True if the brick can be placed
     * @static
     * @public
     */
    static canPlaceBrick(brick) {
        for (let i = 0; i < brickList.length; i++) {
            if (brick.intersectsMesh(brickList[i], false) && brick !== brickList[i]) {
                console.log("Intersection! Cannot place brick.");
                return false;
            }
        }
        return true;
    }

    /**
     * Temporarily creates a 1x1x1 brick to test if an individual location cube is filled
     * @param {number} x X value to test
     * @param {number} y Y value to test
     * @param {number} z Z value to test
     * @param {BABYLON.Scene} scene Scene to test brick in
     * @returns {boolean} True if the location is empty, false if Brick already taking up that space
     * @static
     * @public
     */
    static canPlaceBrickAt(x, y, z, scene) {
        var testerBrick = new Brick("DELETEME", 1, 1, 1, new BABYLON.Vector3(x, y, z), COLORS.DEFAULT, scene);
        return this.canPlaceBrick(testerBrick);
    }

    /**
     * Places a Brick in the scene by cloning a base Brick, no straight constructing
     * @param {*} width Width dimension of the Brick to create
     * @param {*} height Height dimension of the Brick to create
     * @param {*} depth Depth dimension of the Brick to create
     * @param {*} x X location of the Brick to create
     * @param {*} y Y location of the Brick to create
     * @param {*} z Z location of the Brick to create
     * @param {*} color Color that will be applied to the Brick's Mesh Material
     * @param {*} rotated Should the brick be rotated 90 degrees?
     * @returns {Brick} The created brick
     * @static
     * @public
     */
    static placeBrick(width, height, depth, x, y, z, color = COLOR_DEFAULT, rotated = false) {
        var brick;
        return brick;
    }

    /**
     * Gets the total number of active Bricks
     * @returns {number} Length of brickList
     * @static
     * @public
     */
    static countAllBricks() {
        return brickList.length;
    }

    static handlePlayerPick() {

    }
}

// See if running under node to avoid exception
if (typeof window == undefined)
    module.exports = Brick;