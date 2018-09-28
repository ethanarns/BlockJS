/**
 * Class representing a player, who will traverse this strange place
 * @author Ethan Arns <contact@ethanarns.com>
 */
class Player {
    /**
     * Create a Player
     * @param {string} name Name of player
     * @param {object} optionObject An object containing optional additional properties
     * @param {BABYLON.scene} scene The scene this will be placed in
     * @constructs
     * @public
     */
    constructor(name, optionObject, scene) {
        this.id = ++lastId;
        this.name = name;
        this.alive = true;
        this.height = PLAYERDEFAULTS.HEIGHT;
        this.width = PLAYERDEFAULTS.WIDTH;
        this.speed = PLAYERDEFAULTS.SPEED;
        this.mouseSensitivity = PLAYERDEFAULTS.SENSITIVITY;
        this.jumpStrength = PLAYERDEFAULTS.JUMPSTRENGTH;

        this.forwards = 0;
        this.sideways = 0;
        this.jumpPressed = false;
        this.floating = false;
        this.vertVel = 1.0;
        this.scene = scene;

        this.root = BABYLON.MeshBuilder.CreateSphere("PlayerRoot", {
            height: this.height,
            width:this.width,
            depth:this.width,
            segments: 2 // turn up if needs visibility, 32 is default
        }, this.scene);
        this.root.isVisible = false;
        this.root.checkCollisions = true;
        this.root.applyGravity = false;
        this.root.isPickable = false;
        this.root.ellipsoid = new BABYLON.Vector3(this.width, this.height, this.width);
        this.root.alwaysSelectAsActiveMesh = true;

        this.camera = new BABYLON.UniversalCamera("PlayerCamera", new BABYLON.Vector3(0, 0, 0), this.scene);
        this.camera.checkCollisions = false;
        this.camera.applyGravity = false;
        this.camera.isPickable = false;

        this.pitch = new BABYLON.TransformNode("PlayerPitch");
        this.pitch.position = new BABYLON.Vector3(0, this.height - 1.0, 0);
        this.pitch.isPickable = false;

        // Hierarchy
        this.pitch.parent = this.root;
        this.camera.parent = this.pitch;

        this.scene.actionManager = new BABYLON.ActionManager(scene);
        this._initPointerLock();
        this._setupLook();
        this._setupMovement();
        this._setupBrickControl();
        var _this = this;
        setInterval(function() {
            if (player1.floating) {
                player1.vertVel -= MISCSETTINGS.GRAVITY.y / 100;
                if (player1.vertVel > PLAYERDEFAULTS.MAXVELOCITY) {
                    player1.vertVel = PLAYERDEFAULTS.MAXVELOCITY;
                }
            }
            else {
                // Grounded, make stick
                player1.vertVel = PLAYERDEFAULTS.VELOCITY;
                if (player1.jumpPressed) {
                    //console.log("Jump pressed!");
                    player1.vertVel = -player1.jumpStrength;
                    UI.Audio.jumpSound.play();
                }
            }
        }, 100);

        // Raycast shooter
        this.rayHelper = new BABYLON.RayHelper(new BABYLON.Ray());
        this.rayHelper.attachToMesh(this.camera, new BABYLON.Vector3(0,0,1), new BABYLON.Vector3(0, 0, 0), 100);

        this.tempBrick = new TempBrick(this);
        this.tempBrick.setY(-99);

        if (optionObject) {
            // Option object exists!
            if (optionObject.isAlive !== undefined && optionObject.isAlive !== null) {
                this.alive = optionObject.isAlive;
            }
            if (optionObject.spawnPoint !== undefined && optionObject.spawnPoint !== null) {
                this.root.position = optionObject.spawnPoint;
            }
        }
    }
    /**
     * Add listeners to user's mouse controls
     * @private
     * @todo Fix glitch where you cannot hold click and turn at the same time
     */
    _setupLook() {
        var _this = this;
        const PI_2 = Math.PI / 2;
        var onMouseMove = function(event) {
            // Check in reverse
            _this.controlEnabled = (
                document.mozPointerLockElement === canvas ||
                document.webkitPointerLockElement === canvas ||
                document.msPointerLockElement === canvas ||
                document.pointerLockElement === canvas);

            if (_this.controlEnabled) {
                var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                // Rotate mesh itself
                _this.root.rotation.y += movementX * _this.mouseSensitivity;
                // Rotate camera holder
                _this.pitch.rotation.x += movementY * _this.mouseSensitivity;
                // Lock up and down viewing
                _this.pitch.rotation.x = Math.max( - PI_2, Math.min( PI_2, _this.pitch.rotation.x ) );
            }
        }
        document.addEventListener('mousemove', onMouseMove, false);

        var onAnyClick = function(event) {
            if (!isDebugMode) {
                event.preventDefault();
            }
            _this.rayFromCameraMove();
        }
        document.addEventListener('click', onAnyClick, false);
    }

    /**
     * Locks the Player's cursor to the screen upon click
     * @private
     */
    _initPointerLock() {
        var _this = this;
        var canvas = this.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock ||
                canvas.msRequestPointerLock ||
                canvas.mozRequestPointerLock ||
                canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);
        var pointerlockchange = function (event) {
            if (document.mozPointerLockElement === null
                || document.webkitPointerLockElement === null
                || document.msPointerLockElement === null
                || document.pointerLockElement === null) {
                // Just lost pointer lock
                Utils.saveToServer();
            }
            _this.controlEnabled = (
                document.mozPointerLockElement === canvas
                || document.webkitPointerLockElement === canvas
                || document.msPointerLockElement === canvas
                || document.pointerLockElement === canvas);
        };
        // Attach events to the document
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    }

    /**
     * Allow player to move on ground, jump
     * @private
     */
    _setupMovement() {
        var _this = this;
        // Key downs
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 'w'
            }, function() {
                _this.forwards = _this.speed;
            })
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 's'
            }, function() {
                _this.forwards = -_this.speed;
            })
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 'a'
            }, function() {
                _this.sideways = -_this.speed;
            })
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: 'd'
            }, function() {
                _this.sideways = _this.speed;
            })
        );

        // Key ups
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                parameter: 'w'
            }, function() {
                _this.forwards = 0;
            })
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                parameter: 's'
            }, function() {
                _this.forwards = 0;
            })
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                parameter: 'a'
            }, function() {
                _this.sideways = 0;
            })
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                parameter: 'd'
            }, function() {
                _this.sideways = 0;
            })
        );

        // Some keys don't have working event names, do keycodes instead
        var onJumpKeyDown = function(evt) {
            // Spacebar
            if (evt.keyCode == 32) {
                _this.jumpPressed = true;
            }
        };
        var onJumpKeyUp = function(evt) {
            // Spacebar
            if (evt.keyCode == 32) {
                _this.jumpPressed = false;
            }
        };
        BABYLON.Tools.RegisterTopRootEvents([{
            name: "keydown",
            handler: onJumpKeyDown
        }, {
            name: "keyup",
            handler: onJumpKeyUp
        }]);
    }

    _setupBrickControl() {
        var _this = this;
        var onKeyDown = function(evt) {
            if (!isDebugMode) {
                evt.preventDefault();
            }
            // Brick movement
            if (evt.keyCode > 0) {
                var pRot = new BABYLON.Vector3();
                pRot.copyFrom(_this.getDirection());
                var tb = _this.tempBrick._mesh.position;
                switch (evt.keyCode) {
                    // Enter (place brick)
                    case 13:
                        var brickPos = new BABYLON.Vector3();
                        brickPos.copyFrom(_this.tempBrick._mesh.position);
                        brickPos.x = brickPos.x - _this.tempBrick.widthX / 2;
                        brickPos.y = brickPos.y - _this.tempBrick.heightY / 2;
                        brickPos.z = brickPos.z - _this.tempBrick.depthZ / 2;
                        Brick.placeBrick(brickPos);
                        break;
                    // Up
                    case 38:
                        tb.x += pRot.x;
                        tb.z += pRot.z;
                        break;
                    // Down
                    case 40:
                        tb.x -= pRot.x;
                        tb.z -= pRot.z;
                        break;
                    // Left
                    case 37:
                        tb.z += pRot.x;
                        tb.x -= pRot.z;
                        break;
                    // Right
                    case 39:
                        tb.z -= pRot.x;
                        tb.x += pRot.z;
                        break;
                    // Left bracket (shift downwards)
                    case 219:
                        if (tb.y >= 1.5)
                            tb.y--;
                        break;
                    // Right bracket (shift upwards)
                    case 221:
                        tb.y++;
                        break;
                    // Backslash (rotate)
                    case 191:
                        player1.tempBrick.rotate();
                        break;
                    // Forward slash ("clear")
                    case 220:
                        player1.tempBrick.setY(-99);
                        break;
                    // Single Quote (next color)
                    case 222:
                        player1.tempBrick.nextBrickColor();
                        break;
                    // Semicolor (previous color)
                    case 59:
                        player1.tempBrick.nextBrickColor(true);
                        break;
                    // Period (next brick size)
                    case 190:
                        player1.tempBrick.nextBrickSize();
                        break;
                    // Comma (previous brick size)
                    case 188:
                        player1.tempBrick.nextBrickSize(true);
                        break;
                    // I (show/hide instructions)
                    case 73:
                        if (UI.text.notRenderable) {
                            UI.text.notRenderable = false;
                        }
                        else {
                            UI.text.notRenderable = true;
                        }
                    // Backspace
                    case 8:
                        player1.rayFromCameraDelete();
                        break;
                    // U (clear all bricks)
                    case 85:
                        Brick.deleteAllBricks();
                        break;
                }
            }
        };
        BABYLON.Tools.RegisterTopRootEvents([{
            name: "keydown",
            handler: onKeyDown
        }]);
    }

    /**
     * Repeatedly called in order to allow player to move as scene renders
     * @public
     */
    movement() {
        var dirVector = BABYLON.Vector3.TransformCoordinates(
            new BABYLON.Vector3(this.sideways, -this.vertVel, this.forwards),
            BABYLON.Matrix.RotationY(this.root.rotation.y));
        this.root.moveWithCollisions(dirVector);
        this.floating = this.isFloating();
    }

    /**
     * Gets a Vector3 used to adjust objects to the player's view direction
     * @returns {BABYLON.Vector3} X or Z value representing the player direction
     */
    getDirection() {
        // Always keep rotation within 0-360
        var degrees = (this.root.rotation.y * (180/Math.PI)) % 360;
        if (degrees < 0) // % can spit out negatives, so push to positive
            degrees += 360;
        if (degrees > 315 || degrees <= 45) {
            return new BABYLON.Vector3(0, 0, 1);
        }
        else if (degrees > 45 && degrees <= 135) {
            return new BABYLON.Vector3(1, 0, 0);
        }
        else if (degrees > 135 && degrees <= 225) {
            return new BABYLON.Vector3(0, 0, -1);
        }
        else {
            return new BABYLON.Vector3(-1, 0, 0);
        }
    }

    /**
     * Returns true if the player is currently airborne
     * @returns {boolean} Is the player airborne?
     * @public
     */
    isFloating() {
        var origin = new BABYLON.Vector3();
        origin.copyFrom(this.root.position);
        var down = new BABYLON.Vector3(0, -0.6, 0);
        var ray = new BABYLON.Ray(origin, down, 5);
        var hit = scene.pickWithRay(ray);
        // Did the ray fired below the player hit an object?
        return !hit.hit;
    }

    /**
     * Instantly teleports the player to the specified location
     * @param {number} x X Position
     * @param {number} y Y Position
     * @param {number} z Z Position
     * @public
     */
    moveTo(x, y, z) {
        this.root.position.copyFrom(new BABYLON.Vector3(x, y, z));
    }

    /**
     * Fires a raycast from the camera in order to adjust tempbrick location
     * @public
     */
    rayFromCameraMove() {
        var hit = scene.pickWithRay(this.rayHelper.ray);
        if (!hit.pickedMesh) {
                //console.log("No mesh hit by player raycast!");
            return;
        }
        else {
            this.tempBrick.moveToRay();
        }
    }

    /**
     * Fires a raycast from the camera in order to delete a brick
     * @public
     */
    rayFromCameraDelete() {
        var hit = scene.pickWithRay(this.rayHelper.ray);
        if (!hit.pickedMesh || !hit.pickedMesh.brickClass) {
                //console.log("No Brick hit by player raycast!");
            return;
        }
        else {
            Brick.deleteBrickById(hit.pickedMesh.brickClass.id);
        }
    }
}

/* Uncomment if using Node
module.exports = {
    Player: Player
}
*/
