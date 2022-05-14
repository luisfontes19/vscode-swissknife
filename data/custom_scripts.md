# Writing Swissknife scripts

Swissknife will automatically load all scripts in its user scripting folder and you can find it by executing a command. Open you command pallete and type "Open swissknife users script folder". Or just start typing it as it will eventually be suggested.
This is the folder where you can create your custom scripts.

To start a new script you can also use a command provided by the extension. Open swissknife picker and type "New swissknife script".

## Script Reloading

Scripts are loaded into the extension when initializing VS Code, so when you create a custom script you'll need to reload the scripts. To make it easier for development, the extension has a command "Reload Swissknife Scripts" that you can call from the VS Code command pallette (do not confuse with the swissknife's script launcher).

Remember that everytime you do a change in a script in the user script folder you need to reload scripts.

## Starting Template

You can chose the TS or JS version according to what you're more comfortable with. TS will be more complex as you need to transpile it to JS.
We'll go with Javascript.
This is the base structure of the script:

```js
Object.defineProperty(exports, "__esModule", { value: true });

exports.doSomething = async (text, context) => {
  return new Promise((resolve, reject) => {

    resolve(text.replace(/a/g, "b"));

  });
}
const scripts = [
  {
    title: "My Script",
    detail: "This script does something",
    cb: (context) => context.replaceRoutine(exports.doSomething)
  },
]

exports.default = scripts;
```

This is the basic template to create scripts. In this file we created a script called "My Script". You can have as much scripts as you want per file. Its just a way of organization :)
As you can see at the end, the structure for a script consists on 3 properties: title, detail and cb.
The first two are self explanatory.
cb is the code that will be called when you script runs. And by default swissknife gives you a few methods to help getting started, through the variable 'context'.
The method doSomething is just replacing a's with b's

## Context

In context you have some nice methods to help you out, and you should use them whenever possible.

* insertRoutine(cb) - This method will insert the resolved content into the cursor on editor. It will call cb and send context as a parameter. **cb is expected to be async**
* informationRoutine(cb) - This method will create a notification with the resolved content. It will call cb and send selected text in editor (all text if no selection) and context as a parameter. **cb is expected to be async**
* replaceRoutine(cb) - This method will replace selected text in editor, with the resolved content from cb (if no text selected it replaces all text). It will call cb and send selected text in editor (all text if no selection) and context as a parameter. **cb is expected to be async**
* vscode - This variable holds the [vscode api](https://code.visualstudio.com/api/references/vscode-api).
* modules - This variable is an array of all JS modules inside the [script (and lib) folder](https://github.com/luisfontes19/vscode-swissknife/tree/master/src/scripts). You can use them to call methods from the native scripts, to reuse code logic. Ex: context.modules.passwords.generateSecureCharCode())

The use of this methods is optional. If you feel that its easier to just work directly with vscode api you can also do it:

```js
Object.defineProperty(exports, "__esModule", { value: true });

const scripts = [
  {
    title: "My Script2",
    detail: "This script does something",
    cb: (context) => {
      console.log(context)
      const editor = context.vscode.window.activeTextEditor;
      editor.edit((edit) => {
        edit.insert(editor.selection.myactive, "Doing stuff")
      });
    }
  },
]

exports.default = scripts;
```
## More Examples

```js
Object.defineProperty(exports, "__esModule", { value: true });

//Uses the context.modules to reuse existing code. Starts an http server
exports.startServer = async (context) => {
  context.modules.lib.server.start({ port: 1234 })
}

//uses context.userModules to invoke another user script
//there will be an entry in context.userModules with the name of the file with scripts loaded
//all exported methods are accessible... 
//If  invoking a script remember to send the right params, like the context
exports.anotherUserScript = async (context) => {
  context.modules.othermodule.hellowWorld(context);
}

//Ask user for input
exports.askInput = async (context) => {
  return new Promise((resolve, reject) => {
    context.vscode.window.showInputBox({ prompt: "Say something" }).then(answer => {
      resolve(answer);
    });
  });
}
const scripts = [
  {
    title: "Ask Input",
    detail: "Asks user input and adds it to the editor",
    cb: (context) => context.insertRoutine(this.askInput)
  },
  {
    title: "Start server on port 1234",
    detail: "Starts a server on port 1234",
    cb: (context) => this.startServer(context)
  },
  {
    title: "Call Another User script",
    detail: "Calls Another User script",
    cb: (context) => context.insertRoutine(this.anotherUserScript)
  },
]

exports.default = scripts;
```

The best place to see examples is to check the [native scripts](https://github.com/luisfontes19/vscode-swissknife/tree/master/src/scripts) bundled with the extension.
