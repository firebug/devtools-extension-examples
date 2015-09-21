/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const self = require("sdk/self");
const options = require("@loader/options");
const { Cu, Ci } = require("chrome");
const { Panel } = require("dev/panel.js");
const { Class } = require("sdk/core/heritage");
const { Tool } = require("dev/toolbox");
const { viewFor } = require("sdk/view/core");
const { defer, resolve, all } = require("sdk/core/promise");
const Events = require("sdk/dom/events");

// Firebug.SDK
const { Rdp } = require("firebug.sdk/lib/core/rdp.js");
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Content } = require("firebug.sdk/lib/core/content.js");

// WebSockets Monitor
const { WsActorFront } = require("./ws-actor.js");

// DevTools
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});

// Constants
const actorModuleUrl = options.prefixURI + "lib/ws-actor.js";

/**
 * This object represents a new {@Toolbox} panel
 */
const WsPanel = Class(
/** @lends WsPanel */
{
  extends: Panel,

  label: "Web Sockets",
  tooltip: "My panel tooltip",
  icon: "./icon-16.png",
  url: "./ws-view.html",

  /**
   * Executed by the framework when an instance of this panel is created.
   * There is one instance of this panel per {@Toolbox}. The panel is
   * instantiated when selected in the toolbox for the first time.
   */
  initialize: function(options) {
    this.onContentMessage = this.onContentMessage.bind(this);

    // nsIWebSocketFrameService events
    this.onFrameReceived = this.onFrameReceived.bind(this);
    this.onFrameSent = this.onFrameSent.bind(this);
  },

  /**
   * Executed by the framework when the panel is destroyed.
   */
  dispose: function() {
    this.detach();
  },

 /**
  * Executed by the framework when the panel content iframe is
  * constructed. Allows e.g to connect the backend through
  * `debuggee` object
  */
  setup: function(options) {
    console.log("WsPanel.setup;", options);

    this.debuggee = options.debuggee;
    this.panelFrame = viewFor(this);
    this.toolbox = getToolbox(this.panelFrame.ownerDocument.defaultView);

    this.attach();
  },

  onReady: function() {
    console.log("WsPanel.onReady;");

    // Load content script and register message handler.
    let { messageManager } = this.panelFrame.frameLoader;
    if (messageManager) {
      let url = self.data.url("frame-script.js");
      messageManager.loadFrameScript(url, false);
      messageManager.addMessageListener("message", this.onContentMessage);
    }
  },

  /**
   * Handle messages coming from the view (WsPanel.html)
   */
  onContentMessage: function(msg) {
    console.log("WsPanel.onContentMessage;", msg);

    let event = msg.data;
    switch (event.type) {
      case "get-connections":
      this.onGetConnections(event.args);
      break
    }
  },

  /**
   * Send message to the content scope (panel's iframe)
   */
  postContentMessage: function(id, data) {
    let { messageManager } = this.panelFrame.frameLoader;
    messageManager.sendAsyncMessage("ws-monitor/message", {
      type: id,
      bubbles: false,
      cancelable: false,
      data: data,
      origin: this.url,
    });
  },

  // Events from the View (myView.html)

  onGetConnections: function(args) {
    console.log("WsPanel.onGetConnections()", args);

    // Use model API to nicely format the time and return
    // the result back the view to update the UI.
    let connections = args;

    this.front.getConnections().then(response => {
      console.log("get connections response", response);
      this.postContentMessage("update-view", JSON.stringify(response));
    });
  },

  // Backend

  attach: function() {
    if (this.front) {
      return resolve(this.front);
    }

    // Inspector actor registration options.
    let config = {
      prefix: WsActorFront.prototype.typeName,
      actorClass: "WsActor",
      frontClass: WsActorFront,
      moduleUrl: actorModuleUrl
    };

    let deferred = defer();
    let client = this.toolbox.target.client;

    // Register as tab actor.
    Rdp.registerTabActor(client, config).then(({registrar, front}) => {
      console.log("WsToolboxPanel.attach; Done", front);

      this.front = front;

      // Drag-drop listener (events sent from the backend)
      this.front.on("frameReceived", this.onFrameReceived);
      this.front.on("frameSent", this.onFrameSent);

      // xxxHonza: unregister actor on shutdown/disable/uninstall
      // but not on toolbox close.
      this.registrar = registrar;
    }, response => {
      console.log("WsToolboxPanel.attach; ERROR " + response, response);
    });

    return deferred.promise;
  },

  detach: function() {
    if (!this.front) {
      return resolve();
    }

    let front = this.front;
    let deferred = defer();
    front.detach().then(response => {
      console.log("WsToolboxOverlay.detach; Done", response);

      front.off("frameReceived", this.onFrameReceived);
      front.off("frameSent", this.onFrameSent);

      deferred.resolve(response);
    });

    this.front = null;

    return deferred.promise;
  },

  // nsIWebSocketFrameService events

  onFrameReceived: function(data) {
    this.postContentMessage("frameReceived", JSON.stringify(data));
  },

  onFrameSent: function(data) {
    this.postContentMessage("frameSent", JSON.stringify(data));
  },
});

// Helpers

function getToolbox(win) {
  let tab = getCurrentTab(win);
  if (tab) {
    let target = devtools.TargetFactory.forTab(tab);
    return gDevTools.getToolbox(target);
  }
}

function getCurrentTab(win) {
  if (win) {
    let browserDoc = win.top.document;

    // The browser (id='content') is null in case the Toolbox is
    // detached from the main browser window.
    let browser = browserDoc.getElementById("content");
    if (browser) {
      return browser.selectedTab;
    }
  }

  let browser = getMostRecentBrowserWindow();
  if (browser) {
    return browser.gBrowser.mCurrentTab;
  }
}

// Registration
const myTool = new Tool({
  name: "MyTool",
  panels: {
    WsPanel: WsPanel
  }
});
