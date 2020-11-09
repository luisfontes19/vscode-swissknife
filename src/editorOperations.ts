import * as vscode from 'vscode';
import { extensionContext } from './extension';
import { TScriptCallback, TScriptInsertCallback } from './Interfaces';

export const informationRoutine = (cb: TScriptCallback): Promise<void> => {
  return new Promise((resolve, reject) => {

    const editor = vscode.window.activeTextEditor;

    if (!editor) reject("No editor");
    else {
      const text = editor.document.getText();

      cb(text, extensionContext).then(data => {
        vscode.window.showInformationMessage(data);
        resolve();
      }).catch(err => { vscode.window.showErrorMessage(err); reject(); });
    }

  });
};

export const insertRoutine = (cb: TScriptInsertCallback): Promise<void> => {
  return new Promise((resolve, reject) => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) reject("No editor");
    else {
      cb(extensionContext).then(data => {
        editor.edit((edit) => {
          edit.insert(editor.selection.active, data);
          resolve();
        });
      }).catch(err => {
        vscode.window.showErrorMessage(err); reject();
        reject();
      });

    }
  });
};

export const replaceRoutine = (cb: TScriptCallback): Promise<void> => {
  return new Promise((resolve, reject) => {

    const editor = vscode.window.activeTextEditor;
    if (!editor) reject;
    else {
      const selections = editor.selections;

      if (selections) {
        editor.selections.forEach(s => {
          const text = s.isEmpty ? editor.document.getText() : getTextAtSelection(s);

          cb(text, extensionContext).then(data => {
            const replaceAt = s.isEmpty ? documentRange() : s;
            setTextAtRange(replaceAt, data);
            resolve();
          }).catch(err => { vscode.window.showErrorMessage(err); reject(); });
        });
      }
    }
  });
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

export const setTextAtRange = (selection: vscode.Selection | vscode.Range, text: string) => {
  vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
    if (selection !== undefined)
      editBuilder.replace(selection, text);
  });

};
