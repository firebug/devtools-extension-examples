TabActor
===========
An example extension showing how to register custom Tab actor.
Instance of a tab actor is created for every browser tab.
If multiprocess support is activated it runs within the child
process.

Instructions
------------
1. Install the extension
2. Open browser Console (Menu -> Developer -> Browser Console)
3. Open a browser tab and developer tools toolbox on it (F12)
4. There should be a message in the browser Console saying:
"Response from the actor: Hello from a tab actor!"

Further Resources
-----------------
* Global Actor: https://github.com/firebug/devtools-extension-examples/tree/master/GlobalActor
* RDP: https://wiki.mozilla.org/Remote_Debugging_Protocol
* Add-on SDK: https://developer.mozilla.org/en-US/Add-ons/SDK
* DevTools API: https://developer.mozilla.org/en-US/docs/Tools/DevToolsAPI
* DevTools/Hacking: https://wiki.mozilla.org/DevTools/Hacking
