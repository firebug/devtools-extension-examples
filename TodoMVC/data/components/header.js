/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");

// React
const React = require("react");

// TodoMVC
const { TodoTextInput } = createFactories(require("./todo-text-input"));

// Shortcuts
const { header, h1 } = React.DOM;
const { PropTypes } = React;

/**
 * TODO: docs
 */
var Header = React.createClass(
/** @lends Header */
{
  displayName: "Header",

  handleSave: function(text) {
    if (text.length !== 0) {
      this.props.addTodo(text);
    }
  },

  render: function() {
    return (
      header({className: "header"},
        h1({}, "Todos"),
        TodoTextInput({newTodo: true,
          onSave: this.handleSave.bind(this),
          placeholder: "What needs to be done?"
        })
      )
    );
  }
});

Header.propTypes = {
  addTodo: PropTypes.func.isRequired
};

// Exports from this module
exports.Header = Header;
});
