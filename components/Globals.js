// Global variables
var brickList = [];
var lastId = 0;
var isDebugMode = false;

// Colors/material constants
const COLOR_RED =    new BABYLON.Color3(1.0, 0.0, 0.0);
const COLOR_ORANGE = new BABYLON.Color3(1.0, 0.5, 1.0);
const COLOR_YELLOW = new BABYLON.Color3(1.0, 1.0, 0.0);
const COLOR_GREEN =  new BABYLON.Color3(0.0, 1.0, 0.0);
const COLOR_BLUE =   new BABYLON.Color3(0.0, 0.0, 1.0);
const COLOR_PURPLE = new BABYLON.Color3(1.0, 0.0, 1.0);
const COLOR_LIST = [
    COLOR_RED,
    COLOR_ORANGE,
    COLOR_YELLOW,
    COLOR_GREEN,
    COLOR_BLUE,
    COLOR_PURPLE
]
const COLOR_DEFAULT = new BABYLON.Color3(0, 0.58, 0.86);
const COLOR_BGCLEAR = new BABYLON.Color3(0.8, 0.8, 0.8);
const EMISSDARKERBY = 3;

// Physics/movement constants
const GRAVITY = new BABYLON.Vector3(0, -9.8, 0);
const DEFAULT_SENSITIVITY = 0.005;
const DEFAULT_PLAYERHEIGHT = 5 / 2;
const DEFAULT_PLAYERWIDTH = 1;
const DEFAULT_PLAYERSPEED = 0.12;
const DEFAULT_PLAYERVELOCITY = 0.1;
const DEFAULT_PLAYERMAXVELOCITY = 1.5;
const DEFAULT_PLAYERJUMPSTRENGTH = 0.5;
const DEFAULT_INERTIA = 0.5;

// Other constants
const FLOOR_WIDTH = 100;
const MAX_BRICKS = 5000;