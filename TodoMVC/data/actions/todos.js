/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Firebug.SDK
const types = require("../constants/action-types");

function addTodo(text) {
  return { type: types.ADD_TODO, text };
}

function deleteTodo(id) {
  return { type: types.DELETE_TODO, id };
}

function editTodo(id, text) {
  return { type: types.EDIT_TODO, id, text };
}

function completeTodo(id) {
  return { type: types.COMPLETE_TODO, id };
}

function completeAll() {
  return { type: types.COMPLETE_ALL };
}

function clearCompleted() {
  return { type: types.CLEAR_COMPLETED };
}

// Exports from this module
exports.addTodo = addTodo;
exports.deleteTodo = deleteTodo;
exports.editTodo = editTodo;
exports.completeTodo = completeTodo;
exports.clearCcompleted = clearCompleted;
});

