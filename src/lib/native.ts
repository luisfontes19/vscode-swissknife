
export const scriptTemplateJs = (): string => {
  return `Object.defineProperty(exports, "__esModule", { value: true });


//text if the selected text in editor (or all)
//if using insertRoutine this variable doesn't exist
//context gives you the same as in scripts array
exports.doSomething = async (text, context) => {
  return new Promise((resolve, reject) => {

    resolve(text.replace(/a/g, "b"));

  });
}


//each method that you want to export should be an entry in 'scripts' variable. 
//this variable can be renamed but the structure is mandatory. 
//swissknife will get everything from the 'default' export.
//the extension provides you with some methods to help you out through variable context:
//
// - insertRoutine(cb): will insert the return  of cb in editor at cursor
// - replaceRoutine(cb): will call cb sending the text in editor. 
//      If no text is selected will send entire content. 
//      If editor has selections for each will call cb, 
//      Will replace each supplied input with the return of cb
// - informationRoutine(cb): will call cb sending the text in editor. 
//      If no text is selected will send entire content. 
//      If editor has selections for each will call cb, 
//      Will display an information message with the return of cb
// - vscode: This is the variable available for vscode extensions with the entire API. 
//      Read the docs for more info (https://code.visualstudio.com/api)
// - modules: This variable is an array of all JS modules inside the script (and lib) folder. You can use them to call methods from the native scripts, to reuse code logic
//          You can see them here: https://github.com/luisfontes19/vscode-swissknife/tree/master/src/scripts
//          Usage examples: context.modules.passwords.generateSecureCharCode())
const scripts = [
  {
    title: "My Script1",
    detail: "This script does something",
    cb: (context) => context.replaceRoutine(exports.doSomething)
  },
]

exports.default = scripts;`
}


export const scriptTemplateTs = (): string => {
  return `import { IScript, ISwissKnifeContext } from '../Interfaces';

export const doSomething = async (text: string, context: ISwissKnifeContext): Promise<string> => {
  return text;
}


//each method that you want to export should be an entry in 'scripts' variable. 
//this variable can be renamed but the structure is mandatory. 
//swissknife will get everything from the 'default' export.
//the extension provides you with some methods to help you out through variable context:
//
// - insertRoutine(cb): will insert the return  of cb in editor at cursor
// - replaceRoutine(cb): will call cb sending the text in editor. 
//      If no text is selected will send entire content. 
//      If editor has selections for each will call cb, 
//      Will replace each supplied input with the return of cb
// - informationRoutine(cb): will call cb sending the text in editor. 
//      If no text is selected will send entire content. 
//      If editor has selections for each will call cb, 
//      Will display an information message with the return of cb
// - vscode: This is the variable available for vscode extensions with the entire API. 
//      Read the docs for more info (https://code.visualstudio.com/api)
// - modules: This variable is an array of all JS modules inside the script (and lib) folder. You can use them to call methods from the native scripts, to reuse code logic
//          You can see them here: https://github.com/luisfontes19/vscode-swissknife/tree/master/src/scripts
//          Usage examples: context.modules.passwords.generateSecureCharCode())
const scripts: IScript[] = [
  {
    title: "My Script",
    detail: "This script does something",
    cb: (context: ISwissKnifeContext) => context.generatorRoutine(doSomething)
  },
]

export default scripts;`
}
