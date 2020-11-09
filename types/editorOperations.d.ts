import * as vscode from 'vscode';
import { TScriptCallback, TScriptInsertCallback } from './Interfaces';
export declare const informationRoutine: (cb: TScriptCallback) => Promise<void>;
export declare const insertRoutine: (cb: TScriptInsertCallback) => Promise<void>;
export declare const replaceRoutine: (cb: TScriptCallback) => Promise<void>;
export declare const documentRange: () => vscode.Range;
export declare const getTextAtSelection: (selection: vscode.Selection) => string;
export declare const setTextAtRange: (selection: vscode.Selection | vscode.Range, text: string) => void;
