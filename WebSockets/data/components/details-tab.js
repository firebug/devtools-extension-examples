/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/repository");
const { TreeView } = require("reps/tree-view");

// Shortcuts
const { DIV } = Reps.DOM;

/**
 * @template This template represents a list of packets displayed
 * inside the panel content.
 */
var DetailsTab = React.createClass({
/** @lends DetailsTab */

  displayName: "DetailsTab",

  getInitialState: function() {
    return {
      selectedFrame: null
    };
  },

  render: function() {
    var selectedFrame = this.props.selectedFrame || {};

    return (
      DIV({className: "details"},
        TreeView({key: "detailsTab", data: selectedFrame})
      )
    );
  }
});

// Exports from this module
exports.DetailsTab = DetailsTab;
});
