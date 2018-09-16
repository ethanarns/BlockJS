//const BABYLON = require('babylonjs');

// Global variables
var brickList = [];
var lastId = 0;
var isDebugMode = false;
var SPS;

// Colors/material constants
const COLORS = {
    RED:     new BABYLON.Color3(1.0, 0.0, 0.0),
    ORANGE:  new BABYLON.Color3(1.0, 0.5, 1.0),
    YELLOW:  new BABYLON.Color3(1.0, 1.0, 0.0),
    GREEN:   new BABYLON.Color3(0.0, 1.0, 0.0),
    BLUE:    new BABYLON.Color3(0.0, 0.0, 1.0),
    PURPLE:  new BABYLON.Color3(1.0, 0.0, 1.0),
    DEFAULT: new BABYLON.Color3(0, 0.58, 0.86),
    BGCLEAR: new BABYLON.Color3(0.8, 0.8, 0.8),
    EMISSDARKERBY: 3
}

const PLAYERDEFAULTS = {
    SENSITIVITY: 0.005,
    HEIGHT: 5 / 2,
    WIDTH: 1,
    SPEED: 0.12,
    VELOCITY: 0.1,
    MAXVELOCITY: 1.5,
    JUMPSTRENGTH: 0.5
}

const MISCSETTINGS = {
    FLOOR_WIDTH: 100,
    MAX_BRICKS: 5000,
    GRAVITY: new BABYLON.Vector3(0, -9.8, 0)
}

module.exports = {
    MISCSETTINGS,
    PLAYERDEFAULTS,
    COLORS,
    brickList,
    lastId,
    isDebugMode
}
