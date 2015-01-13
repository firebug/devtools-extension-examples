/* See license.txt for terms of usage */

// RequireJS configuration
require.config({
  baseUrl: ".",
  paths: {
    "jquery": "lib/jquery/jquery",
    "react": "lib/react/react",
    "bootstrap": "lib/bootstrap/js/bootstrap",
    "react-bootstrap": "lib/react-bootstrap/react-bootstrap",
  }
});

// Load the main application module
requirejs(["app/index"]);
