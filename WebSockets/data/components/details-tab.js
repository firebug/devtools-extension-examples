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
 * TODO: docs
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
    var selectedFrame = this.props.selection || {};
    console.log("details", this.props)

    return (
      DIV({className: "details"},
        TreeView({key: "detailsTabTree", data: selectedFrame})
      )
    );
  }
});

// Exports from this module
exports.DetailsTab = DetailsTab;
});
