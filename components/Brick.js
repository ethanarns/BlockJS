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
                color.r / MISCSETTINGS.EMISSDARKERBY,
                color.g / MISCSETTINGS.EMISSDARKERBY,
                color.b / MISCSETTINGS.EMISSDARKERBY
            );
            material.diffuseColor = color;
        this._mesh = BABYLON.MeshBuilder.CreateBox(name, {width: x, height:y, depth:z}, World.scene);
        this.widthX = x;
        this.heightY = y;
        this.depthZ = z;
        this._mesh.brickClass = this; // Parent reference to access Brick class from mesh
        locVec.x += x / 2;
        locVec.y += y / 2;
        locVec.z += z / 2;
        // Make pivot lower corner for right-angle rotation
        //this._mesh.setPivotMatrix(BABYLON.Matrix.Translation(x/2, y/2, z/2));
        this.centerPivot();
        this._mesh.computeWorldMatrix();
        if (isDebugMode) {
            this._mesh.showBoundingBox = true;
            this._mesh.showSubMeshesBoundingBox = true;
        }

        this._mesh.position = locVec;
        this._mesh.material = material;
        this._mesh.checkCollisions = true;
        this._mesh.material.freeze(); // Color set in particle anyway
        this._mesh.isPickable = true;
        if (!isDebugMode)
            this._mesh._visibility = false; // kills drawcall without removing pickability
    }

    /**
     * Slides the low corner of the mesh down to whole number location,
     * conforming the brick to the grid
     */
    floorFix() {
        var corner = new BABYLON.Vector3();
        corner.copyFrom(this._mesh.getBoundingInfo().minimum); // Kill reference
        // Not rotated
        if (this._mesh.rotation.y % (Math.PI) == 0) {
            corner.x = (corner.x - this._mesh.position.x + this.widthX) * -1;
            corner.z = (corner.z - this._mesh.position.z + this.depthZ) * -1;
            this._mesh.position.x -= corner.x - Math.floor(corner.x);
            this._mesh.position.z -= corner.z - Math.floor(corner.z);
        }
        else {
            corner.z = (corner.z - this._mesh.position.x + this.depthZ) * -1;
            corner.x = (corner.x - this._mesh.position.z + this.widthX) * -1;
            this._mesh.position.z -= corner.x - Math.floor(corner.x);
            this._mesh.position.x -= corner.z - Math.floor(corner.z);
        }
    }

    /**
     * Sets the material color of the Brick mesh
     * @param {BABYLON.Color3} color Color to set the Brick's Mesh to
     * @public
     */
    setColor(color) {
        if (!color.r) {
            console.log("ERROR: specify a color constant, not string");
            return;
        }
        this._mesh.material.unfreeze();
        this._mesh.material.emissiveColor = new BABYLON.Color3 (
            color.r / MISCSETTINGS.EMISSDARKERBY,
            color.g / MISCSETTINGS.EMISSDARKERBY,
            color.b / MISCSETTINGS.EMISSDARKERBY
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
        xVal = xVal + this.widthX / 2;
        this._mesh.position.x = xVal;
    }

    /**
     * Sets the Y position, in world space, of the Brick mesh
     * @param {number} yVal The Y value
     * @public
     */
    setY(yVal) {
        yVal = yVal + this.heightY / 2;
        this._mesh.position.y = yVal;
    }

    /**
     * Sets the Z position, in world space, of the Brick mesh
     * @param {number} zVal The Z value
     * @public
     */
    setZ(zVal) {
        zVal = zVal + this.depthZ / 2;
        this._mesh.position.z = zVal;
    }

    /**
     * Gets the position of the Brick's mesh
     * @returns {number} Position of Brick's mesh
     * @public
     */
    getPosition() {
        var pos = new BABYLON.Vector3();
        pos.copyFrom(this._mesh.position);
        //console.log(this._mesh.scaling / 2);
        pos.x = pos.x - this.widthX / 2;
        pos.y = pos.y - this.heightY / 2;
        pos.z = pos.z - this.depthZ / 2;
        return new BABYLON.Vector3(pos.x, pos.y, pos.z);
    }

    /**
     * Centers the pivot of the Brick's mesh.
     * @public
     */
    centerPivot() {
        var centerPointWorld = this._mesh.getBoundingInfo().boundingBox.centerWorld;
        this._mesh.setPivotPoint(centerPointWorld, BABYLON.Space.WORLD);
    }

    /**
     * A helper function to check if there is something below the Brick,
     * helping decide whether or not it will be a floating brick
     * @return {boolean} True if something solid beneath the brick
     */
    isObjectBelow() {
        if (this.getPosition().y <= 0) {
            // It is on the ground, therefore yes, something is below
            return true;
        }
        var testBrick = new Brick("DELETEME", this.widthX, this.heightY, this.depthZ,
        new BABYLON.Vector3(this.getPosition().x, this.getPosition().y - 1,
            this.getPosition().z), currentColor, World);
        testBrick._mesh.rotation.y = this._mesh.rotation.y;
        // We now have a duplicate exactly 1 position below
        return !Brick.canPlaceBrick(testBrick, true);
    }

    /**
     * Shrinks the mesh just enough to not overlap faces, helper for collision.
     * @private
     */
    _shrink() {
        this._mesh.scaling.x = MISCSETTINGS.BRICKSHRINK;
        this._mesh.scaling.y = MISCSETTINGS.BRICKSHRINK;
        this._mesh.scaling.z = MISCSETTINGS.BRICKSHRINK;
        this._mesh.computeWorldMatrix();
    }

    /**
     * Undoes the shrinking done in shrink().
     * @private
     * @see {@link _shrink}
     */
    _unshrink() {
        this._mesh.scaling.x = 1;
        this._mesh.scaling.y = 1;
        this._mesh.scaling.z = 1;
        this._mesh.computeWorldMatrix();
    }

    /**
     * Spits out a SQL-friendly data set of the brick
     * @public
     */
    export() {
        var pos = new BABYLON.Vector3();
        pos.copyFrom(this.getPosition());
        var col = new BABYLON.Color3();
        col.copyFrom(this._mesh.material.diffuseColor);
        var result = {
            name: this.getName() + "",
            widthX: this.widthX,
            heightY: this.heightY,
            depthZ: this.depthZ,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            colorR: col.r,
            colorG: col.g,
            colorB: col.b,
            rot: this._mesh.rotation.y + 0
        };
        return result;
    }

    /**
     * Deletes a brick, targetted by the brick's id number.
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
     * Deletes all bricks
     * @public
     */
    static deleteAllBricks() {
        if (brickList.length == 0) {
            // No bricks to delete
            return;
        }
        for (let i = 0; i < brickList.length; i++) {
            brickList[i]._mesh.dispose();
            brickList[i] = null;
        }
        brickList = [];
        Utils.refreshSPS();
        UI.Audio.clickRemove.play();
        setTimeout(() => { UI.Audio.clickRemove.play() }, 200);
    }

    /**
     * Retrieves a reference to a brick with the spsCloneId of 'id'.
     * @param {number} id SPS Particle id to match brick with
     * @returns {Brick} The brick with stated id, null if error
     */
    static getByParticleId(id) {
        // console.log("Searching for brick with spsCloneId " + id + "...");
        for (let i = 0; i < brickList.length; i++) {
            if (brickList[i].spsCloneId === id) {
                return brickList[i];
            }
        }
        return null;
    }

    /**
     * Given constructed brick, should it be able to be placed?
     * Mainly a helper for when creating bricks.
     * @param {Brick} brick The brick to check if can be placed
     * @param {boolean} deleteOnDone Should the brick be deleted upon check completion?
     * @returns {boolean} True if the brick can be placed
     * @static
     * @public
     */
    static canPlaceBrick(brick, deleteOnDone = false) {
        // Only call if brick has not been placed yet and is in the list
        if (brick._mesh.position.y < 0) {
            // Underground, cancel
            if (deleteOnDone) {
                brick._mesh.dispose();
                brick = null;
            }
            return false;
        }

        brick._shrink();
        for (let i = 0; i < brickList.length; i++) {
            brickList[i]._shrink();
            if (brick._mesh.intersectsMesh(brickList[i]._mesh, false)) {
                if (isDebugMode)
                    console.log("Intersection detected with brick [id: " + brickList[i].id + "]");
                brickList[i]._unshrink();
                brick._unshrink();
                if (deleteOnDone) {
                    brick._mesh.dispose();
                    brick = null;
                }
                return false;
            }
            brickList[i]._unshrink();
        }
        brick._unshrink();
        if (deleteOnDone) {
            brick._mesh.dispose();
            brick = null;
        }
        return true;
    }

    /**
     * Places a Brick in the scene by cloning a base Brick, no straight constructing.
     * Will get almost all data from player's current state/gui.
     * @param {BABYLON.Vector3} loc Location of the Brick to create
     * @returns {Brick} The created brick
     * @static
     * @public
     */
    static placeBrick(loc) {
        var dim = currentBrick;
        var brick = new Brick("Brick", dim.x, dim.y, dim.z,
            new BABYLON.Vector3(loc.x, loc.y, loc.z), currentColor, World);
        brick._mesh.rotation.y = currentRotation + 0.0;
        if (!this.canPlaceBrick(brick)) {
            //console.log("Brick collision detected.");
            brick._mesh.dispose();
            brick = null;
            return null;
        }
        // Must do this separately since isObjectBelow calls canPlaceBrick()
        if (!brick.isObjectBelow()) {
            //console.log("Brick floating detected.");
            brick._mesh.dispose();
            brick = null;
            return null;
        }

        brickList.push(brick);
        // Wipe then recreate SPS
        Utils.refreshSPS();
        // This brick should not move after this, so freeze in place to save memory
        brick._mesh.freezeWorldMatrix();
        UI.Audio.clickPlace.play();
        return brick;
    }

    /**
     * Places a brick constructed from JSON data
     * @param {object} data JSON object containing brick data
     * @returns {object} Brick created, if fails null
     * @public
     * @static
     */
    static placeBrickFromData(data) {
        if (!data || !data.name) {
            console.log("ERROR: Invalid data!");
            return;
        }
        var brick = new Brick(data.name, data.widthX, data.heightY, data.depthZ,
            new BABYLON.Vector3(data.x, data.y, data.z),
            new BABYLON.Color3(data.colorR, data.colorG, data.colorB), World);
        //console.log(brick._mesh);
        brick._mesh.rotation.y = data.rot + 0.0;
        if (!this.canPlaceBrick(brick)) {
            console.log("Brick collision detected.");
            brick._mesh.dispose();
            brick = null;
            return null;
        }
        // Must do this separately since isObjectBelow calls canPlaceBrick()
        if (!brick.isObjectBelow()) {
            //console.log("Brick floating detected.");
            brick._mesh.dispose();
            brick = null;
            return null;
        }
        brickList.push(brick);
        // Wipe then recreate SPS
        Utils.refreshSPS();
        // This brick should not move after this, so freeze in place to save memory
        brick._mesh.freezeWorldMatrix();
        // Skip sound, since it'll all be at once
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
     * Gets the total number of all active Bricks
     * @returns {number} Length of brickList
     * @static
     * @public
     */
    static countAllBricks() {
        return brickList.length;
    }

    /**
     * Fixes position of temp brick and placement. For example, slides brick into
     * place if the ray hits the ground, or snaps to the side of a brick ray hit
     * @param {BABYLON.Vector3} brickPos Where the ray hit
     * @param {BABYLON.Mesh} hitMesh The mesh the ray hit, if any
     * @public
     * @static
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
            var newY = hitMesh.position.y + hitMesh.scaling.y / 2; // Placed bricks are centered
            // The raycast has hit high on thebrick, likely meaning its at or near the top
            if (newY - brickPos.y < 0.1) {
                brickPos.y = newY;
            }
            else {
                // Most likely the side of the brick has been hit. Lets get the player rotation...
                var rot = player1.getDirection();
                brickPos.y = Math.floor(brickPos.y);
                // Use returned Vector3 to decide which way the brick should snap
                brickPos.x -= rot.x;
                brickPos.z -= rot.z;
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
    /**
     * Creates a TempBrick
     * @param {Player} owner Player that will own the brick
     * @constructs
     */
    constructor (owner) {
        if (!owner) {
            console.log("[!] No owner detected in TempBrick construction!");
            return;
        }
        super("tempBrick", currentBrick.x, currentBrick.y, currentBrick.z,
            new BABYLON.Vector3(0, 0, 0), currentColor, World, currentRotation);
        this._mesh.material.unfreeze();
        this._mesh.material.alpha = 0.5;
        this._mesh._visibility = true;
        this._mesh.isVisible = true;
        this._mesh.checkCollisions = false;
        this._mesh.brickClass = this;
        this._mesh.isPickable = false;
        this.owner = owner;
    }

    /**
     * When called, fires a ray from the player camera and then moves the tempBrick
     * to a constrained location
     * @public
     */
    moveToRay() {
        var hit = scene.pickWithRay(this.owner.rayHelper.ray);
        if (!hit || hit == null || hit.pickedPoint == null) {
            //console.log("No hit point!");
        }
        else {
            var hitPoint = hit.pickedPoint;
            hitPoint = Brick.fixPos(hitPoint, hit.pickedMesh);
            this.setX(hitPoint.x);
            this.setY(hitPoint.y);
            this.setZ(hitPoint.z);
            this.floorFix();
        }
    }

    /**
     * Recreates the TempBrick with a new size
     * @param {Player} player Player that owns the TempBrick
     * @static
     * @public
     */
    static rebuildTemp(player, fixSize = false) {
        var tempPos = new BABYLON.Vector3();
        tempPos.copyFrom(player.tempBrick._mesh.position);
        player.tempBrick._mesh.dispose();
        player.tempBrick = null;
        player.tempBrick = new TempBrick(player);
        player.tempBrick._mesh.computeWorldMatrix();
        player.tempBrick._mesh.position = tempPos;
        player.tempBrick._mesh.rotation.y = currentRotation;
        player.tempBrick.floorFix();
    }

    /**
     * Set the tempBrick's color to newColor
     * @param {BABYLON.Color3} newColor Color constant from COLORS
     * @returns {tempBrick} The brick itself, for chaining purposes
     * @public
     */
    changeBrickColor(newColor) {
        currentColor = newColor;
        TempBrick.rebuildTemp(this.owner);
        return this;
    }

    /**
     * Shifts the color to the next in the array; can also go backwards
     * @param {boolean} backwards If true, the brick color will shift back
     * @public
     */
    nextBrickColor(backwards = false) {
        var colorList = Object.values(COLORS);
        var newIndex;
        if (backwards)
            newIndex = --currentColorIndex % colorList.length;
        else
            newIndex = ++currentColorIndex % colorList.length;
        if (newIndex < 0)
            newIndex += colorList.length;
        currentColor = colorList[newIndex];
        TempBrick.rebuildTemp(this.owner);
    }

    /**
     * Changes the size of the brick to newSize
     * @param {BABYLON.Vector3} newSize A constant from BRICKS
     * @public
     */
    changeBrickSize(newSize) {
        currentBrick = newSize;
        TempBrick.rebuildTemp(this.owner, true);
    }

    /**
     * Shifts the size to the next in the array; can also go backwards
     * @param {boolean} backwards If true, the brick sizewill shift back
     * @public
     */
    nextBrickSize(backwards = false) {
        var bList = Object.values(BRICKS);
        var newIndex;
        if (backwards)
            newIndex = --currentBrickIndex % bList.length;
        else
            newIndex = ++currentBrickIndex % bList.length;
        if (newIndex < 0)
            newIndex += bList.length;
        currentBrick = bList[newIndex];
        TempBrick.rebuildTemp(this.owner, true);
    }

    /**
     * Rotates the Brick 90 degrees plus adjustment.
     * @public
     */
    rotate() {
        if (this.widthX == this.depthZ) {
            //console.log("Rotating a square is pointless, skipping.");
            return;
        }
        // If even, it'll just rotate around the center, only do odd:
        if ((this.widthX % 2 == 0 && this.depthZ % 2 != 0) ||
        (this.depthZ % 2 == 0 && this.widthX % 2 != 0)) {
            if (this._mesh.rotation.y == 0) {
                this._mesh.position.x -= 0.5;
                this._mesh.position.z -= 0.5;
            }
            else if (this._mesh.rotation.y == Math.PI / 2) {
                this._mesh.position.x -= 0.5;
                this._mesh.position.z += 0.5;
            }
            else if (this._mesh.rotation.y == Math.PI) {
                this._mesh.position.x += 0.5;
                this._mesh.position.z += 0.5;
            }
            else {
                this._mesh.position.x += 0.5;
                this._mesh.position.z -= 0.5;
            }
        }
        currentRotation = (this._mesh.rotation.y + (Math.PI / 2)) % (Math.PI * 2);
        // console.log(currentRotation);
        TempBrick.rebuildTemp(this.owner);
    }
}
