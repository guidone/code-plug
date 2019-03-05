** Work in progress **

CodePlug is not a UI component and is not a framework, it's just a way to organize the code.
Every long term project has the same enemy: the complexity. Soon or later, feature after feature, the code base looks
like a monolith: components and features become tightly coupled, it's difficult to remove old feature and dead code
and adding new features introduces new bugs.

How do you fight the monolith? With the plugin first method.
The plugin first method has 3 simple rules

* Every feature is a plugin
* All files related to a plugin are packaged in the same folder
* If you remove the plugin, the application must not break

* Removing dead code it' easier: if the feature is gone, then we can remove safely the whole directory. No more graphic
arts of 2010 New Eve's day in the code base
* No need to "hide" features based on user permissions, just don't load the plugin (and the app will not break)
* No need to disable plugin based on the environment, just don't load the plugin in that environment
* What to expose some feature to a restricted set of beta-users? Just load the plugin for these users
* Multiple version of the same app with different set of features ... you know the answer

How does it work?




