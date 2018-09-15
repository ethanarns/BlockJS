// Create crosshair
var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
var guiCircle = new BABYLON.GUI.Ellipse();
    guiCircle.height = "10px";
    guiCircle.width = "10px";
    guiCircle.color = "White";
    guiCircle.thickness = 2;
advancedTexture.addControl(guiCircle);