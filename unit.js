const BABYLON = require('babylonjs');
const assert = require('chai').assert;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Globals = require('./components/Globals.js');
const Player = require('./components/Player.js');
const Brick = require('./components/Brick.js');
const Utils = require('./components/Utils.js');
var html_gen = require('create-html')({
    title: 'Block.JS unit testing'
});
const dom = new JSDOM(html_gen);
console.log(dom);