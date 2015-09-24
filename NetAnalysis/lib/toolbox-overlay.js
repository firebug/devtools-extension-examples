/* See license.txt for terms of usage */

"use strict";

const { Cu, Ci } = require("chrome");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { console } = Cu.import("resource://gre/modules/devtools/Console.jsm", {});

// https://bugzilla.mozilla.org/show_bug.cgi?id=912121 
const HarExporter;
try {
  HarExporter = devtools["require"]("devtools/client/netmonitor/har/har-exporter");
} catch (err) {
  HarExporter = devtools["require"]("devtools/netmonitor/har/har-exporter.js");
}

/**
 * This object represents an overlay for the DevTools Toolbox.
 * It follows its life time by listening to its events and performs
 * customization of the built-in Network panel.
 */
const ToolboxOverlay = {
  /**
   * Executed when a new toolbox is ready. There is one instance
   * of the toolbox per browser tab (created when the user opens
   * the toolbox UI).
   */
  onInit: function(eventId, toolbox) {
    this.onNetPanelReady = this.onNetPanelReady.bind(this);
    this.onYSlowClick = this.onYSlowClick.bind(this);

    // Wait till the Network panel is ready. The panel is created
    // when the user selects it for the first time.
    toolbox.getPanelWhenReady("netmonitor").then(this.onNetPanelReady);
  },

  /**
   * Executed when an existing toolbox is destroyed.
   */
  onDestroy: function(eventId, toolbox) {
    // TODO: clean up
  },

  /**
   * Executed when the Network panel is ready for customization.
   */
  onNetPanelReady: function(panel) {
    let doc = panel.panelWin.document;

    this.netPanel = panel;

    // Build a simple 'YSlow' button that performs analysis
    // of Network data.
    let button = doc.createElement("button");
    button.className = "requests-menu-footer-button";
    button.id = "requests-menu-yslow-button"
    button.tooltip = "Run HAR analysis";
    button.setAttribute("label", "YSlow");
    button.addEventListener("command", this.onYSlowClick, false);

    // Append into the bottom toolbar (see the bottom right corner).
    let footer = doc.getElementById("requests-menu-footer");
    footer.appendChild(button);
  },

  /**
   * Executed when the 'YSlow' button is clicked.
   */
  onYSlowClick: function(event) {
    let win = this.netPanel.panelWin;
    let RequestsMenu = win.NetMonitorView.RequestsMenu;

    // Check if there are any entries in the Net panel.
    let items = RequestsMenu.items;
    if (!items.length) {
      return;
    }

    // An example showing how to iterate over entries in the Network panel.
    // Note that some data are not fetched from the backed automatically.
    // That's why it's better to use 'buildHarData' since it loads all
    // missing pieces from the backend for you.
    // for (let i=0; i<items.length; i++) {
    //  let request = items[i].attachment;
    // }

    // HAR builder options
    let options = RequestsMenu.getDefaultHarOptions();
    options.includeResponseBodies = true;

    // Get HAR data from the Network panel. It's asynchronous since
    // some data might be fetched from the backend over RDP protocol.
    // HAR Spec: http://www.softwareishard.com/blog/har-12-spec/
    // HAR Exporter: https://github.com/mozilla/gecko-dev/blob/master/browser/devtools/netmonitor/har/har-exporter.js
    // HAR Builder: https://github.com/mozilla/gecko-dev/blob/master/browser/devtools/netmonitor/har/har-builder.js
    HarExporter.buildHarData(options).then(har => {
      // Log HAR into the browser console.
      console.log("HAR", har);

      // TODO: execute HAR analysis
    });
  }
};

// Registration
gDevTools.on("toolbox-created", ToolboxOverlay.onInit.bind(ToolboxOverlay));
gDevTools.on("toolbox-destroy", ToolboxOverlay.onDestroy.bind(ToolboxOverlay));

// Exports from this module
exports.ToolboxOverlay = ToolboxOverlay;
