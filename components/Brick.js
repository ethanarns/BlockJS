/*const BABYLON = require('babylonjs');
// Import globals for testing
const MISCSETTINGS = require('./Globals').MISCSETTINGS;
const PLAYERDEFAULTS = require('./Globals').PLAYERDEFAULTS;
const COLORS = require('./Globals').COLORS;
var brickList = require('./Globals').brickList;
var lastId = require('./Globals').lastId;
var isDebugMode = require('./Globals').isDebugMode;
var Player = require('./Player');*/

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
     * @param {object} World World container holding scene and SPS
     * @constructs
     * @public
     */
    constructor (name, x, y, z, locVec, color, World) {
        this.id = ++lastId; // Increment THEN return
        var material = new BABYLON.StandardMaterial(name + " Material", World.scene);
            material.emissiveColor = new BABYLON.Color3(
                color.r / COLORS.EMISSDARKERBY,
                color.g / COLORS.EMISSDARKERBY,
                color.b / COLORS.EMISSDARKERBY
            );
            material.diffuseColor = color;
        this._mesh = BABYLON.MeshBuilder.CreateBox(name, {width: x, height:y, depth:z}, World.scene);
        locVec.x += x / 2;
        locVec.y += y / 2;
        locVec.z += z / 2;
        // Make pivot lower corner
        this._mesh.setPivotMatrix(BABYLON.Matrix.Translation(x/2, y/2, z/2));
        this._mesh.position = locVec;
        this._mesh.material = material;
        this._mesh.checkCollisions = true;
        this._mesh.material.freeze(); // Color set in particle anyway
        this._mesh.isPickable = true;
        this._mesh.freezeWorldMatrix();
        this._mesh._visibility = false; // kills drawcall without removing pickability
        brickList.push(this);
        // Wipe then recreate SPS
        Utils.refreshSPS();
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

    static deleteBrick(brick) {
        brick._mesh.dispose();
    }

    /**
     * Retrieves a reference to a brick with the spsCloneId of 'id'
     * @param {number} id SPS Particle id to match brick with
     */
    static getByParticleId(id) {
        // console.log("Searching for brick with spsCloneId " + id + "...");
        for (let i = 0; i < brickList.length; i++) {
            // console.log("Here's one: " + brickList[i].spsCloneId);
            if (brickList[i].spsCloneId === id) {
                // console.log("Found one!")
                return brickList[i];
            }
        }
        // console.log("None found...");
        return null;
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
     * @todo Make this again
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

module.exports = {
    MISCSETTINGS,
    PLAYERDEFAULTS,
    COLORS,
    brickList,
    lastId,
    isDebugMode
}
