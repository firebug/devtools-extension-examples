/* See license.txt for terms of usage */

"use strict";

var self = require("sdk/self");

const { Cu } = require("chrome");
const { Panel } = require("dev/panel");
const { Tool } = require("dev/toolbox");
const { Class } = require("sdk/core/heritage");
const { MyActorFront } = require("./myActor.js");
const { viewFor } = require("sdk/view/core");
const { MessageChannel } = require("sdk/messaging");

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
    this.disconnect();
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
  },

  onContentMessage: function(event) {
    console.log("onContentMessage", event);

    switch (event.data.type) {
    case "connect":
      this.connect();
      break;
    case "disconnect":
      this.disconnect();
      break;
    }
  },

  /**
   * Connect to our custom {@MyActor} actor.
   */
  connect: function() {
    console.log("Connect to the backend actor; " + this.myActorClass);

    let target = this.toolbox.target;
    target.client.listTabs((response) => {

      // The actor might be already registered on the backend.
      let tab = response.tabs[response.selected];
      if (tab[MyActorFront.prototype.typeName]) {
        console.log("actor already registered, so use it", tab);

        this.attachActor(target, tab);
        return;
      }

      // Register actor.
      this.registerActor(target, response);
    });
  },

  /**
   * Disconnect to our custom {@MyActor} actor.
   */
  disconnect: function() {
    console.log("Disconnect from the backend actor; " + this.myActorClass);

    // Unregistration isn't done right, see also:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1146889
    // If an actor is unregistered and then immediately registered
    // there is the following exception:
    // Error: Wrong State: Expected 'detached', but current state is 'attached'
    // It's because the existing actor instance in the server side pool
    // isn't removed during the unregistration process.
    // The user needs to close and open the toolbox to re-establish
    // connection (to ensure clean actor pools).
    if (this.myActorClass) {
      this.myActorClass.unregister();
      this.myActorClass = null;

      this.content.postMessage("unregistered");
    }
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

      // Post message to the panel content.
      this.content.postMessage("registered");

      target.client.listTabs(({ tabs, selected }) => {
        this.attachActor(target, tabs[selected]);
      });
    });
  },

  attachActor: function(target, form) {
    let myActor = MyActorFront(target.client, form);
    myActor.attach().then(() => {
      console.log("My actor attached");

      this.content.postMessage("attached");

      // Finally, execute remote method on the actor!
      myActor.hello().then(response => {
        console.log("Response from the actor: " + response.msg, response);

        this.content.postMessage(response.msg);
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
