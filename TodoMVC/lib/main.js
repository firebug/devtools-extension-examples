/* See license.txt for terms of usage */

"use strict";

// Firebug SDK
const { ToolboxChrome } = require("firebug.sdk/lib/toolbox-chrome.js");
const { Locale } = require("firebug.sdk/lib/core/locale.js");

// Localization files. All strings in the UI should be loaded from these
// files, so the entire extension can be localized into other languages.
Locale.registerStringBundle("chrome://todomvc/locale/todomvc.properties");
Locale.registerStringBundle("chrome://todomvc-firebug.sdk/locale/reps.properties");

// WebSocket Monitor
const { TodoPanel } = require("./todo-panel.js");
const { TodoToolboxOverlay } = require("./todo-toolbox-overlay.js");

/**
 * Application entry point
 */
function main(options, callbacks) {
  ToolboxChrome.initialize(options);
  ToolboxChrome.registerToolboxOverlay(TodoToolboxOverlay);
}

/**
 * Called at shutdown (uninstall, disable, Firefox shutdown)
 */
function onUnload(reason) {
  ToolboxChrome.unregisterToolboxOverlay(TodoToolboxOverlay);
  ToolboxChrome.shutdown(reason);
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
