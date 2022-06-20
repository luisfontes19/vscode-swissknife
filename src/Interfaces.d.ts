import * as vscode from 'vscode'
export interface IScriptQuickPickItem {
    title: string
    alwaysShow: boolean
    detail: string
    cb: TCallback
}
export declare type TScriptCallback = (data: string, context: ISwissKnifeContext) => Promise<string>
export declare type TScriptInsertCallback = (context: ISwissKnifeContext) => Promise<string>
export declare type TCallback = (context: ISwissKnifeContext) => Promise<void>
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
    modules: any
}
