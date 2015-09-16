/* See license.txt for terms of usage */

/* The following implementation serves as a View (the V in MVC pattern) */

/**
 * Button click handler
 */
function onGetConnections() {
  postChromeMessage("get-connections", {})
}

/**
 * Listen for 'update-view' event that is sent as a response
 * to 'format-time'.
 */
addEventListener("update-view", function(event) {
  console.log("ws-view.js: update-view", event);

  var content = document.getElementById("content");
  var node = document.createElement("div");
  node.textContent = event.data;
  node.className = "connections";
  content.appendChild(node);
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

// nsIWebSocketFrameService events

addEventListener("frameReceived", function(event) {
  console.log("ws-view.js: frameReceived", event);

  var content = document.getElementById("content");
  var node = document.createElement("div");
  node.textContent = "Received: " + event.data;
  node.className = "frameReceived";
  content.appendChild(node);
});

addEventListener("frameSent", function(event) {
  console.log("ws-view.js: frameSent", event);

  var content = document.getElementById("content");
  var node = document.createElement("div");
  node.textContent = "Sent: " + event.data;
  node.className = "frameSent";
  content.appendChild(node);
});

