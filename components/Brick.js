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
     * @param {number} rotation The bricks rotation, if any, in degrees
     * @constructs
     * @public
     */
    constructor (name, x, y, z, locVec, color, World, rotation = 0) {
        this.id = ++lastId; // Increment THEN return
        var material = new BABYLON.StandardMaterial(name + " Material", World.scene);
            material.emissiveColor = new BABYLON.Color3(
                color.r / COLORS.EMISSDARKERBY,
                color.g / COLORS.EMISSDARKERBY,
                color.b / COLORS.EMISSDARKERBY
            );
            material.diffuseColor = color;
        this._mesh = BABYLON.MeshBuilder.CreateBox(name, {width: x, height:y, depth:z}, World.scene);
        this._mesh.brickClass = this; // Parent reference to access Brick class from mesh
        locVec.x += x / 2;
        locVec.y += y / 2;
        locVec.z += z / 2;
        // Make pivot lower corner
        this._mesh.setPivotMatrix(BABYLON.Matrix.Translation(x/2, y/2, z/2));
        this._mesh.rotation.y = (Math.PI / 180) * rotation;
        this.centerPivot();
        this._mesh.computeWorldMatrix();
        this._mesh.scaling = new BABYLON.Vector3(0.99, 0.99, 0.99);
        this._mesh.position = locVec;
        this._mesh.material = material;
        this._mesh.checkCollisions = true;
        this._mesh.material.freeze(); // Color set in particle anyway
        this._mesh.isPickable = true;
        this._mesh._visibility = false; // kills drawcall without removing pickability
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
     * Sets the name of the Brick
     * @param {string} newName Name to set the Brick to (via its mesh)
     */
    setName(newName) {
        this._mesh.name = newName;
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
        //this._mesh.freezeWorldMatrix();
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
        //this._mesh.freezeWorldMatrix();
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
        //this._mesh.freezeWorldMatrix();
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
        //this._mesh.freezeWorldMatrix();
        return this;
    }

    /**
     * Centers the pivot of the Brick's mesh
     * @public
     */
    centerPivot() {
        var centerPointWorld = this._mesh.getBoundingInfo().boundingBox.centerWorld;
        this._mesh.setPivotPoint(centerPointWorld, BABYLON.Space.WORLD);
    }

    /**
     * Deletes a brick, targetted by the brick's id number
     * @param {number} id id of brick to delete
     * @static
     * @public
     */
    static deleteBrickById(id) {
        var found = false;
        for (let i = 0; i < brickList.length; i++) {
            if (id === brickList[i].id) {
                found = true;
                brickList[i]._mesh.dispose();
                brickList[i] = null;
                brickList.splice(i, 1);
            }
        }
        if (!found) {
            console.log("No brick found with that id");
            return;
        }
        Utils.refreshSPS();
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
            if (brick._mesh.intersectsMesh(brickList[i]._mesh, false) && brick.id !== brickList[i].id) {
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
     * Will get all data from player's state/gui
     * @param {BABYLON.Vector3} dim Dimension of the Brick to create
     * @param {BABYLON.Vector3} loc Location of the Brick to create
     * @returns {Brick} The created brick
     * @static
     * @public
     */
    static placeBrick(loc) {
        var dim = currentBrick;
        var brick = new Brick("Brick", dim.x, dim.y, dim.z, new BABYLON.Vector3(loc.x, loc.y, loc.z),
            currentColor, World, currentRotation);
        if (currentRotation % 90 != 0) {
            console.log("Warning: Angles not divisible by 90 degrees will " +
                "intersection with other bricks and look bad, fix");
        }
        brick._mesh.unfreezeWorldMatrix();
        if (!this.canPlaceBrick(brick)) {
            console.log("You cannot place a brick here!");
            Brick.deleteBrickById(brick.id);
            return null;
        }

        brickList.push(brick);
        // Wipe then recreate SPS
        Utils.refreshSPS();

        //brick._mesh.freezeWorldMatrix();
        UI.Audio.clickPlace.play();
        return brick;
    }

    /**
     * Translates 3 number values into a Vector3, then hands off to original
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} z Z position
     * @static
     * @public
     */
    static placeBrickAt(x, y, z) {
        if (typeof x == BABYLON.Vector3) {
            console.log("You are using the wrong function, see placeBrick()");
            return this.placeBrick(x);
        }
        return this.placeBrick(new BABYLON.Vector3(x, y, z));
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

    /**
     * Fixes position of temp brick and placement
     * @param {BABYLON.Vector3} brickPos Where the ray hit
     * @param {BABYLON.Mesh} hitMesh The mesh the ray hit, if any
     */
    static fixPos(brickPos, hitMesh) {
        if (!hitMesh || !hitMesh.brickClass) {
            // Not a brick, likely the ground
            brickPos.x = Math.floor(brickPos.x);
            brickPos.y = Math.floor(brickPos.y);
            brickPos.z = Math.floor(brickPos.z);
            if (brickPos.y < 0) {
                brickPos.y = 0;
            }
        }
        else {
            // Floor ensures the brick will always be on top of the brick, not rounding off the side
            brickPos.x = Math.floor(brickPos.x);
            brickPos.z = Math.floor(brickPos.z);
            // This is the position the brick would be if it were exactly on top of the hit brick
            var newY = hitMesh.position.y + 0.5; // Placed bricks are centered
            // The raycast has hit high on thebrick, likely meaning its at or near the top
            if (newY - brickPos.y < 0.1) {
                brickPos.y = newY;
            }
            else {
                // Most likely the side of the brick has been hit. Lets get the player rotation...
                var rot = player1.getDirection();
                console.log(rot);
                brickPos.y = Math.floor(brickPos.y);
                console.log(brickPos);
                brickPos.x -= rot.x;
                brickPos.z -= rot.z;
                //console.log(brickPos);
            }
        }    
        return brickPos;
    }
}

/**
 * A temporary brick showing what might be placed at a location
 * Gets all of its information from tool/gui global variables
 * @extends Brick
 */
class TempBrick extends Brick {
    constructor (owner) {
        if (!owner) {
            console.log("[!] No owner detected in TempBrick construction!");
            return;
        }
        super("tempBrick", currentBrick.x, currentBrick.y, currentBrick.z,
            new BABYLON.Vector3(0, 0, 0), currentColor, World, currentRotation);

        // 
        this._mesh.scaling.x *= 1.01;
        this._mesh.scaling.y *= 1.01;
        this._mesh.scaling.z *= 1.01;
        this._mesh.material.unfreeze();
        this._mesh.material.alpha = 0.5;
        this._mesh._visibility = true;
        this._mesh.isVisible = true;
        this._mesh.checkCollisions = false;
        this._mesh.brickClass = null;
        this._mesh.isPickable = false;
        this.owner = owner;
    }

    moveToRay() {
        var hit = scene.pickWithRay(this.owner.rayHelper.ray);
        if (!hit || hit == null || hit.pickedPoint == null) {
            //console.log("No hit point!");
        }
        else {
            //console.log(hit);
            var hitPoint = hit.pickedPoint;
            hitPoint = Brick.fixPos(hitPoint, hit.pickedMesh);
            this.setX(hitPoint.x);
            this.setY(hitPoint.y);
            this.setZ(hitPoint.z);
            console.log(this._mesh.position);
        }
    }
}