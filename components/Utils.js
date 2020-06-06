/**
 * Utility class, provides handy helper methods
 * @author Ethan Arns <contact@ethanarns.com>
 * @hideconstructor
 */

class Utils {
    /**
     * Create the world space, returns container object
     * @returns {object} Container object with world properties
     * @public
     * @static
     */
    static generateWorld() {
        var world = {};
        var ground = BABYLON.MeshBuilder.CreateGround("Ground", {
            height: MISCSETTINGS.FLOOR_WIDTH,
            width: MISCSETTINGS.FLOOR_WIDTH,
            subdivision: 2
        }, scene);
        ground.checkCollisions = true;
        ground.position = new BABYLON.Vector3(0, 0, 0);
        ground.isPickable = true;
        world.ground = ground;
        world.lights = {};
        world.lights.mainLight = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);
        world.lights.hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        world.lights.mainLight.intensity = 0.5;
        world.lights.hemiLight.intensity = 0.5;
        world.scene = scene; // Might look good in references
        SPS = new BABYLON.SolidParticleSystem("SPS", scene);
        var saveLoop = setInterval(function() {
            Utils.saveToServer();
        }, 10000);
        return world; // Return reference to it
    }

    /**
     * Creates and then returns the scene to run the game
     * Option after debug to hide the grid since it adds drawcalls
     * @param {BABYLON.Engine} engine Engine to run the game
     * @param {boolean} debug Should the game start in debug mode?
     * @param {boolean} noGrid If in debug mode, should the grid be hidden?
     * @returns {BABYLON.Scene} The game's current scene
     * @public
     * @static
     */
    static generateScene(engine, debug = true, showGrid = false) {
        var scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            scene.gravity = MISCSETTINGS.GRAVITY;
            scene.collisionsEnabled = false;
            scene.preventDefaultOnPointerDown = true;

        // Prevent stretching when altering window dimensions
        window.addEventListener("resize", function () { 
            engine.resize();
        });

        if (debug) {
            console.log("%c[!] Debug mode enabled, " +
                "set generateScene() flag 'debug' to false to disable at runtime", "color: orange");
            scene.debugLayer.show();
            if (showGrid) {
                Utils.drawGrid();
            }
        }
        else {
            // These are recommended, but will break debugLayer
            document.getElementsByTagName("html")[0].style.fontSize = 0;
            document.getElementsByTagName("body")[0].style.fontSize = 0;
            document.getElementsByTagName("canvas")[0].style.fontSize = 0;
        }
        
        isDebugMode = debug;
        return scene; // Return reference to it
    }

    /**
     * Creates the user interface, returns container object
     * @public
     * @static
     * @returns {object} Container object with UI properties
     */
    static generateUI() {
        var UI = {};
        UI.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        // Crosshairs
        UI.crosshair2 = new BABYLON.GUI.Ellipse();
        UI.crosshair2.height = "12px";
        UI.crosshair2.name = "Crosshairs Outline";
        UI.crosshair2.width = "12px";
        UI.crosshair2.color = "Grey";
        UI.crosshair2.thickness = 1;
        UI.advancedTexture.addControl(UI.crosshair2);
        UI.crosshair1 = new BABYLON.GUI.Ellipse();
        UI.crosshair1.height = "10px";
        UI.crosshair1.name = "Crosshairs White";
        UI.crosshair1.width = "10px";
        UI.crosshair1.color = "White";
        UI.crosshair1.thickness = 2;
        UI.advancedTexture.addControl(UI.crosshair1);
        // Instructions
        UI.text = new BABYLON.GUI.TextBlock();
        UI.text.text = "Controls:\nMove player: WASD\nMove bricks: Arrow keys" +
        "\nShow template brick: Click\nPlace brick: Enter\nChange brick: < and >" + 
        "\nChange color: ; and '\nRotate brick: /\nHide template brick: \\" +
        "\nJump: Spacebar\nDelete aimed brick: Backspace\nClear all bricks: U" +
        "\nToggle this: I";
        UI.text.fontSize = 18;
        UI.text.alpha = 0.8;
        UI.text.left = 20;
        UI.text.color = "White";
        UI.text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        UI.advancedTexture.addControl(UI.text);
        // Audio
        UI.Audio = {};
        UI.Audio.jumpSound = new BABYLON.Sound("jumpSound", "./audio/jump.wav", scene);
        UI.Audio.clickPlace = new BABYLON.Sound("clickPlace", "./audio/clickPlace.wav", scene);
        UI.Audio.clickRemove = new BABYLON.Sound("clickRenive", "./audio/clickRemove.wav", scene);

        return UI;
    }

    /**
     * Creates debugging grid, makes ground look like graph plus dimension arrows
     * @public
     * @static
     */
    static drawGrid() {
        const COLOR_RED4 = new BABYLON.Color4(1,0,0,1);
        const COLOR_GREEN4 = new BABYLON.Color4(0,1,0,1);
        const COLOR_BLUE4 = new BABYLON.Color4(0,0,1,1);
    
        const MAINLENGTH = MISCSETTINGS.FLOOR_WIDTH/2;
    
        var xLinePts = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(MAINLENGTH, 0, 0)];
        var xColors = [COLOR_RED4, COLOR_RED4];
        var xLine = BABYLON.MeshBuilder.CreateLines("xLine", {points: xLinePts, colors: xColors}, scene);
        xLine.isPickable = false;
    
        var yLinePts = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, MAINLENGTH, 0)];
        var yColors = [COLOR_GREEN4, COLOR_GREEN4];
        var yLine = BABYLON.MeshBuilder.CreateLines("yLine", {points: yLinePts, colors: yColors}, scene);
        yLine.isPickable = false;
    
        var zLinePts = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, MAINLENGTH)];
        var zColors = [COLOR_BLUE4, COLOR_BLUE4];
        var zLine = BABYLON.MeshBuilder.CreateLines("zLine", {points: zLinePts, colors: zColors}, scene);
        zLine.isPickable = false;
        
        var generalLineColor = [new BABYLON.Color4(1,1,1,1), new BABYLON.Color4(1,1,1,1)];
        // x
        for (let i = -1 * MAINLENGTH; i < MAINLENGTH + 1; i++) {
            if (i == 0) {
                let linePts = [new BABYLON.Vector3(-1 * MAINLENGTH, 0, i), new BABYLON.Vector3(0, 0, i)]
                let line = BABYLON.MeshBuilder.CreateLines("xline" + i, {points: linePts, colors: generalLineColor}, scene);
                line.isPickable = false;
            }
            else {
                let linePts = [new BABYLON.Vector3(-1 * MAINLENGTH, 0, i), new BABYLON.Vector3(MAINLENGTH, 0, i)]
                let line = BABYLON.MeshBuilder.CreateLines("xline" + i, {points: linePts, colors: generalLineColor}, scene);
                line.isPickable = false;
            }
        }
        // z
        for (let j = -1 * MAINLENGTH; j < MAINLENGTH + 1; j++) {
            if (j == 0) {
                let linePts = [new BABYLON.Vector3(j, 0, -1 * MAINLENGTH), new BABYLON.Vector3(j, 0, 0)]
                let line = BABYLON.MeshBuilder.CreateLines("xline" + j, {points: linePts, colors: generalLineColor}, scene);
                line.isPickable = false;
            }
            else {
                let linePts = [new BABYLON.Vector3(j, 0, -1 * MAINLENGTH), new BABYLON.Vector3(j, 0, MAINLENGTH)]
                let line = BABYLON.MeshBuilder.CreateLines("xline" + j, {points: linePts, colors: generalLineColor}, scene);
                line.isPickable = false;
            }
        }
    }

    /**
     * Deletes and then recreates the SPS. Allows a single drawcall for every single brick in the scene.
     * @static
     * @public
     */
    static refreshSPS() {
        try {
            SPS.dispose();
        }
        catch (error) {
            if(isDebugMode)
                console.log("SPS does not contain existing meshes, cannot dispose.");
        }
        SPS = null;
        SPS = new BABYLON.SolidParticleSystem("SPS", scene);
        //SPS._alwaysVisible = true;

        SPS.initParticles();
        if (brickList.length < 1) {
            // Don't bother building an empty mesh
            return;
        }
        for (let i = 0; i < brickList.length; i++) {
            var idShape = SPS.addShape(brickList[i]._mesh, 1);
            brickList[i].spsCloneId = idShape;
        }
        SPS.buildMesh();
        // This is called when SPS.setParticles is called. Don't do constantly!
        SPS.updateParticle = function(particle) {
            // console.log("Doing particle update");
            var brick = Brick.getByParticleId(particle.shapeId);
            if (brick === null) {
                console.log("[!] No matching Brick found for particle!");
            }
            else {
                //console.log("Linking")
                particle.brickRef = brick;
                brick.particleRef = particle;
                // Don't use the getters here, we're looking for the actual space position
                particle.position.x = brick._mesh.position.x;
                particle.position.y = brick._mesh.position.y;
                particle.position.z = brick._mesh.position.z;
                particle.scaling = new BABYLON.Vector3(
                    MISCSETTINGS.BRICKSHRINK,
                    MISCSETTINGS.BRICKSHRINK,
                    MISCSETTINGS.BRICKSHRINK
                )
                particle.rotation = brick._mesh.rotation;
                let col = brick._mesh.material.diffuseColor;
                particle.color = new BABYLON.Color4(col.r, col.g, col.b, 1.0);
            }
        }
        SPS.setParticles();
        SPS.isAlwaysVisible = true;
    }

    /**
     * POSTs to the server a JSON object consisting of all the Bricks' data
     * @public
     * @static
     */
    static saveToServer() {
        return; // Deprecate for now
        var result = [];
        for (var i = 0; i < brickList.length; i++) {
            result.push(brickList[i].export());
        }
        if (isDebugMode) {
            console.log("Saving...");
        }
        $.post("/save", { save: result });
    }

    /**
     * Sends a GET request to the server, looking for save data
     * @public
     * @static
     */
    static loadFromServer() {
        return; // Deprecate for now
        $.get("/load", function(data) {
            if (!data || data.length == 0) {
                console.log("No save data retrieved!");
                return;
            }
            Brick.deleteAllBricks();
            for (var i = 0; i < data.length; i++) {
                var brickData = data[i];
                // All data is retrieved as strings, fix
                brickData.x       = Number(brickData.x);
                brickData.y       = Number(brickData.y);
                brickData.z       = Number(brickData.z);
                brickData.widthX  = Number(brickData.widthX);
                brickData.heightY = Number(brickData.heightY);
                brickData.depthZ  = Number(brickData.depthZ);
                brickData.rot     = Number(brickData.rot);
                brickData.colorR  = Number(brickData.colorR);
                brickData.colorG  = Number(brickData.colorG);
                brickData.colorB  = Number(brickData.colorB);
                Brick.placeBrickFromData(brickData);
            }
            UI.Audio.clickPlace.play();
        });
    }
}