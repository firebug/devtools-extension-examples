/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const { Cc, Ci, Cu } = require("chrome");
const Events = require("sdk/event/core");

// DevTools
const { devtools } = Cu.import("resource://gre/modules/devtools/shared/Loader.jsm", {});
const { console } = Cu.import("resource://gre/modules/devtools/shared/Console.jsm", {});
const { expectState } = devtools["require"]("devtools/server/actors/common");
const protocol = devtools["require"]("devtools/server/protocol");

// Platform
const { XPCOMUtils } = Cu.import("resource://gre/modules/XPCOMUtils.jsm", {});

// Constants
const { method, RetVal, ActorClass, FrontClass, Front, Actor, Arg } = protocol;

/**
 * Custom actor object
 */
var TodoActor = ActorClass({
  typeName: "TodoActor",

  // Initialization

  initialize: function(conn, parent) {
    Actor.prototype.initialize.call(this, conn);

    console.log("TodoActor.initialize");

    this.parent = parent;
    this.state = "detached";
  },

  destroy: function() {
    if (this.state === "attached") {
      this.detach();
    }

    Actor.prototype.destroy.call(this);
  },

  /**
   * Attach to this actor.
   */
  attach: method(expectState("detached", function() {
    this.state = "attached";

    return {
      type: "attached"
    }
  }), {
    request: {},
    response: RetVal("json")
  }),

  /**
   * Detach from this actor.
   */
  detach: method(expectState("attached", function() {
    this.state = "detached";
  }), {
    request: {},
    response: {
      type: "detached"
    }
  }),
});

// Front

/**
 * Front object for the actor above. It's intended to be used
 * on the client side.
 */
var TodoActorFront = FrontClass(TodoActor, {
  initialize: function(client, form) {
    Front.prototype.initialize.call(this, client, form);

    this.actorID = form[TodoActor.prototype.typeName];
    this.manage(this);
  }
});

// Exports from this module
exports.TodoActor = TodoActor;
exports.TodoActorFront = TodoActorFront;
