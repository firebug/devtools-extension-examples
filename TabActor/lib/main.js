/* See license.txt for terms of usage */

"use strict";

var self = require("sdk/self");

const { Cu, Ci } = require("chrome");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { MyTabActorFront } = require("./myActor.js");

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
 * When the Toolbox is ready, register our custom tab actor.
 */
function onToolboxReady(event, toolbox) {
  let target = toolbox.target;

  console.log("New toolbox ready, let's register a tab actor for it. " +
    target.url);

  // Response is stored on the target and can be reused to avoid
  // additional listTabs. Supported from Fx? FIXME
  // let response = target.form;
  target.client.listTabs(response => {
    let tab = response.tabs[response.selected];

    // The actor might be already registered on the backend.
    if (tab[MyTabActorFront.prototype.typeName]) {
      console.log("My tab actor is already registered, attach to it");

      attachActor(target, tab);
      return;
    }

    // Register actor.
    registerActor(target, response);
  });
}

function registerActor(target, response) {
  // The actor is registered as 'tab' actor (one instance created for
  // every browser tab).
  let options = {
    prefix: MyTabActorFront.prototype.typeName,
    constructor: "MyTabActor",
    type: { tab: true }
  };

  let actorModuleUrl = self.data.url("../lib/myActor.js");

  let registry = target.client.getActor(response["actorRegistryActor"]);
  if (!registry) {
    registry = ActorRegistryFront(target.client, response);
  }

  registry.registerActor(actorModuleUrl, options).then(actorRegistrar => {
    console.log("My tab actor is now registered");

    // Remember, so we can unregister the actor later.
    myActorRegistrar = actorRegistrar;

    target.client.listTabs(response => {
      let tab = response.tabs[response.selected];
      attachActor(target, tab);
    });
  });
}

function attachActor(target, form) {
  let myActor = MyTabActorFront(target.client, form);
  myActor.attach().then(() => {
    console.log("My actor is now attached");

    // Finally, execute remote method on the actor!
    myActor.hello().then(response => {
      console.log("Response from the actor: " + response.msg, response);
    });
  });
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
