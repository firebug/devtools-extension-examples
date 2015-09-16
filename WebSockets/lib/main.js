/* See license.txt for terms of usage */

"use strict";

const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { ToolboxChrome } = require("firebug.sdk/lib/toolbox-chrome.js");

const { WsPanel } = require("./ws-panel.js");
const { WsToolboxOverlay } = require("./ws-toolbox-overlay.js");

/**
 * Application entry point
 */
function main(options, callbacks) {
  Trace.sysout("main;", options);

  ToolboxChrome.initialize(options);
  ToolboxChrome.registerToolboxOverlay(WsToolboxOverlay);
}

/**
 * Called at shutdown (uninstall, disable, Firefox shutdown)
 */
function onUnload(reason) {
  Trace.sysout("onUnload; " + reason);

  ToolboxChrome.unregisterToolboxOverlay(WsToolboxOverlay);
  ToolboxChrome.shutdown(reason);
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
