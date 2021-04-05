# Swissknife

![Demo](data/swissknife_banner.png)

![Demo](data/demo.gif)

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/luisfontes19.vscode-swissknife?color=green&label=VS%20Code%20Marketplace&style=for-the-badge)

The developers swissknife. Do conversions and generations right out of vs code. Extendable with user scripts

Available in the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=luisfontes19.vscode-swissknife)

## Currently available scripts:

* Base64 decode
* Base64 encode
* Binary To Text
* Bip39 Mnemonic
* CSV to Markdown
* Count characters
* Count words
* Crypto currency value
* Date to Timestamp
* Eliptic Curve Key Pair
* Generate Password
* HTML Encode (AlL)
* Hex decode
* Hex encode
* Hex to RGB
* Identify hash
* JWT Decode
* Join lines
* Lorem Ipsum
* Markdown to HTML
* Md5 hash
* New Swissknife Script (JS)
* New Swissknife Script (TS)
* Password strength
* RGB To Hex
* RSA Key pair
* Random String
* Request to fetch
* SHA1 hash
* SHA256 hash
* SHA512 hash
* Self Signed Certificate
* Start Local HTTP Server
* Start Local HTTPS Server
* Stop HTTP Server
* Text To Binary
* Text to String
* Timestamp to Date
* To Camel Case
* To Lower Case
* To Morse code
* To Upper Case
* UUIDv4
* Unicode decode
* Unicode encode (js format)
* Unix/Linux Permission To Human Readable
* Url Decode
* Url Encode
* Url Encode (All Characters)
* Url Shorten
* Url Unshorten (url expand)


## Usage

You can invoke the dedicated command pallete with ```ctrl+shift+9``` for windows or ```cmd+shift+9``` for mac (when focusing the editor)

The conversions will only use the selected text by. If no text is selected the entire content of the editor will be used.
It supports multi selection and will run the script for each selection individually

**Macbook Touchbar Support**
![Touchbar Support](data/touchbar_support.png)

## Scripts Details

### Crypto currency value

Uses the API from [Cryptonator](cryptonator.com).
You can specify conversions directly from the text like:

```text
1btc to eur
```

For a list of supported currencies check [here](https://www.cryptonator.com/api/currencies)

### Identify Hash

The outcome of the operation may return multiple values, as a hashes from different algorithms have the same output format.
Still we organize the hashes from top down by most relevant.

## Privacy Note

One of the main purposes of this extension is to stop pasting data, or trusting generated data from random websites.
The extension avoids doing external web requests or logging data, for privacy.
But there are two operations where external requests are needed:

* **Crypto Currency Value** - Does a request to the cryptonator api to get the available cryptocurrencies and a request to get the current price for a specific pair. **The amount being converted is not sent**, this is calculated on the local machine.
* **Url Unshorten** - This one really needs to do the request to the short url, so it can get the redirect (full) url. But keep in mind that the full url is never reached, the extension does not follow the redirect.

## Writing Scripts

Swissknife will automatically load all scripts in its user scripting folder and you can find it by executing a command. Open you command pallete and type "Open swissknife users script folder". Or just start typing it as it will eventually be suggested.

This is the folder where you can create your custom scripts.
.
To start a new script you can also use a command provided by the extension. Open swissknife picker and type "New swissknife script".
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

The is the basic template to create scripts. In this file we created a script called "My Script". You can have as much scripts as you want per file. Its just a way of organization :)

As you can see at the end, the structure for a script consists on 3 properties: title, detail and cb.

The first two are self explanatory.

cb is the code that will be called when you script runs. And by default swissknife gives you a few methods to help getting started, through the variable 'context'.

The method doSomething is just replacing a's with b's

### Context

In context you have some nice methods to help you out, and you should use them whenever possible.

* insertRoutine(cb) - This method will insert the resolved content into the cursor on editor. It will call cb and send context as a parameter. **cb is expected to be async**
* informationRoutine(cb) - This method will create a notification with the resolved content. It will call cb and send selected text in editor (all text if no selection) and context as a parameter. **cb is expected to be async**
* replaceRoutine(cb) - This method will replace selected text in editor, with the resolved content from cb (if no text selected it replaces all text). It will call cb and send selected text in editor (all text if no selection) and context as a parameter. **cb is expected to be async**
vscode - This variable holds the [vscode api](https://code.visualstudio.com/api).

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

Inserting the input supplied by user

```js
Object.defineProperty(exports, "__esModule", { value: true });

doSomething = async (context) => {
  return new Promise((resolve, reject) => {

    context.vscode.window.showInputBox({ prompt: "Say something" }).then(answer => {
      resolve(answer);
    });

  });
}
const scripts = [
  {
    title: "My Script3",
    detail: "This script does something",
    cb: (context) => context.insertRoutine(doSomething)
  },
]

exports.default = scripts;
```
