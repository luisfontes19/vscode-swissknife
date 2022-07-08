import * as vscode from 'vscode'

export interface IScriptQuickPickItem {
  label: string
  alwaysShow: boolean
  detail: string
  cb: TCallback
}

export type TScriptCallback = (data: string, context: ISwissKnifeContext) => Promise<string>
export type TScriptInsertCallback = (context: ISwissKnifeContext) => Promise<string>
export type TCallback = (context: ISwissKnifeContext) => Promise<void>

export interface IScript {
  title: string
  detail: string
  cb: TCallback
}


export interface ISwissKnifeContext {
  vscode: typeof vscode
  insertRoutine: (cb: TScriptInsertCallback) => Promise<void>
  replaceRoutine: (cb: TScriptCallback) => Promise<void>
  informationRoutine: (cb: TScriptCallback) => Promise<void>
  modules: any,
  extensionPath: string,
  development: boolean
}