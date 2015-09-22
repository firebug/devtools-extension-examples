/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// Firebug.SDK
const { createFactories } = require("reps/rep-utils");

// Constants
const { table, thead, th, tbody, tr, td } = React.DOM;

/**
 * This components implements the main table layout for list of frames.
 */
var FrameTable = React.createClass({
/** @lends FrameTable */

  displayName: "FrameTable",

  render: function() {
    var frames = this.props.frames.frames;

    // Render list frames.
    var rows = frames.map(frame => FrameRow({frame: frame}));
    return (
      table({className: "frameTable"},
        thead({className: "frameTHead"},
          tr({},
            th({className: "frameHeader"}, "Socket ID"),
            th({className: "frameHeader"}, "Payload"),
            th({className: "frameHeader"}, "Mask Bit")
          )
        ),
        tbody({className: "frameTBody"},
          rows
        )
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

  render: function() {
    var frame = this.props.frame;
    var data = frame.header ? frame.header : frame.maskBit;
    var className = "frameRow " + (frame.header ? "sent" : "received")

    return (
      tr({className: className},
        td({}, frame.webSocketSerialID),
        td({}, data.payload),
        td({}, data.maskBit ? "true" : "false")
      )
    );
  }
}));

// Exports from this module
exports.FrameTable = FrameTable;
});
