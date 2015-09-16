/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

const options = require("@loader/options");

const { Cu, Ci } = require("chrome");
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Class } = require("sdk/core/heritage");
const { ToolboxOverlay } = require("firebug.sdk/lib/toolbox-overlay.js");

/**
 * @overlay
 */
const WsToolboxOverlay = Class(
/** @lends WsToolboxOverlay */
{
  extends: ToolboxOverlay,

  overlayId: "WsToolboxOverlay",

  // Initialization

  initialize: function(options) {
    ToolboxOverlay.prototype.initialize.apply(this, arguments);

    Trace.sysout("WsToolboxOverlay.initialize;", options);
  },

  destroy: function() {
    ToolboxOverlay.prototype.destroy.apply(this, arguments);

    Trace.sysout("WsToolboxOverlay.destroy;", arguments);
  },

  // Events

  onReady: function(options) {
    ToolboxOverlay.prototype.onReady.apply(this, arguments);

    Trace.sysout("WsToolboxOverlay.onReady;", options);
  },
});

// Exports from this module
exports.WsToolboxOverlay = WsToolboxOverlay;
