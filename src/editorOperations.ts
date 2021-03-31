import * as vscode from 'vscode';
import { extensionContext } from './extension';
import { TScriptCallback, TScriptInsertCallback } from './Interfaces';

export const informationRoutine = async (cb: TScriptCallback): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return Promise.reject("No editor");

  const selections = editor.selections;
  if (!selections) return Promise.resolve();

  for (const selection of selections) {
    const text = selection.isEmpty ? editor.document.getText() : getTextAtSelection(selection);

    await cb(text, extensionContext)
      .then(async data => await showInformationAsync(data))
      .catch(err => vscode.window.showErrorMessage(err));
  };
};

export const insertRoutine = async (cb: TScriptInsertCallback): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return Promise.reject("No editor");

  const selections = editor.selections;
  if (!selections) return Promise.resolve();

  for (const selection of selections) {
    await cb(extensionContext).then(async data => {
      const p = new vscode.Position(selection.end.line, selection.end.character);
      await editAsync((edit) => edit.insert(p, data));
    }).catch(err => vscode.window.showErrorMessage(err));
  }

};

export const replaceRoutine = async (cb: TScriptCallback): Promise<void> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return Promise.reject("No editor");

  const selections = editor.selections;
  if (!selections) return Promise.resolve();

  for (const selection of selections) {
    const text = selection.isEmpty ? editor.document.getText() : getTextAtSelection(selection);

    await cb(text, extensionContext).then(async data => {
      const replaceAt = selection.isEmpty ? documentRange() : selection;
      await setTextAtRange(replaceAt, data);
    }).catch(err => { vscode.window.showErrorMessage(err); });
  };

};

export const documentRange = (): vscode.Range => {
  const textEditor = vscode.window.activeTextEditor;
  const firstLine = textEditor?.document.lineAt(0);
  const lastLine = textEditor?.document.lineAt(textEditor.document.lineCount - 1);
  if (firstLine && lastLine)
    return new vscode.Range(firstLine.range.start, lastLine.range.end);
  else //this should never happen
  {
    const p = new vscode.Position(0, 0);
    return new vscode.Range(p, p);
  }

};


export const getTextAtSelection = (selection: vscode.Selection): string => {
  return vscode.window.activeTextEditor?.document.getText(new vscode.Range(selection.start, selection.end)) || "";
};

export const setTextAtRange = (selection: vscode.Selection | vscode.Range, text: string): Promise<void> => {
  return editAsync((editBuilder) => {
    if (selection !== undefined)
      editBuilder.replace(selection, text);
  });
};


export const editAsync = (cb: (editBuilder: vscode.TextEditorEdit) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
      cb(editBuilder);
    }).then(() => resolve());
  });
}

export const showInformationAsync = (str: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    vscode.window.showInformationMessage(str).then(() => resolve());
  });
}