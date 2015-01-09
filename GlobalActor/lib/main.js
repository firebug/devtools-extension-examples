/* See license.txt for terms of usage */

"use strict";

var self = require("sdk/self");

const { Cu, Ci } = require("chrome");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { MyActorFront } = require("./myActor.js");

const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { ActorRegistryFront } = devtools["require"]("devtools/server/actors/actor-registry");

let myActorRegistrar;

/**
 * Application entry point
 */
function main(options, callbacks) {
  // Wait for Toolbox initialization
  gDevTools.on("toolbox-ready", onToolboxReady);
}

function onUnload(reason) {
  gDevTools.off("toolbox-ready", onToolboxReady);

  // Unregister registered actor
  if (myActorRegistrar) {
    myActorRegistrar.unregister().then(() => {
      console.log("my actor unregistered");
    });
  }
}

/**
 * When the Toolbox is ready, register our custom global actor.
 */
function onToolboxReady(event, toolbox) {
  let target = toolbox.target;
  target.activeTab.attachThread({}, (response, threadClient) => {
    console.log("threadClient attached", response);

    target.client.listTabs(response => {
      console.log("list of tabs", response);

      // The actor might be already registered on the backend.
      if (response[MyActorFront.prototype.typeName]) {
        console.log("actor already registered, so use it", response);

        attachActor(target, response);
        return;
      }

      // Register actor.
      registerActor(target, response);
    });
  });
}

function registerActor(target, response) {
  // The actor is registered as 'global' actor (one instance created for
  // the browser).
  let options = {
    prefix: MyActorFront.prototype.typeName,
    constructor: "MyActor",
    type: { global: true }
  };

  let actorModuleUrl = self.data.url("../lib/myActor.js");

  let registry = ActorRegistryFront(target.client, response);
  registry.registerActor(actorModuleUrl, options).then(actorRegistrar => {
    console.log("My actor registered");

    // Remember, so we can unregister the actor later.
    myActorRegistrar = actorRegistrar;

    target.client.listTabs(response => {
      attachActor(target, response);
    });
  });
}

function attachActor(target, form) {
  let myActor = MyActorFront(target.client, form);
  myActor.attach().then(() => {
    // Finally, execute remote method on the actor!
    myActor.hello().then(response => {
      console.log("Response from the actor: " + response.msg, response);
    });
  });
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
