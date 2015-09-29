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
const { h1, div, input, label, button, li } = React.DOM;
const { PropTypes } = React;

/**
 * Represent single Todo item.
 */
var TodoItem = React.createClass(
/** @lends TodoItem */
{
  getInitialState: function() {
    return {
      editing: false
    };
  },

  handleDoubleClick: function() {
    this.setState({editing: true});
  },

  handleSave: function(id, text) {
    if (text.length === 0) {
      this.props.deleteTodo(id);
    } else {
      this.props.editTodo(id, text);
    }
    this.setState({editing: false});
  },

  render: function() {
    const {todo, actions} = this.props;

    var element;
    if (this.state.editing) {
      element = (
        TodoTextInput({text: todo.text,
          editing: this.state.editing,
          onSave: text => this.handleSave(todo.id, text)
        })
      )
    } else {
      element = (
        div({className: "view"},
          input({className: "toggle",
            type: "checkbox",
            checked: todo.completed,
            onChange: () => actions.completeTodo(todo.id)
          }),
          label({onDoubleClick: this.handleDoubleClick.bind(this)},
            todo.text
          ),
          button({className: "destroy",
            onClick: () => actions.deleteTodo(todo.id)
          })
        )
      );
    }

    var classNames = [];
    if (todo.completed) {
      classNames.push("completed");
    }

    if (this.state.editing) {
      classNames.push("editing");
    }

    return (
      li({className: classNames.join(" ")},
        element
      )
    );
  }
});

TodoItem.propTypes = {
  todo: PropTypes.object.isRequired,
  editTodo: PropTypes.func.isRequired,
  deleteTodo: PropTypes.func.isRequired,
  completeTodo: PropTypes.func.isRequired
};

// Exports from this module
exports.TodoItem = TodoItem;
});
