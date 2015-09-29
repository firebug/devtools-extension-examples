/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// React
const React = require("react");

// TodoMVC
const { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } = require("../constants/todo-filters");

// Shortcuts
const { div, span, strong, a, button, ul, li, footer } = React.DOM;
const { PropTypes } = React;

// Localization
const FILTER_TITLES = {
  [SHOW_ALL]: "All",
  [SHOW_ACTIVE]: "Active",
  [SHOW_COMPLETED]: "Completed"
};

/**
 * TODO: docs
 */
var Footer = React.createClass(
/** @lends Footer */
{
  displayName: "Footer",

  renderTodoCount: function() {
    const { activeCount } = this.props;
    const itemWord = activeCount === 1 ? "item" : "items";

    return (
      span({className: "todo-count"},
        strong({}, activeCount || "No"),
        span({}, " "),
        span({}, itemWord + " left")
      )
    );
  },

  renderFilterLink: function(filter) {
    const title = FILTER_TITLES[filter];
    const { filter: selectedFilter, onShow } = this.props;

    var className = filter === selectedFilter ? "selected" : "";
    return (
      a({className: className,
        style: {cursor: "hand"},
        onClick: () => onShow(filter)},
        title
      )
    );
  },

  renderClearButton: function() {
    const { completedCount, onClearCompleted } = this.props;
    if (completedCount > 0) {
      return (
        button({className: "clear-completed", onClick: onClearCompleted},
          "Clear completed"
        )
      );
    }
  },

  render: function() {
    var filters = [SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED];
    var items = filters.map(filter =>
      li({key: filter},
        this.renderFilterLink(filter)
      )
    )

    return (
      footer({className: "footer"},
        this.renderTodoCount(),
        ul({className: "filters"}, items),
        this.renderClearButton()
      )
    );
  }
});

Footer.propTypes = {
  completedCount: PropTypes.number.isRequired,
  activeCount: PropTypes.number.isRequired,
  filter: PropTypes.string.isRequired,
  onClearCompleted: PropTypes.func.isRequired,
  onShow: PropTypes.func.isRequired
};

// Exports from this module
exports.Footer = Footer;
});
