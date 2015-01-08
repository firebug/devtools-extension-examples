/* See license.txt for terms of usage */

"use strict";

const { Cu, Ci } = require("chrome");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});

/**
 * Application entry point
 */
function main(options, callbacks) {
  // Wait for Console panel initialization
  gDevTools.on("webconsole-init", onConsoleInit);
}

function onUnload(reason) {
}

/**
 * Console panel customization.
 *
 * @param eventId ID of the event
 * @param toolbox Parent toolbox object
 * @param panelFrame Panel iframe
 */
function onConsoleInit(eventId, toolbox, panelFrame) {
  // Use the toolbox object and wait till the Console panel
  // is fully ready (panel frame loaded).
  toolbox.once("webconsole-ready", (eventId, panel) => {
    panel.hud.ui.on("new-messages", onNewMessages);
  });
}

function onNewMessages(topic, messages) {
  messages.forEach(msg => {
    onNewMessage(msg);
  });
}

function onNewMessage(msg) {
  // Get DOM node associated with the message
  let node = msg.node;
  let category = node.getAttribute("category");

  // If category of the node is 'console' change the background.
  if (category == "console") {
    msg.node.setAttribute("style", "background-color: rgb(236, 183, 159)");
  }
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
