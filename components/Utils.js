class Utils {
    constructor() {

    }

    static generateGround() {
        let ground = BABYLON.MeshBuilder.CreateGround("Ground", {height: FLOOR_WIDTH, width: FLOOR_WIDTH, subdivision: FLOOR_WIDTH / 2}, scene);
        ground.checkCollisions = true;
        ground.position = new BABYLON.Vector3(0, 0, 0);
        ground.isPickable = true;
        return ground; // Return reference to it
    }

    static generateScene() {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = BGCLEARCOLOR;
        scene.gravity = GRAVITY;
        scene.collisionsEnabled = false;
        return scene;
    }
}