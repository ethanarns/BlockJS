const BABYLON = require('babylonjs');
const assert = require('chai').assert;
const fs = require('fs');

const MISCSETTINGS = require('./components/Globals.js').MISCSETTINGS;
const Player = require('./components/Player.js');
const Brick = require('./components/Brick.js');
const Utils = require('./components/Utils').Utils;

const jsdom = require('jsdom');
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
const canvas = dom.window.document.querySelector('#render-canvas');

//var engine = new BABYLON.Engine(canvas);
//var scene = Utils.generateScene(engine, true);