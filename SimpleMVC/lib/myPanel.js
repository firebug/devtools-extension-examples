/* See license.txt for terms of usage */

"use strict";

const self = require("sdk/self");

// Add-On SDK
const { Cu, Ci } = require("chrome");
const { Panel } = require("dev/panel.js");
const { Class } = require("sdk/core/heritage");
const { Tool } = require("dev/toolbox");
const { viewFor } = require("sdk/view/core");

// SimpleMVC
const { MyExtension } = require("./myExtension.js");

/**
 * This object represents a new {@Toolbox} panel. It also serves
 * as a Controller (the C in MVC pattern). I handles events sent
 * by View (myView.js). See e.g. onFormatTime() method.
 */
const MyPanel = Class(
/** @lends MyPanel */
{
  extends: Panel,

  label: "My Panel",
  tooltip: "My panel tooltip",
  icon: "./icon-16.png",
  url: "./myView.html",

  /**
   * Executed by the framework when an instance of this panel is created.
   * There is one instance of this panel per {@Toolbox}. The panel is
   * instantiated when selected in the toolbox for the first time.
   */
  initialize: function(options) {
    this.onContentMessage = this.onContentMessage.bind(this);
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
    console.log("MyPanel.setup;", options);

    this.debuggee = options.debuggee;
    this.panelFrame = viewFor(this);

    // TODO: connect to backend using options.debuggee
  },

  /**
   * Executed by the framework when the panel is fully ready.
   */
  onReady: function() {
    console.log("MyPanel.onReady;");

    // Load content script and register message handler.
    let { messageManager } = this.panelFrame.frameLoader;
    if (messageManager) {
      let url = self.data.url("frameScript.js");
      messageManager.loadFrameScript(url, false);
      messageManager.addMessageListener("message", this.onContentMessage);
    }
  },

  /**
   * Handle messages coming from the view (myPanel.html)
   */
  onContentMessage: function(msg) {
    console.log("MyPanel.onContentMessage;", msg);

    let event = msg.data;
    switch (event.type) {
      case "format-time":
      this.onFormatTime(event.args);
      break
    }
  },

  /**
   * Send message to the content scope (panel's iframe)
   */
  postContentMessage: function(id, data) {
    let { messageManager } = this.panelFrame.frameLoader;
    messageManager.sendAsyncMessage("my-extension/message", {
      type: id,
      bubbles: false,
      cancelable: false,
      data: data,
      origin: this.url,
    });
  },

  // Events from the View (myView.html)

  onFormatTime: function(args) {
    console.log("myPanel.onFormatTime()", args);

    // Use model API to nicely format the time and return
    // the result back the view to update the UI.
    let time = args.time;
    let result = MyExtension.formatTime(time);

    this.postContentMessage("update-view", result);
  }
});

// Panel registration
const myTool = new Tool({
  name: "MyTool",
  panels: {
    myPanel: MyPanel
  }
});
