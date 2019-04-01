'use strict';

const { randomBytes } = require('crypto');
const fs = require('fs');

// loadJSON(file) reads and parses a json file
function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// random32base64() returns a url safe random string
function random32base64() {
  return randomBytes(32).toString('base64').replace(/\+|\/|\=/gi, '')
}

// defaultFor(arg, val) is to be used as a way to set a default 
// value at the beginning of a function
function defaultFor(arg, val) {
  return typeof arg !== 'undefined' ? arg : val;
}

exports.loadJSON = loadJSON;
exports.random32base64 = random32base64;
exports.defaultFor = defaultFor;
