/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const options = require("@loader/options");
const { Cu, Ci } = require("chrome");
const { Class } = require("sdk/core/heritage");
const { Tool } = require("dev/toolbox");
const { defer, resolve, all } = require("sdk/core/promise");

// Firebug.SDK
const { Rdp } = require("firebug.sdk/lib/core/rdp.js");
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Content } = require("firebug.sdk/lib/core/content.js");
const { PanelBase } = require("firebug.sdk/lib/panel-base.js");

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
  extends: PanelBase,

  label: Locale.$STR("todomvc.panel.title"),
  tooltip: Locale.$STR("todomvc.panel.tooltip"),
  icon: "./icon-16.png",
  url: "./todo-view.html",

  /**
   * Executed by the framework when an instance of this panel is created.
   * There is one instance of this panel per {@Toolbox}. The panel is
   * instantiated when selected in the toolbox for the first time.
   */
  initialize: function(options) {
    this.extends.initialize.apply(this, arguments);
    console.log("TodoPanel.initialize;", options);
  },

  // Events

  /**
   * This method must be here.
   */
  onReady: function() {
    // The sdk/panel object registers automatically all methods
    // starting with 'on' as listeners. But only if they are defined
    // on the actually panel instance prototype
    // (see: Panel.setup => setListeners);
    // So, it doesn't include methods implemented in {@BasePanel}.
    // xxxHonza: related to why onReady, onLoad, onError, ...
    // doesn't have to be executed for every panel (if not defined in
    // the actual instance). FIX ME
    this.extends.onReady.apply(this, arguments);
    console.log("TodoPanel.onReady;", arguments);
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

// Registration
const myTool = new Tool({
  name: "MyTool",
  panels: {
    TodoPanel: TodoPanel
  }
});
