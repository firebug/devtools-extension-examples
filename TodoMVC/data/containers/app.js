/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");

// React & Redux
const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");

// TodoMVC
const { Header } = createFactories(require("../components/header"));
const { MainSection } = createFactories(require("../components/main-section"));
const TodoActions = require("../actions/todos");

// Shortcuts
const { div } = React.DOM;
const { PropTypes } = React;

/**
 * TODO: docs
 */
var App = React.createClass(
/** @lends App */
{
  displayName: "App",

  render: function() {
    const { todos, dispatch } = this.props;
    const actions = bindActionCreators(TodoActions, dispatch);

    return (
      div({}, 
        Header({addTodo: actions.addTodo}),
        MainSection({todos: todos, actions: actions})
      )
    );
  }
});

App.propTypes = {
  todos: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    todos: state.todos
  };
}

// Exports from this module
exports.App = connect(mapStateToProps)(App);
});
