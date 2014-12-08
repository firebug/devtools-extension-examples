/* See license.txt for terms of usage */
/* jshint esnext: true */
/* global require: true, exports: true, Services: true, dump: true */

"use strict";

const { Cu } = require("chrome");

var Trace = {
  sysout: function(msg, object) {
    console.log(msg, object);
  }
};

try {
  // Use Tracing Console extension for logging if available.
  // https://github.com/firebug/tracing-console
  var scope = {};
  Cu["import"]("resource://fbtrace/firebug-trace-service.js", scope);
  Trace = scope.traceConsoleService.getTracer("extensions.firebug");
}
catch(err) {
}

exports.Trace = Trace;
