/* See license.txt for terms of usage */

/* The following implementation serves as a View (the V in MVC pattern) */

define(function(require/*, exports, module*/) {

"use strict";

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");

// ReactJS & Redux
const React = require("react");
const { Provider } = createFactories(require("react-redux"));

// TodoMVC
const { App } = createFactories(require("./containers/app"));
const { configureStore } = require("./store/configure-store");

const { Resizer } = require("./resizer");

var store = configureStore();

// Events from Chrome

addEventListener("initialize", function(event) {
  initialize(event.data);
});

// Implementation

/**
 * Render the content.
 */
function initialize(data) {
  var content = document.getElementById("content");

  // Render the top level component
  var theApp = React.render(Provider({store: store},
    () => App({})
  ), content);

  // Make sure the document takes the entire available space
  // (vertically and horizontally).
  new Resizer(window, theApp);
}

// Connection to Chrome

/**
 * Post events to the frameScript.js scope, it's consequently
 * forwarded to the chrome scope through message manager and
 * handled by myPanel.js (Controller, chrome scope).
 *
 * @param type {String} Type of the message.
 * @param data {Object} Message data, must be serializable to JSON.
 */
function postChromeMessage(id, data) {
  // Generate custom DOM event.
  const event = new MessageEvent("ws-monitor/event", {
    data: {
      type: id,
      args: data,
    }
  });

  dispatchEvent(event);
}

postChromeMessage("ready");

// End of main.js
});
