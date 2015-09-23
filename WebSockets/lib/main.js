/* See license.txt for terms of usage */

"use strict";

// Firebug SDK
const { ToolboxChrome } = require("firebug.sdk/lib/toolbox-chrome.js");
const { Locale } = require("firebug.sdk/lib/core/locale.js");

const { WsPanel } = require("./ws-panel.js");
const { WsToolboxOverlay } = require("./ws-toolbox-overlay.js");

// Localization files. All strings in the UI should be loaded from these
// files, so the entire extension can be localized into other languages.
Locale.registerStringBundle("chrome://websocketmonitor/locale/websocket-monitor.properties");
Locale.registerStringBundle("chrome://websocketmonitor-firebug.sdk/locale/reps.properties");

/**
 * Application entry point
 */
function main(options, callbacks) {
  ToolboxChrome.initialize(options);
  ToolboxChrome.registerToolboxOverlay(WsToolboxOverlay);
}

/**
 * Called at shutdown (uninstall, disable, Firefox shutdown)
 */
function onUnload(reason) {
  ToolboxChrome.unregisterToolboxOverlay(WsToolboxOverlay);
  ToolboxChrome.shutdown(reason);
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
