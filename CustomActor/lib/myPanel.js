/* See license.txt for terms of usage */

"use strict";

var self = require("sdk/self");

const { Cu } = require("chrome");
const { Panel } = require("dev/panel");
const { Tool } = require("dev/toolbox");
const { Class } = require("sdk/core/heritage");
const { MyActorFront } = require("./myActor.js");
const { viewFor } = require("sdk/view/core");

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
  },

  dispose: function() {
    if (this.myActorClass) {
      this.myActorClass.unregister();
    }
  },

  onReady: function() {
    this.connect();
  },

  /**
   * Connect to our custom {@MyActor} actor.
   */
  connect: function() {
    let target = this.toolbox.target;
    target.activeTab.attachThread({}, (response, threadClient) => {
      console.log("threadClient attached", response);

      target.client.listTabs((response) => {
        console.log("list of tabs", response);

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
    });
  },

  registerActor: function(target, response) {
    // Bug 1107888 - e10s support for dynamic actor registration
    try {
      if (Services.appinfo.browserTabsRemoteAutostart) {
        devtools.require("devtools/server/actors/utils/actor-registry-utils");
      }
    } catch (err) {
      return;
    }

    // The actor is registered as 'tab' actor (an instance created for
    // every browser tab).
    let options = {
      prefix: "myactor",
      constructor: "MyActor",
      type: { tab: true }
    };

    let actorModuleUrl = self.data.url("../lib/myActor.js");

    let registry = ActorRegistryFront(target.client, response);
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
      console.log("My actor attached", arguments);

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
