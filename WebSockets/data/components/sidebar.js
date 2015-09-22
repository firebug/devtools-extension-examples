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
const { PayloadTab } = createFactories(require("./payload-tab"));

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
   };
  },

  onTabChanged: function(index) {
    this.setState({tabActive: index});
  },

  render: function() {
    var tabActive = this.state.tabActive;

    // xxxHonza: localization
    return (
      Tabs({tabActive: tabActive, onAfterChange: this.onTabChanged},
        TabPanel({className: "details", title: "Details"},
          DetailsTab(this.props)
        ),
        TabPanel({className: "payload", title: "Payload"},
          PayloadTab(this.props)
        )/*,
        TabPanel({className: "stack", title: "Stack"},
          StackTab(this.props)
        )*/
      )
    );
  }
});

// Exports from this module
exports.Sidebar = Sidebar;
});
