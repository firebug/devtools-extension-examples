/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");
const { Tabs, TabPanel } = createFactories(require("reps/tabs"));

// WebSockets Monitor
const { DetailsTab } = createFactories(require("./details-tab"));
const { StackTab } = createFactories(require("./stack-tab"));

/**
 * @template This template represents a list of packets displayed
 * inside the panel content.
 */
var Sidebar = React.createClass({
/** @lends Sidebar */

  displayName: "Sidebar",

  getInitialState: function() {
    return {
      tabActive: 1,
      data: null,
   };
  },

  onTabChanged: function(index) {
    this.setState({tabActive: index});
  },

  render: function() {
    var actions = this.props.actions;
    var tabActive = this.state.tabActive;
    var data = this.state.data || this.props.data;

    return (
      Tabs({tabActive: tabActive, onAfterChange: this.onTabChanged},
        TabPanel({className: "details", title: "Details"},
          DetailsTab({data: data, actions: actions})
        ),
        TabPanel({className: "stack", title: "Stack"},
          StackTab({data: data, actions: actions})
        )
      )
    );
  }
});

// Exports from this module
exports.Sidebar = Sidebar;
});
