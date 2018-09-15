class Player {
    constructor(name, optionObject, scene) {
        this.id = ++lastId;
        this.name = name;
        this.alive = true;
        this.height = DEFAULT_PLAYERHEIGHT;
        this.width = DEFAULT_PLAYERWIDTH;
        this.speed = DEFAULT_PLAYERSPEED;
        this.inertia = DEFAULT_INERTIA;
        this.mouseSensitivity = DEFAULT_SENSITIVITY;
        this.jumpStrength = DEFAULT_PLAYERJUMPSTRENGTH;

        this.forwards = 0;
        this.sideways = 0;
        this.jumpPressed = false;
        this.floating = false;
        this.vertVel = 1.0;
        this.scene = scene;
        if (optionObject) {
            // Option object exists!
            if (optionObject.isAlive !== undefined && optionObject.isAlive !== null) {
                this.alive = optionObject.isAlive;
            }
        }
        this.root = BABYLON.MeshBuilder.CreateSphere("PlayerRoot", {height: this.height, width:this.width, depth:this.width}, this.scene);
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

        // Player Audio
        this.jumpSound = new BABYLON.Sound("gunshot", "./audio/jump.wav", scene);

        this.scene.actionManager = new BABYLON.ActionManager(scene);
        this._initPointerLock();
        this._setupLook();
        this._setupMovement();
        var _this = this;
        setInterval(function() {
            if (player1.floating) {
                player1.vertVel -= GRAVITY.y / 100;
                if (player1.vertVel > DEFAULT_PLAYERMAXVELOCITY) {
                    player1.vertVel = DEFAULT_PLAYERMAXVELOCITY;
                }
            }
            else {
                // Grounded, make stick
                player1.vertVel = DEFAULT_PLAYERVELOCITY;
                if (player1.jumpPressed) {
                    //console.log("Jump pressed!");
                    player1.vertVel = -player1.jumpStrength;
                    _this.jumpSound.play();
                }
            }
        }, 100);

        this.rayHelper = new BABYLON.RayHelper(new BABYLON.Ray());
        this.rayHelper.attachToMesh(this.camera, new BABYLON.Vector3(0,0,1), new BABYLON.Vector3(0, 0, 0), 100);
    }
    // TODO: Fix this dumb thing not being able to hold down mouse and turn at same time
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
            event.preventDefault();
            _this.rayFromCamera();
        }
        document.addEventListener('click', onAnyClick, false);
    }

    _initPointerLock() {
        var _this = this;
        var canvas = this.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);
        var pointerlockchange = function (event) {
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

    _setupMovement() {
        var _this = this;
        // Key downs
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                    parameter: 'w'
                },
                function() { _this.forwards = _this.speed; }
            )
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                    parameter: 's'
                },
                function() { _this.forwards = -_this.speed; }
            )
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                    parameter: 'a'
                },
                function() { _this.sideways = -_this.speed; }
            )
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                    parameter: 'd'
                },
                function() { _this.sideways = _this.speed; }
            )
        );

        // Key ups
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: 'w'
                },
                function() { _this.forwards = 0; }
            )
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: 's'
                },
                function() { _this.forwards = 0; }
            )
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: 'a'
                },
                function() { _this.sideways = 0; }
            )
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: 'd'
                },
                function() { _this.sideways = 0; }
            )
        );
        // There is no event.key for space! Do it via values instead.
        var onKeyDown = function(evt) {
            // Spacebar
            if (evt.keyCode == 32) {
                _this.jumpPressed = true;
            }
        };
        var onKeyUp = function(evt) {
            if (evt.keyCode == 32) {
                _this.jumpPressed = false;
            }
        };
        BABYLON.Tools.RegisterTopRootEvents([{
            name: "keydown",
            handler: onKeyDown
        }, {
            name: "keyup",
            handler: onKeyUp
        }]);
    }

    movement() {
        var dirVector = BABYLON.Vector3.TransformCoordinates(
            new BABYLON.Vector3(this.sideways, -this.vertVel, this.forwards),
            BABYLON.Matrix.RotationY(this.root.rotation.y));
        this.root.moveWithCollisions(dirVector);
        this.floating = this.isFloating();
        //console.log(!this.isFloating());
        /*if (!this.isFloating() && this.jumpPressed) {
            this.vertVel = -1;
        }*/
    }

    isFloating() {
        var origin = new BABYLON.Vector3();
        origin.copyFrom(this.root.position);
        var down = new BABYLON.Vector3(0, -0.6, 0);
        var ray = new BABYLON.Ray(origin, down, 5);
        //BABYLON.RayHelper.CreateAndShow(ray, this.scene, new BABYLON.Color3(1, 0, 0));
        /*var picks = this.scene.multiPickWithRay(ray);
        for (let i = 0; i < picks.length; i++) {
            console.log(picks[i].pickedMesh.name);
        }*/
        var hit = scene.pickWithRay(ray);

        return !hit.hit;
    }

    moveTo(x, y, z) {
        this.root.position = new BABYLON.Vector3(x, y, z)
    }

    rayFromCamera() {
        var hit = scene.pickWithRay(this.rayHelper.ray);
        if (!hit.pickedMesh) {
            console.log("No mesh hit by ray");
            return;
        }
        else {
            var hitPoint = hit.pickedPoint;
            var hitMesh = hit.pickedMesh;
        }
    }
}