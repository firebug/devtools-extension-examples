/* See license.txt for terms of usage */

"use strict";

/**
 * This object implements two communication channels. One allows sending
 * messages to the current 'debuggee' (RDP server side) and the other
 * can be used to send messages to the chrome scope where the rest
 * of this extension lives, e.g. {@MyPanel} object.
 */
function Connection(win) {
  this.win = win;
  this.doc = win.document;
}

Connection.prototype = {
  // Direct communication channel to 'debuggee' (RDP server side).
  debuggee: null,

  // Communication channel to the chrome scope.
  chrome: null,

  /**
   * Initialization steps.
   */
  initialize: function() {
    // The initialization sequence is based on a message sent
    // from {@MyPanel.onReady}. It passes the channel ports
    // to the Debuggee and Chrome scope.
    return new Promise((resolve, reject) => {
      this.win.addEventListener("message", event => {
        console.log("connection.initialize; ", event);

        this.debuggee = event.ports[0];
        this.chrome = event.ports[1];

        // Register channel event handlers
        this.debuggee.onmessage = this.onDebuggeeMessage.bind(this);
        this.chrome.onmessage = this.onChromeMessage.bind(this);

        resolve(event);
      });
    });
  },

  /**
   * Send message to the chrome scope. It's handled by
   * {@MyPanel.onContentMessage} method.
   */
  sendChromeMessage: function(packet) {
    this.chrome.postMessage(packet);
  },

  /**
   * Send message to the RDP server. It's handled by {@Debuggee}
   * and forwarded to the server implementation in the platform.
   */
  sendDebuggeeMessage: function(packet) {
    return new Promise((resolve, reject) => {
      console.log("connection.sendDebuggeeMessage; packet: ", packet);

      this.debuggee.postMessage(packet);
      this.debuggee.onmessage = function(event) {
        resolve(event);
      }
    });
  },

  /**
   * Handle message coming from the Debuggee (server side).
   */
  onDebuggeeMessage: function(event) {
    console.log("connection.onDebuggeeMessage", event);

    var parentNode = this.doc.getElementById("content");
    var item = this.doc.createElement("pre");
    item.textContent = JSON.stringify(event.data, 2, 2);
    parentNode.appendChild(item);
  },

  /**
   * Handle message coming from the chrome scope.
   */
  onChromeMessage: function(event) {
    console.log("connection.onChromeMessage", event);

    var parentNode = this.doc.getElementById("content");
    var item = this.doc.createElement("pre");
    item.textContent = JSON.stringify(event.data, 2, 2);
    parentNode.appendChild(item);
  }
}

// Create and initialize the connection object. The initialization
// is asynchronous and depends on an 'initialization' message
// sent from {@MyPanel}.
var connection = new Connection(window);
connection.initialize().then(event => {
  // Send a message back to the chrome scope. The data is
  // send as JSON packet (string).
  connection.sendChromeMessage({
    type: "message",
    content: "Hello from the content scope!"
  });
});
