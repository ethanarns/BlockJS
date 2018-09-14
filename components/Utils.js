var lastId;
//var jumpSound;
class Utils {
    static generateGround() {
        let ground = BABYLON.MeshBuilder.CreateGround("Ground", {height: FLOOR_WIDTH, width: FLOOR_WIDTH, subdivision: FLOOR_WIDTH / 2}, scene);
        ground.checkCollisions = true;
        ground.position = new BABYLON.Vector3(0, 0, 0);
        ground.isPickable = true;
        return ground; // Return reference to it
    }

    static generateScene(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = COLOR_BGCLEAR;
        scene.gravity = GRAVITY;
        scene.collisionsEnabled = false;
        lastId = 0;
        return scene; // Return reference to it
    }

    static vecToLocal(vector, mesh){
        var m = mesh.getWorldMatrix();
        var v = BABYLON.Vector3.TransformCoordinates(vector, m);
		return v;		 
    }
}