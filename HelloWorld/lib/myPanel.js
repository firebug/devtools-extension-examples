/* See license.txt for terms of usage */

"use strict";

const self = require("sdk/self");

const { Cu, Ci } = require("chrome");
const { Panel } = require("dev/panel.js");
const { Class } = require("sdk/core/heritage");
const { Tool } = require("dev/toolbox");

/**
 * 
 */
const MyPanel = Class(
/** @lends BasePanel */
{
  extends: Panel,

  label: "My Panel",
  tooltip: "My panel tooltip",
  icon: "./icon-16.png",
  url: "./myPanel.html",

  /**
   * 
   */
  initialize: function(options) {
  },

  /**
   * Executed by SDK framework for custom panels (not for overlays).
   */
  dispose: function() {

  },

 /**
  * 
  */
  setup: function(options) {

  },
});

const myTool = new Tool({
  name: "MyTool",
  panels: {
    myPanel: MyPanel
  }
});
