/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

const types = {
  CLEAR: "CLEAR",
  ADD_FRAME: "ADD_FRAME"
}

function clear() {
  return { type: types.CLEAR };
}

function addFrame(frame) {
  return { type: types.ADD_FRAME, frame: frame };
}

// Exports from this module
exports.clear = clear;
exports.addFrame = addFrame;
exports.types = types;
});

