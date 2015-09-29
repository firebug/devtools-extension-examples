/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// React & Redux
const React = require("react");
const { combineReducers } = require("redux");
const { todos } = require("./todos");

const rootReducer = combineReducers({
  todos
});

// Exports from this module
exports.rootReducer = rootReducer;
});
