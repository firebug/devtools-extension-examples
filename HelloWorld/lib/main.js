/* See license.txt for terms of usage */

"use strict";

const { MyExtension } = require("./myExtension.js");
const { MyPanel } = require("./myPanel.js");

/**
 * Application entry point. Read MDN to learn more about Add-on SDK:
 * https://developer.mozilla.org/en-US/Add-ons/SDK
 */
function main(options, callbacks) {
  // Initialize extension object (singleton).
  MyExtension.initialize(options);
}

function onUnload(reason) {
  MyExtension.shutdown(reason);
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
