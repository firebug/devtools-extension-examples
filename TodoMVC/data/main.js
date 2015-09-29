/* See license.txt for terms of usage */

/* The following implementation serves as a View (the V in MVC pattern) */

define(function(require/*, exports, module*/) {

"use strict";

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");
const { PanelView, createView } = require("firebug.sdk/lib/panel-view");

// ReactJS & Redux
const React = require("react");
const { Provider } = createFactories(require("react-redux"));

// TodoMVC
const { App } = createFactories(require("./containers/app"));
const { configureStore } = require("./store/configure-store");

var store = configureStore();

/**
 * This object represents a view that is responsible for rendering
 * Toolbox panel's content. The view is running inside panel's frame
 * and so, within content scope with no extra privileges.
 *
 * Rendering is done through standard web technologies like e.g.
 * React and Redux.
 */
var TodoView = createView(PanelView,
/** @lends TodoView */
{
  /**
   * Render the top level application component.
   */
  initialize: function() {
    var content = document.getElementById("content");
    var theApp = React.render(Provider({store: store},
      () => App({})
    ), content);
  }
});

// End of main.js
});
