/*const BABYLON = require('babylonjs');
// Import globals for testing
const MISCSETTINGS = require('./Globals').MISCSETTINGS;
const PLAYERDEFAULTS = require('./Globals').PLAYERDEFAULTS;
const COLORS = require('./Globals').COLORS;
var brickList = require('./Globals').brickList;
var lastId = require('./Globals').lastId;
var isDebugMode = require('./Globals').isDebugMode;
var Brick = require('./Brick');
var Player = require('./Player');*/

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
            subdivision: MISCSETTINGS.FLOOR_WIDTH / 2
        }, scene);
        ground.checkCollisions = true;
        ground.position = new BABYLON.Vector3(0, 0, 0);
        ground.isPickable = true;
        world.ground = ground;
        world.lights = {};
        world.lights.mainLight = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);
        world.lights.hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        world.scene = scene; // Might look good in references
        SPS = new BABYLON.SolidParticleSystem("SPS", scene);
        return world; // Return reference to it
    }

    /**
     * Creates and then returns the engine to run the game
     * @param {BABYLON.Engine} engine Engine to run the game
     * @param {boolean} debug Should the game start in debug mode?
     * @public
     * @static
     */
    static generateScene(engine, debug = true) {
        var scene = new BABYLON.Scene(engine);
            scene.clearColor = COLORS.BGCLEAR;
            scene.gravity = MISCSETTINGS.GRAVITY;
            scene.collisionsEnabled = false;
            scene.preventDefaultOnPointerDown = true;
        if (debug) {
            console.log("%c[!] Debug mode enabled, set generateScene() flag 'debug' to false to disable at runtime", "color: orange");
            scene.debugLayer.show();
            //Utils.drawGrid();
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
        // Graphics
        UI.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        UI.crosshair = new BABYLON.GUI.Ellipse();
        UI.crosshair.height = "10px";
        UI.crosshair.name = "Crosshairs";
        UI.crosshair.width = "10px";
        UI.crosshair.color = "White";
        UI.crosshair.thickness = 2;
        UI.advancedTexture.addControl(UI.crosshair);
        // Audio
        UI.Audio = {};
        UI.Audio.jumpSound = new BABYLON.Sound("gunshot", "./audio/jump.wav", scene);

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
                particle.position.x = brick.getPosition().x;
                particle.position.y = brick.getPosition().y;
                particle.position.z = brick.getPosition().z;
                particle.scaling = new BABYLON.Vector3(
                    MISCSETTINGS.BRICKSHRINK,
                    MISCSETTINGS.BRICKSHRINK,
                    MISCSETTINGS.BRICKSHRINK
                )
                let col = brick._mesh.material.diffuseColor;
                particle.color = new BABYLON.Color4(col.r, col.g, col.b, 1.0);
            }
        }
        SPS.setParticles();
        SPS.isAlwaysVisible = true;
    }
}

// See if running under node to avoid exception
module.exports = Utils;
