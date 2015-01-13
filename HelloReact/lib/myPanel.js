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

  label: "Hello React",
  tooltip: "My panel tooltip",
  icon: "./img/icon-16.png",
  url: "./myPanel.html",

  initialize: function(options) {
  },

  dispose: function() {
  },

  setup: function(options) {
  },
});

const myTool = new Tool({
  name: "MyTool",
  panels: {
    myPanel: MyPanel
  }
});
