/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const Events = require("sdk/event/core");
const { Cc, Ci, Cu } = require("chrome");

// DevTools
const { XPCOMUtils } = Cu.import("resource://gre/modules/XPCOMUtils.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { console } = Cu.import("resource://gre/modules/devtools/Console.jsm", {});
const { expectState } = devtools["require"]("devtools/server/actors/common");
const protocol = devtools["require"]("devtools/server/protocol");
const { method, RetVal, ActorClass, FrontClass, Front, Actor, Arg } = protocol;

/**
 * Bug 1203802 - Websocket Frame Listener API for devtool Network Inspector
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1203802
 */
function safeRequireWebSocketService() {
  try {
    return Cc["@mozilla.org/websocketframe/service;1"].
      getService(Ci.nsIWebSocketFrameService);
  } catch (err) {
    Cu.reportError("WebSocket extension: nsIWebSocketFrameService " +
      "not available! See bug: " +
      "https://bugzilla.mozilla.org/show_bug.cgi?id=1203802");
  }
}

const webSocketService = safeRequireWebSocketService();

/**
 * Custom actor object
 */
var WsActor = ActorClass({
  typeName: "WsActor",

  /**
   * Events emitted by this actor.
   */
  events: {
    "frameReceived": { data: Arg(0, "json") },
    "frameSent": { data: Arg(0, "json") }
  },

  // Initialization

  initialize: function(conn, parent) {
    Actor.prototype.initialize.call(this, conn);

    console.log("WsActor.initialize");

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
    if (!webSocketService) {
      return {
        error: "Error: no WebSockets service!"
      }
    }

    this.state = "attached";

    var innerId = getInnerId(this.parent.window);
    webSocketService.addListener(innerId, this);

    return {
      type: "attached",
      winInnerId: innerId
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

    if (!webSocketService) {
      return;
    }

    var innerId = getInnerId(this.parent.window);
    try {
      webSocketService.removeListener(innerId, this);
    } catch (err) {
      Cu.reportError("WsActor.detach; ERROR " + err, err);
    }
  }), {
    request: {},
    response: {
      type: "detached"
    }
  }),

  /**
   * Returns title of the content window.
   */
  getConnections: method(expectState("attached", function() {
    let win = this.parent.window;

    return {
      list: ["empty"]
    };
  }), {
    request: {},
    response: RetVal("json"),
  }),

  // nsIWebSocketFrameService listener

  QueryInterface:
    XPCOMUtils.generateQI([Ci.nsIWebSocketFrameListener]),

  frameReceived: function(webSocketSerialID, maskBit, finBit,
    rsvBits, opCode, payload) {

    Events.emit(this, "frameReceived", {
      webSocketSerialID: webSocketSerialID,
      maskBit: maskBit,
      finBit: finBit,
      rsvBits: rsvBits,
      opCode: opCode,
      payload: payload
    });
  },

  frameSent: function(webSocketSerialID, header, payload) {

    Events.emit(this, "frameSent", {
      webSocketSerialID: webSocketSerialID,
      header: header,
      payload: payload
    });
  }
});

// Helpers

function getInnerId(win) {
  return win.top.QueryInterface(Ci.nsIInterfaceRequestor).
    getInterface(Ci.nsIDOMWindowUtils).currentInnerWindowID;
}

/**
 * TODO: docs
 */
var WsActorFront = FrontClass(WsActor, {
  initialize: function(client, form) {
    Front.prototype.initialize.call(this, client, form);

    this.actorID = form[WsActor.prototype.typeName];
    this.manage(this);
  }
});

// Exports from this module
exports.WsActor = WsActor;
exports.WsActorFront = WsActorFront;
