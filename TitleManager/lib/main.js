/* See license.txt for terms of usage */

"use strict";

var self = require("sdk/self");

const { Cu, Ci } = require("chrome");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { TitleActorFront } = require("./titleActor.js");

const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { ActorRegistryFront } = devtools["require"]("devtools/server/actors/actor-registry");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

// List of all created MyToolboxOverlays.
var overlays = new Map();

/**
 * Application entry point
 */
function main(options, callbacks) {
  // TODO: Toolbox instance can already exist if the extension
  // is installed (or enabled) in the middle of Firefox session.
  // All browser windows and tabs should be iterated to manually
  // create MyToolboxOverlay instances.

  // Wait for every Toolbox initialization (there is one Toolbox
  // created per browser tab).
  gDevTools.on("toolbox-created", onToolboxCreated);
}

/**
 * Called at shutdown (uninstall, disable, Firefox shutdown)
 */
function onUnload(reason) {
  gDevTools.off("toolbox-created", onToolboxCreated);

  // Manually destroy all existing instances of MyToolboxOverlay
  // Needed if the extension is disabled or uninstalled in the
  // middle of Firefox session - to clean up all.
  overlays.forEach((value, key) => {
    value.destroy();
  })
}

/**
 * Create instance of MyToolboxOverlay for every opened Toolbox.
 */
function onToolboxCreated(event, toolbox) {
  let overlay = new MyToolboxOverlay(toolbox);
  overlays.set(toolbox, overlay);
}

/**
 * Toolbox Overlay. This object listens for developer Toolbox
 * events and follows the same life cycle. This is only simplified
 * example how to implement overlays for existing devtools widgets
 * and you can find real implementation in Firebug.SDK
 */
function MyToolboxOverlay(toolbox) {
  this.toolbox = toolbox;

  this.ready = this.ready.bind(this);
  this.destroy = this.destroy.bind(this);
  this.onConsoleReady = this.onConsoleReady.bind(this);

  // Global event handlers
  this.toolbox.on("ready", this.ready);
  this.toolbox.on("destroy", this.destroy);
  this.toolbox.on("webconsole-ready", this.onConsoleReady);
}

MyToolboxOverlay.prototype = {
  titleActorRegistrar: null,

  /**
   * When the Toolbox is ready, register our custom tab actor.
   */
  ready: function() {
    let target = this.toolbox.target;

    console.log("New toolbox ready, let's register our title actor for it. " +
      target.url);

    // Response is stored on the target and can be reused to avoid
    // additional listTabs. Supported from Fx? FIXME
    // let response = target.form;
    target.client.listTabs(response => {
      let tab = response.tabs[response.selected];

      // The actor might be already registered on the backend.
      if (tab[TitleActorFront.prototype.typeName]) {
        console.log("My title actor is already registered, attach to it");

        this.attachActor(target, tab);
        return;
      }

      // Register actor.
      this.registerActor(target, response);
    });
  },

  /**
   * Clean up
   */
  destroy: function() {
    this.toolbox.off("ready", this.ready);
    this.toolbox.off("destroy", this.destroy);
    this.toolbox.off("webconsole-ready", this.onConsoleReady);

    // Unregister overlay
    overlays.delete(this.toolbox);

    // Unregister registered actor
    if (this.titleActorRegistrar) {
      this.titleActorRegistrar.unregister().then(() => {
        console.log("title actor unregistered");
      });
    }
  },

  /**
   * When the Console panel is ready, create a button in its
   * Toolbar that allows to get title of the current page.
   */
  onConsoleReady: function(event, panel) {
    console.log("The Console panel is now ready", panel);

    this.consolePanel = panel;

    let doc = panel._frameWindow.document;
    let toolbar = doc.querySelector(".hud-console-filter-toolbar");
    let clearButton = doc.querySelector(".webconsole-clear-console-button");

    // Create new toolbar button in the Console panel.
    let button = doc.createElementNS(XUL_NS, "toolbarbutton");
    button.setAttribute("label", "Get Title");
    button.addEventListener("command", this.onGetTitle.bind(this), false);
    button.className = "devtools-toolbarbutton";
    toolbar.insertBefore(button, clearButton.nextSibling);
  },

  /**
   * Handler for Console panel 'Get Title' button.
   */
  onGetTitle: function(event) {
    console.log("Get window title from our actor");

    // Bail out if our title actor isn't registered yet. The registration
    // happens asynchronously when the Toolbox is ready (after the button
    // is created in the Console panel UI).
    if (!this.titleActor) {
      return;
    }

    this.titleActor.getTitle().then(response => {
      // Log the result into the Console panel
      this.consolePanel.hud.ui.handleConsoleAPICall({
        arguments: [response.title],
        level: "log",
      });
    });
  },

  registerActor: function(target, response) {
    // The actor is registered as 'tab' actor (one instance created for
    // every browser tab).
    let options = {
      prefix: TitleActorFront.prototype.typeName,
      constructor: "TitleActor",
      type: { tab: true }
    };

    let actorModuleUrl = self.data.url("../lib/titleActor.js");

    let registry = target.client.getActor(response["actorRegistryActor"]);
    if (!registry) {
      registry = ActorRegistryFront(target.client, response);
    }

    registry.registerActor(actorModuleUrl, options).then(actorRegistrar => {
      console.log("My title actor is now registered");

      // Remember, so we can unregister the actor later.
      this.titleActorRegistrar = actorRegistrar;

      target.client.listTabs(response => {
        let tab = response.tabs[response.selected];
        this.attachActor(target, tab);
      });
    });
  },

  attachActor: function(target, form) {
    this.titleActor = TitleActorFront(target.client, form);
    this.titleActor.attach().then(() => {
      console.log("Title actor is now attached");
    });
  }
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
