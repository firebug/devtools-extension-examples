/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const { Cu, Ci } = require("chrome");

// DevTools
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});

// DOM Inspector
const { MyToolboxOverlay } = require("./my-toolbox-overlay");

/**
 * Initialization
 */
function main(options, callbacks) {
  gDevTools.on("toolbox-ready", onToolboxReady);
  gDevTools.on("toolbox-destroy", onToolboxDestroy);
}

function onUnload(reason) {
  gDevTools.off("toolbox-ready", onToolboxReady);
  gDevTools.off("toolbox-destroy", onToolboxDestroy);
}

/**
 * Toolbox Overlay
 */
var overlays = new Map();

function onToolboxReady(eventId, toolbox) {
  let overlay = new MyToolboxOverlay(toolbox);
  overlays.set(toolbox.target, overlay);
}

function onToolboxDestroy(eventId, target) {
  let overlay = overlays.get(target);
  overlay.destroy();
  overlays.delete(target);
}

exports.main = main;
exports.onUnload = onUnload;
