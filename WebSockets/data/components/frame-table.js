/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// WebSockets Monitor
const { selectFrame } = require("../actions/selection");

// Constants
const { table, thead, th, tbody, tr, td, tfoot, div } = React.DOM;

/**
 * This components implements the main table layout for list of frames.
 */
var FrameTable = React.createClass({
/** @lends FrameTable */

  displayName: "FrameTable",

  render: function() {
    var frames = this.props.frames.frames;

    // Render list frames.
    var rows = frames.map(frame => FrameRow({
      selection: this.props.selection,
      frame: frame,
      dispatch: this.props.dispatch
    }));

    return (
      table({className: "frameTable"},
        thead({className: "frameTHead"},
          tr({},
            th({className: "direction"}),
            th({className: "socketId"}, "Socket ID"),
            th({className: "payload"}, "Payload"),
            th({className: "bit"}, "MaskBit"),
            th({className: "bit"}, "FinBit")
          )
        ),
        tbody({className: "frameTBody"},
          rows
        )/*,
        tfoot({className: "frameTFoot"},
          tr({},
            td({colSpan: 5}, "Summary: ")
          )
        )*/
      )
    );
  }
});

/**
 * Represents a row within the frame list.
 */
var FrameRow = React.createFactory(React.createClass({
/** @lends FrameRow */

  displayName: "FrameRow",

  onClick: function() {
    if (this.props.frame != this.props.selection) {
      this.props.dispatch(selectFrame(this.props.frame));
    }
  },

  render: function() {
    var frame = this.props.frame;
    var data = frame.header ? frame.header : frame.maskBit;
    var className = "frameRow " + (frame.header ? "send" : "receive");
    var tooltipText = frame.header ? "Sent" : "Received";

    if (this.props.selection == frame) {
      className += " selected";
    }

    var onClick = this.onClick.bind(this);
    return (
      tr({className: className, onClick: onClick},
        td({className: "direction"},
          div({title: tooltipText})
        ),
        td({className: "socketId"}, frame.webSocketSerialID),
        td({className: "payload"}, data.payload),
        td({className: "bit"}, data.maskBit ? "true" : "false"),
        td({className: "bit"}, data.finBit ? "true" : "false")
      )
    );
  }
}));

// Exports from this module
exports.FrameTable = FrameTable;
});
