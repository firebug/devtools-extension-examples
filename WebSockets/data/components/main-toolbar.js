/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");
const { Toolbar, ToolbarButton } = createFactories(require("reps/toolbar"));

// WebSockets Monitor
const { clear } = require("../actions/frames");

/**
 * @template This object is responsible for rendering the toolbar
 * in Actors tab
 */
var MainToolbar = React.createClass({
/** @lends MainToolbar */

  displayName: "MainToolbar",

  // Commands

  onPause: function() {
  },

  onClear: function() {
    this.props.dispatch(clear());
  },

  // Render

  render: function() {
    // xxxHonza: localization
    return (
      Toolbar({className: "toolbar"},
        ToolbarButton({bsSize: "xsmall", onClick: this.onPause},
          "Pause"
        ),
        ToolbarButton({bsSize: "xsmall", onClick: this.onClear},
          "Clear"
        )
      )
    );
  },
});

// Exports from this module
exports.MainToolbar = MainToolbar;
});
