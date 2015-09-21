/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// React & Redux
const React = require("react");
const { connect } = require("react-redux");

// Firebug SDK
const { createFactories } = require("reps/rep-utils");
const { Reps } = require("reps/reps");
const { Splitter } = createFactories(require("reps/splitter"));

// WebSockets Monitor
const { MainToolbar } = createFactories(require("../components/main-toolbar"));
const { Sidebar } = createFactories(require("../components/sidebar"));

// Shortcuts
const { div } = React.DOM;

/**
 * The top level application component responsible for rendering
 * the entire UI.
 */
var App = React.createClass({
/** @lends App */

  displayName: "App",

  getInitialState: function() {
    return { data: [] };
  },

  render: function() {
    const { dispatch, frames, selection } = this.props;

    console.log("props ", this.props);

    var leftPanel =
      div({className: "mainPanel"},
        MainToolbar({}),
        div({className: "mainPanelContent"})
      );

    var rightPanel =
      div({className: "sidePanel"},
        Sidebar({})
      );

    return (
      div({className: "mainPanelBox"},
        Splitter({
          mode: "vertical",
          min: 200,
          leftPanel: leftPanel,
          rightPanel: rightPanel,
          innerBox: div({className: "innerBox"})
        })
      )
    );
  }
});

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function mapStateToProps(state) {
  return {
    frames: state.frames,
    selection: state.selection
  };
}

// Exports from this module
exports.App = connect(mapStateToProps)(App);
});
