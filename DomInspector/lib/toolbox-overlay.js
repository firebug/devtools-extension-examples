/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
var self = require("sdk/self");
const { Cu, Ci } = require("chrome");
const { Class } = require("sdk/core/heritage");

// DevTools
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { ActorRegistryFront } = devtools["require"]("devtools/server/actors/actor-registry");

// DOM Inspector
const { MyActorFront } = require("./my-actor");

/**
 * TODO: desc
 */
const ToolboxOverlay = Class(
/** @lends ToolboxOverlay */
{
  // Initialization

  initialize: function(toolbox) {
    this.toolbox = toolbox;

    this.onClick = this.onClick.bind(this);

    this.attach();
  },

  destroy: function() {
    this.detach();
  },

  // Backend

  /**
   * Attach to the backend actor.
   */
  attach: function() {
    // The actor is registered as 'tab' actor (an instance created for
    // every browser tab).
    let options = {
      prefix: "myactor",
      constructor: "MyActor",
      type: { tab: true }
    };

    let actorModuleUrl = self.data.url("../lib/my-actor.js");

    let target = this.toolbox.target;
    target.client.listTabs(response => {
      let registry = ActorRegistryFront(target.client, response);
      registry.registerActor(actorModuleUrl, options).then(myActorClass => {
        // Remember, so we can unregister the actor later.
        this.myActorClass = myActorClass;

        target.client.listTabs(({ tabs, selected }) => {
          let myActor = MyActorFront(target.client, tabs[selected]);
          myActor.attach().then(() => {
            console.log("My actor attached", arguments);
          });

          myActor.on("onclick", this.onClick);
        });
      });
    });
  },

  detach: function() {
    // TODO: detach
  },

  // Actor Events

  onClick: function(nodeFront) {
    Trace.sysout("ToolboxOverlay.onClick;", nodeFront);
  }
});

// Exports from this module
exports.ToolboxOverlay = ToolboxOverlay;
