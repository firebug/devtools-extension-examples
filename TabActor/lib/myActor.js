/* See license.txt for terms of usage */

"use strict";

const { Cc, Ci, Cu } = require("chrome");
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { console } = Cu.import("resource://gre/modules/devtools/Console.jsm", {});

let protocol = devtools["require"]("devtools/server/protocol");
let { method, RetVal, ActorClass, FrontClass, Front, Actor } = protocol;

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
 * Custom actor object
 */
let MyTabActor = ActorClass({
  typeName: "mytabactor",

  initialize: function(conn, parent) {
    Actor.prototype.initialize.call(this, conn);

    console.log("myTabActor.initialize");

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
  }), {
    request: {},
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
   * A test remote method.
   */
  hello: method(function() {
    let result = {
      msg: "Hello from a tab actor!"
    };

    return result;
  }, {
    request: {},
    response: RetVal("json"),
  }),
});

exports.MyTabActor = MyTabActor;

exports.MyTabActorFront = FrontClass(MyTabActor, {
  initialize: function(client, form) {
    Front.prototype.initialize.call(this, client, form);

    this.actorID = form[MyTabActor.prototype.typeName];
    this.manage(this);
  }
});
