/* See license.txt for terms of usage */

"use strict";

(function({content, addMessageListener, sendAsyncMessage, removeMessageListener}) {

const document = content.document;
const window = content;

/**
 * Listener for message from the inspector panel (chrome scope).
 */
function messageListener(message) {
  const { type, data } = message.data;

  console.log("Message from chrome: " + data);
};

addMessageListener("message/from/chrome", messageListener);

/**
 * Clean up
 */
window.addEventListener("unload", event => {
  removeMessageListener("message/from/chrome", messageListener);
})

/**
 * Send a message back to the parent panel (chrome scope).
 */
function postChromeMessage(type, data) {
  sendAsyncMessage("message/from/content", {
    type: type,
    data: data,
  });
}

/**
 * TEST: Send a test message to the chrome scope when
 * the user clicks within the frame.
 */
window.addEventListener("click", event => {
  postChromeMessage("click", "Hello from content scope!");
})

})(this);
