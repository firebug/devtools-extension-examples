DOM Inspector
=============
An example extension showing how to send DOM nodex over RDP

Blocked by the platform: [Bug 1146889](https://bugzilla.mozilla.org/show_bug.cgi?id=1146889) - TypeError: v is undefined (protocol.js)

Instructions
------------
1. Install the extension
2. Open developer tools toolbox (F12 or Menu -> Developer -> Toogle Tools)
3. Open Browser Console (Menu -> Developer -> Browser Console)
4. Click into the page content. You should see the following message:
   "Click event from the backend!" + an object that represents the clicked
   target element (aka Front object).
 
Further Resources
-----------------
* RDP: https://wiki.mozilla.org/Remote_Debugging_Protocol
* Add-on SDK: https://developer.mozilla.org/en-US/Add-ons/SDK
* DevTools API: https://developer.mozilla.org/en-US/docs/Tools/DevToolsAPI
* DevTools/Hacking: https://wiki.mozilla.org/DevTools/Hacking
