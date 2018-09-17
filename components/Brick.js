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
        this.widthX = x;
        this.heightY = y;
        this.depthZ = z;
        this._mesh.brickClass = this; // Parent reference to access Brick class from mesh
        locVec.x += x / 2;
        locVec.y += y / 2;
        locVec.z += z / 2;
        // Make pivot lower corner for right-angle rotation
        this._mesh.setPivotMatrix(BABYLON.Matrix.Translation(x/2, y/2, z/2));
        this._mesh.rotation.y = (Math.PI / 180) * rotation;
        this.centerPivot();
        this._mesh.computeWorldMatrix();
        //this._mesh.showBoundingBox = true;
        //this._mesh.showSubMeshesBoundingBox = true;

        
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
     * Sets the rotation of the Brick's mesh
     * @param {number} rVal The rotational value
     */
    setRotation(rVal) {
        let slide = 0;
        this._mesh.rotation.y = rVal;
        if (slide !== 0) {
            if (isDebugMode)
                console.log("Sliding: " + slide);
            this._mesh.position.y -= slide;
        }
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
     * Shrinks the mesh just enough to not overlap faces, helper for collision
     * @private
     */
    _shrink() {
        this._mesh.scaling.x = MISCSETTINGS.BRICKSHRINK;
        this._mesh.scaling.y = MISCSETTINGS.BRICKSHRINK;
        this._mesh.scaling.z = MISCSETTINGS.BRICKSHRINK;
        this._mesh.computeWorldMatrix();
    }

    /**
     * Undoes the shrinking done in shrink()
     * @private
     * @see {@link _shrink}
     */
    _unshrink() {
        this._mesh.scaling.x = 1;
        this._mesh.scaling.y = 1;
        this._mesh.scaling.z = 1;
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
     * @returns {Brick} The brick with stated id, null if error
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
     * @param {boolean} deleteOnDone Should the brick be deleted upon check completion?
     * @returns {boolean} True if the brick can be placed
     * @static
     * @public
     */
    static canPlaceBrick(brick, deleteOnDone = false) {
        // Only call if brick has not been placed yet and is in the list
        brick._shrink();
        for (let i = 0; i < brickList.length; i++) {
            brickList[i]._shrink();
            if (brick._mesh.intersectsMesh(brickList[i]._mesh, false)) {
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
     * Places a Brick in the scene by cloning a base Brick, no straight constructing
     * Will get almost all data from player's current state/gui
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
        if (!this.canPlaceBrick(brick)) {
            console.log("Brick collision detected!");
            brick._mesh.dispose();
            brick = null;
            return null;
        }

        brickList.push(brick);
        // Wipe then recreate SPS
        Utils.refreshSPS();
        // This brick should not move after this, so freeze in place
        brick._mesh.freezeWorldMatrix();
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
     */
    constructor (owner) {
        if (!owner) {
            console.log("[!] No owner detected in TempBrick construction!");
            return;
        }
        super("tempBrick", currentBrick.x, currentBrick.y, currentBrick.z,
            new BABYLON.Vector3(0, 0, 0), currentColor, World, currentRotation);

        this._mesh.material.alpha = 0.5;
        this._mesh.material.unfreeze();
        this._mesh._visibility = true;
        this._mesh.isVisible = true;
        this._mesh.checkCollisions = false;
        this._mesh.brickClass = null;
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
        }
    }

    /**
     * Recreates the TempBrick with a new size
     * @param {Player} player Player that owns the TempBrick
     * @param {BABYLON.Vector3} brickSize Size of new TempBrick
     */
    static rebuild(player, brickSize) {
        currentBrick = brickSize;
        player.tempBrick._mesh.dispose();
        player.tempBrick = null;
        player.tempBrick = new TempBrick(player);
    }
}
