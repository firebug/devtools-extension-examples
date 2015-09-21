/* See license.txt for terms of usage */

/* The following implementation serves as a View (the V in MVC pattern) */

define(function(require/*, exports, module*/) {

"use strict";

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");

// ReactJS & Redux
const React = require("react");
const { Provider } = createFactories(require("react-redux"));

// WebSockets Monitor
const { App } = createFactories(require("./containers/app"));
const { Resizer } = require("./resizer");
const { configureStore } = require("./store/configure-store");

/**
 * Render the content.
 */
var content = document.getElementById("content");
var store = configureStore();
var theApp = React.render(Provider({store: store},
  () => App({})
), content);

// Events from Chrome

/**
 * Listen for 'update-view' event that is sent as a response
 * to 'format-time'.
 */
addEventListener("update-view", function(event) {
  console.log("ws-view.js: update-view", event);
});

addEventListener("frameReceived", function(event) {
  console.log("ws-view.js: frameReceived", event);
});

addEventListener("frameSent", function(event) {
  console.log("ws-view.js: frameSent", event);
});

/**
 * Post events to the frameScript.js scope, it's consequently
 * forwarded to the chrome scope through message manager and
 * handled by myPanel.js (Controller, chrome scope).
 *
 * @param type {String} Type of the message.
 * @param data {Object} Message data, must be serializable to JSON.
 */
function postChromeMessage(id, data) {
  console.log("ws-view.js: postChromeMessage; " + id, data);

  // Generate custom DOM event.
  const event = new MessageEvent("ws-monitor/event", {
    data: {
      type: id,
      args: data,
    }
  });

  dispatchEvent(event);
}

// Make sure the document takes the entire available space
// (vertically and horizontally).
new Resizer(window, theApp);

// End of main.js
});
