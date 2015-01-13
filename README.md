Firefox DevTools Extension Examples
===================================

This repository contains extensions for Firefox native developer tools
showing how to build extensions and use existing platform API.

Use [JPM](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm)
to run example extensions.

Run with Firefox Nightly on OSX:

`jpm run -b /Applications/FirefoxNightly.app`

See also: [Hacking on Firebug](https://github.com/firebug/firebug.next#hacking-on-firebugnext-aka-firebug-3)

HelloWorld
----------
This example shows basic architecture of an extension for Firefox developer
tools. It handles basic toolbox initialization events and registers
a new panel.

Related API:

    Panel
    Tool

Related Events:

    `toolbox-ready`
    `toolbox-destroy`
    `toolbox-destroyed`

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
the client and sever side of new tool. Remotable feature in this extension
is implemented as a `tab actor`.

Related API:

    Actor
    ActorFront
    registerTabActor()

GlobalActor
-----------
This extension shows how to implement tools/features that can be used
to debug/inspect remote devices. Learn how to properly implement both:
the client and sever side of new tool. Remotable feature in this extension
is implemented as a `global actor`.

Related API:

    Actor
    ActorFront
    registerGlobalActor()

ConsoleListener
---------------
This extension shows how to intercept and modify logs in the Console panel.

Related Events:

    `webconsole-ready`
    `new-messages`

HelloReact
----------
An example extension showing how to integrate standard web technologies
with an extension.

Related Libs:
* Bootstrap: http://getbootstrap.com/
* React: http://facebook.github.io/react/
* React Bootstrap: http://react-bootstrap.github.io/components.html
