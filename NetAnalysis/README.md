NetAnalysis
===========
An example showing how to perform custom analysis of data collected by
the Network panel. Check out how to get all data as HAR object.
See also: http://www.softwareishard.com/blog/har-12-spec/

Instructions
------------
1. Install the extension
2. Open developer tools toolbox (F12 or Menu -> Developer -> Toogle Tools)
3. Select the 'Network' panel
4. You should see a 'YSlow' button at the bottom right corner.
5. Click the button and check Browser Console (Ctrl+Shift+J or Menu -> Developer -> Browser Console),
to see the HAR object.
6. Check the source code, it shows how to get all data collected by the Network panel as HAR object.

Further Resources
-----------------
* HAR Spec: http://www.softwareishard.com/blog/har-12-spec/
* HAR Exporter: https://github.com/mozilla/gecko-dev/blob/master/browser/devtools/netmonitor/har/har-exporter.js
* HAR Builder: https://github.com/mozilla/gecko-dev/blob/master/browser/devtools/netmonitor/har/har-builder.js
* DevTools API: https://developer.mozilla.org/en-US/docs/Tools/DevToolsAPI
* DevTools/Hacking: https://wiki.mozilla.org/DevTools/Hacking


Screenshot
----------
The following screenshot shows the additional button that can perform
analysis similarly to what e.g. the well known YSlow extension does.
The screenshot is taken from Firefox native DevTools with Firebug
theme activated.

![](https://raw.githubusercontent.com/firebug/devtools-extension-examples/master/NetAnalysis/docs/images/yslow-button.png)
