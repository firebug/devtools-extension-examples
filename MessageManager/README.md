Message Manager
===============
An example extension showing how to communicate between a chrome scope
(extension) and content scope (panel iframe with type="content")

Instructions
------------
1. Install the extension
2. Open developer tools Toolbox (F12 or Menu -> Developer -> Toogle Tools)
3. Open Browser Console (Menu -> Developer -> Browser Console))
4. Select the `My Panel` panel
5. You should see "Message from chrome: Hello from chrome scope!" in the console
6. Click anywhere in the panel content
7. You should see "Message from content: Hello from content scope!" in the console

Further Resources
-----------------
* Firebug.next: https://github.com/firebug/firebug.next
* DevTools Extension Examples: https://github.com/firebug/devtools-extension-examples
* Add-on SDK: https://developer.mozilla.org/en-US/Add-ons/SDK
* DevTools API: https://developer.mozilla.org/en-US/docs/Tools/DevToolsAPI
* Coding Style: https://github.com/mozilla/addon-sdk/wiki/Coding-style-guide
* DevTools/Hacking: https://wiki.mozilla.org/DevTools/Hacking
