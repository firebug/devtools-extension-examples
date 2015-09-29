/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

// Redux
const { createStore } = require("redux");

// TodoMVC
const { rootReducer } = require("../reducers/index");

function configureStore(initialState) {
  const store = createStore(rootReducer, initialState);

  // Enable Webpack hot module replacement for reducers
  /*if (module.hot) {
    module.hot.accept("../reducers/index", () => {
      const nextReducer = require("../reducers/index");
      store.replaceReducer(nextReducer);
    });
  }*/

  return store;
}

// Exports from this module
exports.configureStore = configureStore;
});
