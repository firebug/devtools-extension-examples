/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const { Cc, Ci, Cu } = require("chrome");
const Events = require("sdk/event/core");

// DevTools
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});

// xxxHonza: is this really required?
devtools["require"]("devtools/server/actors/inspector");

let protocol = devtools["require"]("devtools/server/protocol");
let { method, ActorClass, FrontClass, Front, Actor, Arg } = protocol;

/**
 * A method decorator that ensures the actor is in the expected state before
 * proceeding. If the actor is not in the expected state, the decorated method
 * returns a rejected promise.
 *
 * @param String expectedState
 *        The expected state.
 *
 * @param Function method
 *        The actor method to proceed with when the actor is in the expected
 *        state.
 *
 * @returns Function
 *          The decorated method.
 */
function expectState(expectedState, method) {
  return function(...args) {
    if (this.state !== expectedState) {
      const msg = "Wrong State: Expected '" + expectedState + "', but current "
                + "state is '" + this.state + "'";
      return Promise.reject(new Error(msg));
    }

    return method.apply(this, args);
  };
}

/**
 * TODO: description
 */
let MyActor = ActorClass({
  typeName: "myactor",

  /**
   * Events emitted by this actor.
   */
  events: {
    "click": {
      type: "click",
      node: Arg(0, "disconnectedNode"),
    }
  },

  initialize: function(conn, parent) {
    Actor.prototype.initialize.call(this, conn);

    this.parent = parent;
    this.state = "detached";

    this.onNavigate = this.onNavigate.bind(this);
    this.onClick = this.onClick.bind(this);
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
  attach: method(expectState("detached", function(walkerActorID) {
    this.walkerActorID = walkerActorID;
    this.state = "attached";

    Events.on(this.parent, "navigate", this.onNavigate);

    this.registerEventHandler();
  }), {
    request: {
      walkerActorID: Arg(0, "string"),
    },
    response: {
      type: "attached"
    }
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

  /**
   * Page navigation handler.
   */
  onNavigate: function({isTopLevel}) {
    this.registerEventHandler();
  },

  registerEventHandler: function() {
    let win = this.parent.window;
    win.addEventListener("click", this.onClick, true);
  },

  onClick: function(event) {
    let threadActor = this.parent.threadActor;
    let walkerActor = this.conn.getActor(this.walkerActorID);
    if (!walkerActor) {
      return;
    }

    let data = walkerActor.attachElement(event.target);

    // Send the click event to the client.
    Events.emit(this, "click", data);
  }
});

exports.MyActor = MyActor;

exports.MyActorFront = FrontClass(MyActor, {
  initialize: function(client, form) {
    Front.prototype.initialize.call(this, client, form);

    this.actorID = form[MyActor.prototype.typeName];
    this.manage(this);
  },

  attach: protocol.custom(function(walkerFront) {
    this.walkerFront = walkerFront;
    return this._attach(this.walkerFront.actorID);
  }, {impl: "_attach"}),

  ensureParentFront: function(...args) {
    this.walkerFront.ensureParentFront.apply(this.walkerFront, args);
  }
});

// Exports from this module
