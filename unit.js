// TODO: Find out why BabylonJS is not accepting any Node-generated canvases

const BABYLON = require('babylonjs');
const assert = require('chai').assert;
const fs = require('fs');

const MISCSETTINGS = require('./components/Globals.js').MISCSETTINGS;
const Player = require('./components/Player.js');
const Brick = require('./components/Brick.js');
const Utils = require('./components/Utils');

// In order for node-canvas to work, must install outside dependencies:
// brew install pkg-config cairo pango libpng jpeg giflib
var Canvas = require('canvas');
var canvas = new Canvas(150, 150)

/*const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = require('create-html')({
    title: 'Block.JS unit testing',
    body: '<script src="./babylon.custom.js"></script>\n' +
    '<script src="./components/Globals.js"></script>\n' +
    '<script src="./components/Player.js"></script>\n' +
    '<script src="./components/Brick.js"></script>\n' +
    '<script src="./components/Utils.js"></script>\n' +
    '<canvas id="render-canvas"></canvas>',
    head: '<style> html, body, canvas {margin: 0; padding: 0; width: 100%; height: 100%; } </style>'
})
const dom = new JSDOM();
var canvasNode = dom.window.document.createElement("canvas");
canvasNode.id = "render-canvas";
var body = dom.window.document.querySelector('body');
body.appendChild(canvasNode);
const canvas = dom.window.document.querySelector('#render-canvas');*/

var engine = new BABYLON.Engine(canvas); // Not accepting either JSDom or Node-Canvas. Why??
//var scene = Utils.generateScene(engine, true);