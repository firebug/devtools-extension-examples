/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Require external modules
var $ = require("jquery");
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Shortcuts
var DropdownButton = React.createFactory(ReactBootstrap.DropdownButton);
var MenuItem = React.createFactory(ReactBootstrap.MenuItem);

// React component
var DropdownBox = React.createClass({
  render: function() {
    return (
      DropdownButton({eventKey: 3, title: "Dropdown"},
        MenuItem({eventKey: 1}, "Action"),
        MenuItem({eventKey: 2}, "Another action"),
        MenuItem({eventKey: 3}, "Something else"),
        MenuItem({divider: "true"}),
        MenuItem({eventKey: 4}, "Separated Link")
      )
    )
  }
});

var dropdownBox = React.createFactory(DropdownBox);

// Rendering
function renderDropdownButton() {
  React.render(
    dropdownBox(),
    document.getElementById("dropdown")
  );
}

exports.renderDropdownButton = renderDropdownButton;

});
