/* See license.txt for terms of usage */

"use strict";

const { Cu, Ci } = require("chrome");
const { MyPanel } = require("./myPanel.js");

function main(options, callbacks) {
  console.log("main.js;", options);
}

function onUnload(reason) {
  console.log("main.onUnload; " + reason);
}

exports.main = main;
exports.onUnload = onUnload;
