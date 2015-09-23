/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
const options = require("@loader/options");
const { Cu, Ci } = require("chrome");
const { Class } = require("sdk/core/heritage");

// Firebug SDK
const { ToolboxOverlay } = require("firebug.sdk/lib/toolbox-overlay.js");

/**
 * @overlay
 */
const WsmToolboxOverlay = Class(
/** @lends WsmToolboxOverlay */
{
  extends: ToolboxOverlay,

  overlayId: "WsmToolboxOverlay",

  // Initialization

  initialize: function(options) {
    ToolboxOverlay.prototype.initialize.apply(this, arguments);
  },

  destroy: function() {
    ToolboxOverlay.prototype.destroy.apply(this, arguments);
  },

  // Events

  onReady: function(options) {
    ToolboxOverlay.prototype.onReady.apply(this, arguments);
  },
});

// Exports from this module
exports.WsmToolboxOverlay = WsmToolboxOverlay;
