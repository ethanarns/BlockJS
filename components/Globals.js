// Global variables
var brickList = [];
var lastId = 0;
var isDebugMode = false;
var SPS;
var currentColor; // From gui/tools
var currentColorIndex = 0;
var currentRotation = 0; // From gui/tools
var currentBrick; // From gui/tools
var currentBrickIndex = 0;
var pulse = 0;
var saveLoop;

// Colors/material constants
const COLORS = {
    RED:     new BABYLON.Color3(1.0, 0.0, 0.0),
    ORANGE:  new BABYLON.Color3(1.0, 0.5, 0.0),
    YELLOW:  new BABYLON.Color3(1.0, 1.0, 0.0),
    GREEN:   new BABYLON.Color3(0.0, 1.0, 0.0),
    BLUE:    new BABYLON.Color3(0.0, 0.0, 1.0),
    PURPLE:  new BABYLON.Color3(1.0, 0.0, 1.0),
    DEFAULT: new BABYLON.Color3(0, 0.58, 0.86)
}
currentColor = COLORS.DEFAULT;

const BRICKS = {
    b1x1: new BABYLON.Vector3(1, 1, 1),
    b2x1: new BABYLON.Vector3(2, 1, 1),
    b3x1: new BABYLON.Vector3(3, 1, 1),
    b4x1: new BABYLON.Vector3(4, 1, 2),
    b6x1: new BABYLON.Vector3(6, 1, 1),
    b2x2: new BABYLON.Vector3(2, 1, 2),
    b2x3: new BABYLON.Vector3(2, 1, 3),
    b2x4: new BABYLON.Vector3(2, 1, 4),
    b2x6: new BABYLON.Vector3(2, 1, 6)
}
currentBrick = BRICKS.b1x1;

const PLAYERDEFAULTS = {
    SENSITIVITY: 0.005,
    HEIGHT: 2.4,
    WIDTH: 0.9,
    SPEED: 0.12,
    VELOCITY: 0.1,
    MAXVELOCITY: 1.5,
    JUMPSTRENGTH: 0.5
}

const MISCSETTINGS = {
    FLOOR_WIDTH: 1000,
    MAX_BRICKS: 5000,
    GRAVITY: new BABYLON.Vector3(0, -9.8, 0),
    BRICKSHRINK: 0.999,
    EMISSDARKERBY: 3
}
