/* See license.txt for terms of usage */

"use strict";

const { Cc, Ci, Cu } = require("chrome");
const { Trace } = require("./trace.js");
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { ToolSidebar } = devtools["require"]("devtools/framework/sidebar");

let protocol = devtools["require"]("devtools/server/protocol");
let { method, RetVal } = protocol;

const { reportException } = devtools["require"]("devtools/toolkit/DevToolsUtils");

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
let MyActor = protocol.ActorClass({
  typeName: "myactor",

  get dbg() {
    if (!this._dbg) {
      this._dbg = this.parent.makeDebugger();
    }
    return this._dbg;
  },

  initialize: function(conn, parent) {
    protocol.Actor.prototype.initialize.call(this, conn);

    Trace.sysout("myActor.initialize;", arguments);

    this.parent = parent;
    this.state = "detached";
    this._dbg = null;
  },

  destroy: function() {
    Trace.sysout("myActor.destroy;", arguments);

    if (this.state === "attached") {
      this.detach();
    }

    protocol.Actor.prototype.destroy.call(this);
  },

  /**
   * Attach to this actor.
   */
  attach: method(expectState("detached", function() {
    Trace.sysout("myActor.attach;", arguments);

    this.dbg.addDebuggees();
    this.dbg.enabled = true;
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
    Trace.sysout("myActor.detach;", arguments);

    this.dbg.removeAllDebuggees();
    this.dbg.enabled = false;
    this._dbg = null;
    this.state = "detached";
  }), {
    request: {},
    response: {
      type: "detached"
    }
  }),

  /**
   * A test method.
   *
   * @returns object
   */
  hello: method(function() {
    Trace.sysout("myActor.hello;", arguments);

    let result = {
      msg: "Hello from the backend!"
    };

    return result;
  }, {
    request: {},
    response: RetVal("json"),
  }),
});

exports.MyActor = MyActor;

exports.MyActorFront = protocol.FrontClass(MyActor, {
  initialize: function(client, form) {
    protocol.Front.prototype.initialize.call(this, client, form);

    Trace.sysout("myActorFront.initialize;", arguments);

    this.actorID = form.myactorActor;
    this.manage(this);
  }
});
