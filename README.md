Firefox DevTools Extension Examples
===================================

This repository contains extensions for Firefox native developer tools
showing how to build extensions and use existing platform API.

Use [JPM](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm)
to run example extensions.

Run with Firefox Nightly on OSX:

`jpm run -b /Applications/FirefoxNightly.app`


CustomTheme
-----------
This extension shows how to implement new theme for developer tools Toolbox.

Related API:

    gDevTools.registerTheme()
    gDevTools.unregisterTheme()

CustomActor
-----------
This extension shows how to implement tools/features that can be used
to debug/inspect remote devices. Learn how to properly implement both:
the client and sever side of new tool.

Related API:

    Actor
    ActorFront
    registerActor()

ConsoleListener
---------------
This extension shows how to intercept and modify logs in the Console panel.

Related Events:

    `webconsole-ready`
    `new-messages`
