var gridDrawn = false;
function drawGrid() {
    if (gridDrawn) {
        console.log("Debug grid already rendered.");
        return;
    }
    console.log("Drawing grid...");
    // Main 3 colored lines
    const MAINLENGTH = FLOOR_WIDTH/2;

    var xLinePts = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(MAINLENGTH, 0, 0)];
    var xColors = [COLORRED4, COLORRED4];
    var xLine = BABYLON.MeshBuilder.CreateLines("xLine", {points: xLinePts, colors: xColors}, scene);
    xLine.isPickable = false;

    var yLinePts = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, MAINLENGTH, 0)];
    var yColors = [COLORGREEN4, COLORGREEN4];
    var yLine = BABYLON.MeshBuilder.CreateLines("yLine", {points: yLinePts, colors: yColors}, scene);
    yLine.isPickable = false;

    var zLinePts = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, MAINLENGTH)];
    var zColors = [COLORBLUE4, COLORBLUE4];
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
    gridDrawn = true;
}