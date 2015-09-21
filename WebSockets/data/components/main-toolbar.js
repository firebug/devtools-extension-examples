/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");
const { Toolbar, ToolbarButton } = createFactories(require("reps/toolbar"));

/**
 * @template This object is responsible for rendering the toolbar
 * in Actors tab
 */
var MainToolbar = React.createClass({
/** @lends MainToolbar */

  displayName: "MainToolbar",

  render: function() {
    return (
      Toolbar({className: "toolbar"},
        ToolbarButton({bsSize: "xsmall", onClick: this.onPause},
          "Pause"
        )
      )
    );
  },

  // Commands

  onPause: function(/*event*/) {
  },
});

// Exports from this module
exports.MainToolbar = MainToolbar;
});
