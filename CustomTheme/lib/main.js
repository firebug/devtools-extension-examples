/* See license.txt for terms of usage */

"use strict";

const { Cu, Ci } = require("chrome");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});

var self = require("sdk/self");

function main(options, callbacks) {
  let styleUrl = self.data.url("theme.css");

  // Register new developer tools theme.
  gDevTools.registerTheme({
    id: "custom-theme",
    label: "Custom theme",
    stylesheets: [
      "chrome://browser/skin/devtools/light-theme.css",
      styleUrl
    ],
    classList: ["theme-light", "custom-theme"],
  });
}

function onUnload(reason) {
  gDevTools.unregisterTheme("custom-theme");
}

exports.main = main;
exports.onUnload = onUnload;
