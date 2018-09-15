/**
 * Utility class, provides handy helper methods
 * @author Ethan Arns <contact@ethanarns.com>
 * @hideconstructor
 */
class Utils {
    /**
     * Create the world space, returns container object
     * @returns {object} Zero vector, with world properties
     * @public
     * @static
     */
    static generateWorld() {
        var world = new BABYLON.Vector3(0, 0, 0);
        var ground = BABYLON.MeshBuilder.CreateGround("Ground", {height: FLOOR_WIDTH, width: FLOOR_WIDTH, subdivision: FLOOR_WIDTH / 2}, scene);
            ground.checkCollisions = true;
            ground.position = new BABYLON.Vector3(0, 0, 0);
            ground.isPickable = true;
        world.ground = ground;
        world.mainLight = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);
        return world; // Return reference to it
    }

    /**
     * Creates and then returns the engine to run the game
     * @param {BABYLON.Engine} engine Engine to run the game
     * @public
     * @static
     */
    static generateScene(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = COLOR_BGCLEAR;
        scene.gravity = GRAVITY;
        scene.collisionsEnabled = false;
        scene.preventDefaultOnPointerDown = true;
        return scene; // Return reference to it
    }

    /**
     * Creates the user interface and audio, returns container object
     * @public
     * @static
     * @returns {BABYLON.GUI.AdvancedDynamicTexture} Base texture object
     */
    static generateUI() {
        var UI = {};
        UI.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        // Crosshair
        UI.crosshair = new BABYLON.GUI.Ellipse();
        UI.crosshair.height = "10px";
        UI.crosshair.name = "Crosshairs";
        UI.crosshair.width = "10px";
        UI.crosshair.color = "White";
        UI.crosshair.thickness = 2;
        UI.advancedTexture.addControl(UI.crosshair);
        // Sound
        UI.Audio = {};
        UI.Audio.jumpSound = new BABYLON.Sound("gunshot", "./audio/jump.wav", scene);

        return UI;
    }

    /**
     * Helper utility for transforming a local Node's position to global coordinates
     * @param {BABYLON.Vector3} vector Local vector to transform
     * @param {BABYLON.Mesh} mesh Mesh to use as base for transformation
     * @returns {BABYLON.Vector3} Transformed vector
     * @public
     * @static
     */
    static vecToLocal(vector, mesh){
        var m = mesh.getWorldMatrix();
        var v = BABYLON.Vector3.TransformCoordinates(vector, m);
		return v;		 
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
    
        const MAINLENGTH = FLOOR_WIDTH/2;
    
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
}