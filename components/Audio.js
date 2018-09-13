var jumpSound;
function enableAudio(scene) {
    jumpSound = new BABYLON.Sound("gunshot", "./audio/jump.wav", scene);
}