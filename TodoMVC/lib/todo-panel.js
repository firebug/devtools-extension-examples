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
const { loadSheet, removeSheet } = require("sdk/stylesheet/utils");

// Firebug.SDK
const { Rdp } = require("firebug.sdk/lib/core/rdp.js");
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Content } = require("firebug.sdk/lib/core/content.js");
const { ToolboxChrome } = require("firebug.sdk/lib/toolbox-chrome.js");
const { devtools, gDevTools } = require("firebug.sdk/lib/core/devtools.js");

// WebSocket Monitor
const { TodoActorFront } = require("./todo-actor.js");

// Platform
const { Services } = Cu.import("resource://gre/modules/Services.jsm", {});

// Constants
const actorModuleUrl = options.prefixURI + "lib/todo-actor.js";

/**
 * This object represents a new {@Toolbox} panel. This object is
 * running within the chrome scope and ensures basic Toolbox
 * panel aspects such as a tab in the Toolbox tab-bar, etc.
 *
 * The content of the panel is rendered using an iframe that
 * overlaps the entire space. The iframe is called a 'view' and
 * its content is running in content scope (no chrome privileges).
 * HTML in the view is generated using React+Redux libraries.
 *
 * Communication between the panel and view is done through
 * asynchronous messaging.
 */
const TodoPanel = Class(
/** @lends TodoPanel */
{
  extends: Panel,

  label: Locale.$STR("todomvc.panel.title"),
  tooltip: Locale.$STR("todomvc.panel.tooltip"),
  icon: "./icon-16.png",
  url: "./view.html",

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
    this.detach();
  },

 /**
  * Executed by the framework when the panel content iframe is
  * constructed. Allows e.g to connect the backend through
  * `debuggee` object
  */
  setup: function(options) {
    console.log("TodoPanel.setup;", options);

    this.debuggee = options.debuggee;
    this.panelFrame = viewFor(this);
    this.toolbox = getToolbox(this.panelFrame.contentWindow);

    ToolboxChrome.on("theme-changed", this.onThemeChanged);

    this.attach();
  },

  onReady: function() {
    console.log("TodoPanel.onReady;");

    // Load content script and register message handler.
    let { messageManager } = this.panelFrame.frameLoader;
    if (messageManager) {
      let url = self.data.url("frame-script.js");
      messageManager.loadFrameScript(url, false);
      messageManager.addMessageListener("message", this.onContentMessage);
    }
  },

  onThemeChanged: function(newTheme, oldTheme) {
    this.postContentMessage("theme-changed", {
      newTheme: newTheme,
      oldTheme: oldTheme,
    });
  },

  // Events from the View (myView.html)

  onContentReady: function(args) {
    console.log("TodoPanel.onContentReady()", args);

    let win = this.panelFrame.contentWindow;
    let theme = {
      getDefinition: function(themeId) {
        let view = Content.getContentView(win);
        let def = gDevTools.getThemeDefinition(themeId);
        return view.JSON.parse(JSON.stringify(def));
      },
      loadSheet: function(url) {
        loadSheet(win, url, "author");
      },
      removeSheet: function(win, url) {
        removeSheet(win, url, "author");
      },
      getCurrentTheme: function() {
        return Services.prefs.getCharPref("devtools.theme");
      }
    }

    Content.exportIntoContentScope(win, Locale, "Locale");
    Content.exportIntoContentScope(win, theme, "Theme");

    this.postContentMessage("initialize", {
      currentTheme: Services.prefs.getCharPref("devtools.theme")
    });
  },

  /**
   * Handle messages coming from the view (TodoPanel.html)
   */
  onContentMessage: function(msg) {
    console.log("TodoPanel.onContentMessage;", msg);

    let event = msg.data;
    switch (event.type) {
      case "ready":
      this.onContentReady(event.args);
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
    });
  },

  // Backend

  attach: function() {
    if (this.front) {
      return resolve(this.front);
    }

    // Inspector actor registration options.
    let config = {
      prefix: TodoActorFront.prototype.typeName,
      actorClass: "TodoActor",
      frontClass: TodoActorFront,
      moduleUrl: actorModuleUrl
    };

    let deferred = defer();
    let client = this.toolbox.target.client;

    // Register as tab actor.
    Rdp.registerTabActor(client, config).then(({registrar, front}) => {
      console.log("TodoPanel.attach; Done", front);

      this.front = front;

      // xxxHonza: unregister actor on shutdown/disable/uninstall
      // but not on toolbox close.
      this.registrar = registrar;
    }, response => {
      console.log("TodoPanel.attach; ERROR " + response, response);
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
      console.log("TodoPanel.detach; Done", response);

      deferred.resolve(response);
    });

    this.front = null;

    return deferred.promise;
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
    TodoPanel: TodoPanel
  }
});
