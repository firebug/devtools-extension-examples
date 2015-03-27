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
const { console } = Cu.import("resource://gre/modules/devtools/Console.jsm", {});

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

    // Get ActorRegistryFront client object.
    let target = this.toolbox.target;
    target.client.listTabs(response => {
      let registry = ActorRegistryFront(target.client, response);

      // Register the custom backend actor.
      registry.registerActor(actorModuleUrl, options).then(myActorClass => {
        // Remember actor class, so we can unregister the actor later.
        this.myActorClass = myActorClass;

        // Get custom actor client object
        target.client.listTabs(({ tabs, selected }) => {
          let myActor = MyActorFront(target.client, tabs[selected]);

          // Initialize inspector and get DOM Walker actor ID.
          this.toolbox.initInspector().then(() => {
            let walker = this.toolbox.walker;

            // Attach to the custom actor.
            myActor.attach(walker).then(() => {
              console.log("My actor attached!");
            });
          });

          myActor.on("click", this.onClick);
        });
      });
    });
  },

  detach: function() {
    // TODO: detach
  },

  // Actor Events

  onClick: function(clickedNodeData) {
    console.log("Click event from the backend!", clickedNodeData.node);
  }
});

// Exports from this module
exports.ToolboxOverlay = ToolboxOverlay;
