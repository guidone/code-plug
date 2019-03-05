![CodePlug](https://github.com/guidone/code-plug/blob/master/images/code_plug.png)

**Fight the Monolith**

** This is a work in progress **


**CodePlug** is not a UI component and is not a framework, it's just a way to organize the code in order to fight the **monolith**.

**What's a monolith?** Every long term project has the same enemy: the complexity. Soon or later, feature after feature, the code base looks like a monolith: components and features become tightly coupled, impossible to remove old feature and dead code and adding new features introduces new bugs.

Have you ever esitated of deleting old graphic assets from _Christmas 2010_ since your afraid that something might still use it? If the answer is yes, then **CodePlug** is for you.

How do you fight the monolith? With the _plugin-first_ method.The plugin-first method has 3 simple rules

1. Every feature is a plugin
2. All files related to a plugin are packaged in the same folder
3. If you remove the plugin, the application must not break

With the _plugin-first_ method you get:

* Removing dead code it's easier: if the feature is gone, then we can remove safely the whole directory. No more graphic arts of 2010 New Eve's day in the code base
* No need to "hide" features based on user permissions, just don't load the plugin (and the app will not break)
* No need to disable plugin based on the environment, just don't load the plugin in that environment (and the app will not break)
* Do you need to expose some features to a restricted set of beta users? Just load the plugin for these users
* Multiple version of the same app with different set of features ... you know the answer

How does it work?
It looks like a mediator pattern: each plugin registers one or more React views under some _"regions"_. A simple helper collects all the registered views and render them.
Here is the trick: the features definition is totally decoupled from its instantiation and that makes your code more robust, if the plugin is not loaded the feature it's simply not there, nothing can break the app if it's not there.

Let's make an example with a very simple button bar:

```javascript
import { Plugin, CodePlug, PluginViews } from 'code-plug';
import { Button } from 'my-ui-lib';
// this is the red button feature
class RedButton extends Plugin {
  constructor(props) {
    super(props);
    this.registerView('my_buttons', Button, {
      id: 'red',
      label: 'Red',
      style: { background-color: '#FF0000' } 
    });
  }
}
// this is the blue button feature
class BlueButton extends Plugin {
  constructor(props) {
    super(props);
    this.registerView('my_buttons', Button, {
      id: 'blue',
      label: 'Blue',
      style: { background-color: '#0000FF' } 
    });
  }
}
// the main app
class App extends React.Component {
  render() {
    return (
      <CodePlug plugins={[RedButton, BlueButton]}>
        <div className="my_app">
          <div className="buttons">
            <PluginViews 
              region="my_buttons" 
              onClick={() => alert('Clicked!')}
            />
          </div>
          <div className="main">
            ...
          </div>
        </div> 
      </CodePlug>
    );
  }
}
```
Please note that:
* Plugins can register any number of views for any region name, could be a simple button or an entire page 
* Every parameter used in the registration will be passed as props to the view when it will be rendered
* In order to manage which features/plugins are present in the app, just pass an array of plugin-class in `plugins`: how you do it (based on permissions, environment, etc) is up to you and it's out of the scope of **CodePlug**
* `PluginViews` it's just an helper that collect views for a named region and render them, every props (except _"region"_) will be passed to the rendered views
* What if you need an UI element present in another plugin? This is a **component**, something that you can re-use through the app and should be placed elsewhere (for example _/ui_), a **plugin** is something that you can remove from the app without breaking it

**You also get long term advantages with this approach**: think again at the example of the buttons, months after months of coding things with these buttons are going to get complicated, they can be visible or not - or just disabled - for various reasons (domain logic, permission logic, environment logic). With the plugin-first method the *why* is defined in the plugin at the highest level of your code (for example a button is disabled since the user has not the permission) and the *how* is defined in the views at the lowest level of the code (for example a button looks disabled with a simple CSS rule).
You are never going to mix these two, the behaviour of the buttons will always be very easy to inspect ad the top level of your code and well separated by the implementation detail of the button (for example how it's rendered when disabled).


Let's make a more complicated example with these buttons: now the button should be present only if the user has the related permission and must be disabled based on some domain logic (for example you cannot archive a blog post which is already archived)
  
```javascript
import { Plugin, CodePlug, PluginViews, FilterByPermission } from 'code-plug';
import { Button } from 'my-ui-lib';
// this is the archive button feature
class ArchiveButton extends Plugin {
  static permission = 'canArchive';
  constructor(props) {
    super(props);
    this.registerView('my_buttons', Button, ({ blogPost }) => ({
      id: 'archive',
      label: 'Archive',
      disabled: blogPost.archived,
      onClick: () => { // archive ... }
    }));
  }
}
// this is the delete button feature
class DeleteButton extends Plugin {
  static permission = 'canDelete';
  constructor(props) {
    super(props);
    this.registerView('my_buttons', Button, ({ blogPost }) => ({
      id: 'delete',
      label: 'Delete',
      disabled: blogPost.deleted,
      onClick: () => { // delete ...} 
    }));
  }
}
// the main app
class App extends React.Component {
  render() {
    return (
      <CodePlug 
        plugins={[FilterByPermission, ArchiveButton, DeleteButton]}
        user={currentUser} // has a permissions[] field
      >
        <div className="my_app">
          <div className="buttons">
            <PluginViews 
              region="my_buttons" 
              blogPost={myBlogPost} 
            />
          </div>
          <div className="main">
            // ... tha main app
          </div>
        </div> 
      </CodePlug>
    );
  }
}
```
