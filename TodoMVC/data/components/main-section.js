/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");

// React
const React = require("react");

// TodoMVC
const { TodoItem } = createFactories(require("./todo-item"));
const { Footer } = createFactories(require("./footer"));
const { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } = require("../constants/todo-filters");

// Shortcuts
const { input, section, ul } = React.DOM;
const { PropTypes } = React;

const TODO_FILTERS = {
  [SHOW_ALL]: () => true,
  [SHOW_ACTIVE]: todo => !todo.completed,
  [SHOW_COMPLETED]: todo => todo.completed
};

/**
 * TODO: docs
 */
var MainSection = React.createClass(
/** @lends MainSection */
{
  displayName: "MainSection",

  getInitialState: function() {
    return { filter: SHOW_ALL };
  },

  handleClearCompleted: function() {
    const atLeastOneCompleted = this.props.todos.some(todo => todo.completed);
    if (atLeastOneCompleted) {
      this.props.actions.clearCompleted();
    }
  },

  handleShow: function(filter) {
    this.setState({ filter });
  },

  renderToggleAll: function(completedCount) {
    const { todos, actions } = this.props;

    if (todos.length > 0) {
      return (
        input({className: "toggle-all",
          type: "checkbox",
          checked: completedCount === todos.length,
          onChange: actions.completeAll
        })
      );
    }
  },

  renderFooter: function(completedCount) {
    const { todos } = this.props;
    const { filter } = this.state;
    const activeCount = todos.length - completedCount;

    if (todos.length) {
      return (
        Footer({completedCount: completedCount,
          activeCount: activeCount,
          filter: filter,
          onClearCompleted: this.handleClearCompleted.bind(this),
          onShow: this.handleShow.bind(this)
        })
      );
    }
  },

  render: function() {
    const { todos, actions } = this.props;
    const { filter } = this.state;

    const filteredTodos = todos.filter(TODO_FILTERS[filter]);
    const completedCount = todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count, 0);

    return (
      section({className: "main"},
        this.renderToggleAll(completedCount),
        ul({className: "todo-list"},
          filteredTodos.map(todo =>
            TodoItem({key: todo.id, todo: todo, actions: actions})
          )
        ),
        this.renderFooter(completedCount)
      )
    );
  }
});

MainSection.propTypes = {
  todos: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

// Exports from this module
exports.MainSection = MainSection;
});
