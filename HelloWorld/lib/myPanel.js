/* See license.txt for terms of usage */

"use strict";

const self = require("sdk/self");

const { Cu, Ci } = require("chrome");
const { Panel } = require("dev/panel.js");
const { Class } = require("sdk/core/heritage");
const { Tool } = require("dev/toolbox");

/**
 * This object represents a new {@Toolbox} panel
 */
const MyPanel = Class(
/** @lends MyPanel */
{
  extends: Panel,

  label: "My Panel",
  tooltip: "My panel tooltip",
  icon: "./icon-16.png",
  url: "./myPanel.html",

  /**
   * Executed by the framework when an instance of this panel is created.
   * There is one instance of this panel per {@Toolbox}. The panel is
   * instantiated when selected in the toolbox for the first time.
   */
  initialize: function(options) {
  },

  /**
   * Executed by the framework when the panel is destroyed.
   */
  dispose: function() {
  },

 /**
  * Executed by the framework when the panel content iframe is
  * constructed. Allows e.g to connect the backend through
  * `debuggee` object
  */
  setup: function(options) {
    // TODO: connect to backend using options.debuggee
  },
});

const myTool = new Tool({
  name: "MyTool",
  panels: {
    myPanel: MyPanel
  }
});
