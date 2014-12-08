/* See license.txt for terms of usage */

"use strict";

const { Cu } = require("chrome");
const { Panel } = require("dev/panel");
const { Tool } = require("dev/toolbox");
const { Class } = require("sdk/core/heritage");
const { Trace } = require("./trace.js");
const { MessagePort, MessageChannel } = require("sdk/messaging");
const { DebuggerClient } = Cu.import("resource://gre/modules/devtools/dbg-client.jsm", {});
const { defer } = require("sdk/core/promise");
const { MyActorFront } = require("./myActor.js");
const { viewFor } = require("sdk/view/core");

const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});

const MyPanel = Class({
  extends: Panel,

  label: "My Panel",
  icon: "./icon-16.png",
  tooltip: "Example extension",
  url: "./myPanel.html",

  setup: function({debuggee}) {
    Trace.sysout("myPanel.setup", arguments);

    let frame = viewFor(this);
    let parentWin = frame.ownerDocument.defaultView;

    this.toolbox = getToolbox(parentWin);
    this.debuggee = debuggee;
  },

  dispose: function() {
    this.content.close();
    delete this.content;
    delete this.debuggee;
  },

  onReady: function() {
    Trace.sysout("myPanel.onReady;", this.debuggee);

    const { port1, port2 } = new MessageChannel();
    this.content = port1;

    // Listen for messages sent from the panel content.
    this.content.onmessage = this.onContentMessage.bind(this);

    // Start up channels
    this.content.start();
    this.debuggee.start();

    // Pass channels to the panel content scope (myPanelContent.js).
    // The content scope can send messages back to the chrome or
    // directly to the debugger server.
    this.postMessage("initialize", [this.debuggee, port2]);

    // Connect to our custom actor {@MyActor}.
    this.connect();
  },

  connect: function() {
    // Get access to our custom actor {@MyActor}.
    let target = this.toolbox.target;
    target.activeTab.attachThread({}, (response, threadClient) => {
      Trace.sysout("myPanel.attach; threadClient", arguments);

      let client = threadClient.client;
      client.listTabs(response => {
        Trace.sysout("myPanel.attach; list of tabs", arguments);

        let tab = response.tabs[response.selected];
        let myActor = MyActorFront(client, tab);

        myActor.attach().then(() => {
          myActor.hello().then(response => {
            Trace.sysout("myPanel.connect; (from myActor): " +
              response.msg, response);

            // Forward the hello message to the content scope.
            this.content.postMessage(response);
          })
        });
      });
    });
  },

  onContentMessage: function(event) {
    Trace.sysout("myPanel.onMessage; (from content): " +
      event.data.content, event);
  },

  onLoad: function() {
    Trace.sysout("myPanel.onLoad;");
  }
});

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
    let browser = browserDoc.getElementById("content");
    return browser.selectedTab;
  }

  // xxxHonza: do we really want this fall-back?
  let browser = getMostRecentBrowserWindow();
  if (browser)
    return browser.gBrowser.mCurrentTab;
}

const myTool = new Tool({
  panels: { myPanel: MyPanel }
});

exports.MyPanel = MyPanel;
