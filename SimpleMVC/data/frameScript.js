/* See license.txt for terms of usage */

"use strict";

(function({
  content,
  addMessageListener,
  sendAsyncMessage,
  removeMessageListener,
  addEventListener}) {

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

const document = content.document;
const window = content;

/**
 * Register a listener for messages from myPanel.js (Controller, chrome scope).
 * A message from chrome scope comes through a message manager.
 * It's further distributed as DOM event, so it can be handled by
 * myView.js (View, content scope).
 */
addMessageListener("my-extension/message", message => {
  const { type, data } = message.data;
  const event = new window.MessageEvent(type, {
    data: data,
  });

  window.dispatchEvent(event);
});

/**
 * Send a message to the parent myPanel.js (Controller, chrome scope).
 */
function postChromeMessage(id, args) {
  const event = {
    type: id,
    args: args,
  };

  sendAsyncMessage("message", event);
}

/**
 * Register a listener for DOM events from myView.js (View, content scope).
 * It's further distributed as a message through message manager to
 * myPanel.js (Controller, chrome scope).
 */
window.addEventListener("my-extension/event", function (event) {
  const data = event.data;
  postChromeMessage(data.type, data.args);
}, true);

// End of scope
})(this);
