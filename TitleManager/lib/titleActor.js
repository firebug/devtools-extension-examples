/* See license.txt for terms of usage */

"use strict";

const { Cc, Ci, Cu } = require("chrome");
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { console } = Cu.import("resource://gre/modules/devtools/Console.jsm", {});

const { WebConsoleCommands } = devtools["require"]("devtools/toolkit/webconsole/utils");

let protocol = devtools["require"]("devtools/server/protocol");
let { method, RetVal, ActorClass, FrontClass, Front, Actor, Arg } = protocol;


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
var TitleActor = ActorClass({
  typeName: "titleactor",

  initialize: function(conn, parent) {
    Actor.prototype.initialize.call(this, conn);

    console.log("TitleActor.initialize");

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
   * Returns title of the content window.
   */
  getTitle: method(expectState("attached", function() {
    let win = this.parent.window;
    return {
      title: win.document.title
    };
  }), {
    request: {},
    response: RetVal("json"),
  }),

  /**
   * Sets title of the content window.
   */
  setTitle: method(expectState("attached", function(title) {
    let win = this.parent.window;
    win.document.title = title;
  }), {
    request: {
      title: Arg(0, "string")
    },
    response: {
      type: "title-changed"
    },
  }),
});

exports.TitleActor = TitleActor;

exports.TitleActorFront = FrontClass(TitleActor, {
  initialize: function(client, form) {
    Front.prototype.initialize.call(this, client, form);

    this.actorID = form[TitleActor.prototype.typeName];
    this.manage(this);
  }
});

// New Command line commands
WebConsoleCommands.register("getTitle", function(owner) {
  return owner.window.document.title;
});

WebConsoleCommands.register("setTitle", function(owner, title) {
  owner.window.document.title = title;
  return "Title changed to: " + title;
});

