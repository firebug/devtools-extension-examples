TitleManager
============
An example extension showing how to access 'window' global
in the web page and also register new Console command-line
commands.

This extension registers a new command line commands that
allows to get/set window title.

Instructions
------------
1. Install the extension
3. Open a browser tab and developer tools toolbox on it (F12)
4. Switch to the Console panel
5. Click `Get Title` button in the Toolbar. The title should be
logged in the Console panel.
6. Type `getTitle()` or `setTitle('New window title')` in the
command line to get/set title of the window/tab.

Further Resources
-----------------
* RDP: https://wiki.mozilla.org/Remote_Debugging_Protocol
* Add-on SDK: https://developer.mozilla.org/en-US/Add-ons/SDK
* DevTools API: https://developer.mozilla.org/en-US/docs/Tools/DevToolsAPI
* DevTools/Hacking: https://wiki.mozilla.org/DevTools/Hacking
