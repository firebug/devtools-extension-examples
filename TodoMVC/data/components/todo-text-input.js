/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// React
const React = require("react");

// Shortcuts
const { input } = React.DOM;
const { PropTypes } = React;

/**
 * TODO: docs
 */
var TodoTextInput = React.createClass(
/** @lends TodoTextInput */
{
  displayName: "TodoTextInput",

  getInitialState: function() {
    return {
      text: this.props.text || ""
    };
  },

  handleSubmit: function(e) {
    const text = e.target.value.trim();
    if (e.which === 13) {
      this.props.onSave(text);
      if (this.props.newTodo) {
        this.setState({ text: "" });
      }
    }
  },

  handleChange: function(e) {
    this.setState({ text: e.target.value });
  },

  handleBlur: function(e) {
    if (!this.props.newTodo) {
      this.props.onSave(e.target.value);
    }
  },

  render: function() {
    var classNames = [];

    if (this.props.editing) {
      classNames.push("edit");
    }

    if (this.props.newTodo) {
      classNames.push("new-todo");
    }

    return (
      input({className: classNames.join(" "),
        type: "text",
        placeholder: this.props.placeholder,
        autoFocus: "true",
        value: this.state.text,
        onBlur: this.handleBlur.bind(this),
        onChange: this.handleChange.bind(this),
        onKeyDown: this.handleSubmit.bind(this)
      })
    )
  }
});

TodoTextInput.propTypes = {
  onSave: PropTypes.func.isRequired,
  text: PropTypes.string,
  placeholder: PropTypes.string,
  editing: PropTypes.bool,
  newTodo: PropTypes.bool
};

// Exports from this module
exports.TodoTextInput = TodoTextInput;
});
