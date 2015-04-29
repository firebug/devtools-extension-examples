/* See license.txt for terms of usage */

"use strict";

var self = require("sdk/self");

const { Cu } = require("chrome");
const { Panel } = require("dev/panel");
const { Tool } = require("dev/toolbox");
const { Class } = require("sdk/core/heritage");
const { MyActorFront } = require("./myActor.js");
const { viewFor } = require("sdk/view/core");
const { MessagePort, MessageChannel } = require("sdk/messaging");

const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});

const { Services } = Cu.import("resource://gre/modules/Services.jsm", {});
const { ActorRegistryFront } = devtools["require"]("devtools/server/actors/actor-registry");

const MyPanel = Class({
  extends: Panel,

  label: "My Panel",
  icon: "./icon-16.png",
  tooltip: "My Custom Panel",
  url: "./myPanel.html",

  setup: function({debuggee}) {
    let frame = viewFor(this);
    let parentWin = frame.ownerDocument.defaultView;

    this.toolbox = getToolbox(parentWin);
    this.debuggee = debuggee;
  },

  dispose: function() {
    if (this.myActorClass) {
      this.myActorClass.unregister();
    }
    this.debuggee = null;
  },

  onReady: function() {
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

    this.connect();
  },

  onContentMessage: function(event) {
    console.log("onContentMessage: " + event.data.content);
  },

  /**
   * Connect to our custom {@MyActor} actor.
   */
  connect: function() {
    let target = this.toolbox.target;
    target.client.listTabs((response) => {

      // The actor might be already registered on the backend.
      let currTab = response.tabs[response.selected];
      if (currTab[MyActorFront.prototype.typeName]) {
        console.log("actor already registered, so use it", currTab);

        this.attachActor(target, currTab);
        return;
      }

      // Register actor.
      this.registerActor(target, response);
    });
  },

  registerActor: function(target, response) {
    // The actor is registered as 'tab' actor (an instance created for
    // every browser tab).
    let options = {
      prefix: "myactor",
      constructor: "MyActor",
      type: { tab: true }
    };

    let actorModuleUrl = self.data.url("../lib/myActor.js");

    let registry = target.client.getActor(response["actorRegistryActor"]);
    if (!registry) {
      registry = ActorRegistryFront(target.client, response);
    }

    registry.registerActor(actorModuleUrl, options).then(myActorClass => {
      console.log("My actor registered");

      // Remember, so we can unregister the actor later.
      this.myActorClass = myActorClass;

      target.client.listTabs(({ tabs, selected }) => {
        this.attachActor(target, tabs[selected]);
      });
    });
  },

  attachActor: function(target, form) {
    let myActor = MyActorFront(target.client, form);
    myActor.attach().then(() => {
      console.log("My actor attached");

      // Finally, execute remote method on the actor!
      myActor.hello().then(response => {
        console.log("Response from the actor: " + response.msg, response);
      });
    });
  },
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
}

const myTool = new Tool({
  panels: { myPanel: MyPanel }
});

exports.MyPanel = MyPanel;
