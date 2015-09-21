/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

const { types } = require("../actions/frames");

const initialState = {
  frames: [],
  selection: null
};

function frames(state = initialState, action) {
  switch (action.type) {
  case types.ADD_FRAME:
    return [...state.frames, action.frame];

  case types.CLEAR:
    return [];

  default:
    return state;
  }
}

// Exports from this module
exports.frames = frames;
});

