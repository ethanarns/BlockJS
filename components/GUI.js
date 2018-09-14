var advancedTexture;
var guiCircle;
function createGui() {
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);
    guiCircle = new BABYLON.GUI.Ellipse();
    guiCircle.height = "10px";
    guiCircle.width = "10px";
    guiCircle.color = "White";
    guiCircle.thickness = 2;
    advancedTexture.addControl(guiCircle);
}