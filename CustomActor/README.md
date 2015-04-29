CustomActor
===========
An example extension showing how to implement new remotable feature
and register custom tab actor (based on RDP protocol, see link below)
This example also shows how to communicate between chrome and content
scope through MessageChannel.

Instructions
------------
1. Install the extension
2. Open developer tools toolbox (F12 or Menu -> Developer -> Toogle Tools)
3. Select the 'My Panel' panel
4. Click on 'Register Actor' button in the Panel.
6. You should see the following messages: 'registered', 'attached' and
'Hello from the backend!'

Further Resources
-----------------
* RDP: https://wiki.mozilla.org/Remote_Debugging_Protocol
* Add-on SDK: https://developer.mozilla.org/en-US/Add-ons/SDK
* DevTools API: https://developer.mozilla.org/en-US/docs/Tools/DevToolsAPI
* DevTools/Hacking: https://wiki.mozilla.org/DevTools/Hacking
