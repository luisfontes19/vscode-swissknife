import * as vscode from 'vscode'
import { extensionContext } from './extension'
import { TScriptCallback, TScriptInsertCallback } from './Interfaces'

// we cant use async stuff inside vscode.window.activeTextEditor?.edit (which all our scripts are)
// and if we want to process all the selected changes as one operation
// (like one undo for all changes at a script run) we need to do a weird logic :(
// first we process all changes and save them in a variable, then we open an edit instance and apply all changes at once
// if we open the edit instance for every change, each one will be an action and an undo will be needed
// So using two fors in insertRoutine and replaceRoutine is related to that
// check https://github.com/luisfontes19/vscode-swissknife/issues/3

export const informationRoutine = async (cb: TScriptCallback): Promise<void> => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return Promise.reject("No editor")

  const selections = editor.selections
  if (!selections) return Promise.resolve()

  for (const selection of selections) {
    const text = selection.isEmpty ? editor.document.getText() : getTextAtSelection(selection)

    await cb(text, extensionContext)
      .then(async data => await showInformationAsync(data))
      .catch(err => vscode.window.showErrorMessage(err))
  };
}

export const insertRoutine = async (cb: TScriptInsertCallback): Promise<void> => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return Promise.reject("No editor")

  const selections = editor.selections
  if (!selections) return Promise.resolve()

  const changeData: { position: vscode.Position, result: string }[] = []

  // Process replace scripts and store results
  for (const selection of selections) {
    const position = new vscode.Position(selection.end.line, selection.end.character)
    const result = await cb(extensionContext)
    changeData.push({ position, result })
  }

  // apply all changes at once
  vscode.window.activeTextEditor?.edit(editor => {
    for (const d of changeData) {
      editor.insert(d.position, d.result)
    }

  })
}

export const replaceRoutine = async (cb: TScriptCallback): Promise<void> => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return Promise.reject("No editor")

  const selections = editor.selections
  if (!selections) return Promise.resolve()

  const changeData: { range: vscode.Range, result: string }[] = []

  try {

    // Process replace scripts and store results
    for (const selection of selections) {
      const text = selection.isEmpty ? editor.document.getText() : getTextAtSelection(selection)
      const range = selection.isEmpty ? documentRange() : selection
      const result = await cb(text, extensionContext)
      changeData.push({ range, result })
    }

    // apply all changes at once
    vscode.window.activeTextEditor?.edit(editor => {
      for (const d of changeData)
        editor.replace(d.range, d.result)
    })
  }
  catch (ex: any) {
    vscode.window.showErrorMessage(ex)
  }
}

export const documentRange = (): vscode.Range => {
  const textEditor = vscode.window.activeTextEditor
  const firstLine = textEditor?.document.lineAt(0)
  const lastLine = textEditor?.document.lineAt(textEditor.document.lineCount - 1)
  if (firstLine && lastLine)
    return new vscode.Range(firstLine.range.start, lastLine.range.end)
  else //this should never happen
  {
    const p = new vscode.Position(0, 0)
    return new vscode.Range(p, p)
  }
}

export const selectAllTextIfNoSelection = () => {
  // if nothing selected select entire text
  const editor = vscode.window.activeTextEditor
  if (editor?.selection?.isEmpty) {
    const { lineCount } = editor.document

    const firstLine = editor.document.lineAt(0)
    const lastLine = editor.document.lineAt(lineCount - 1)

    editor.selection = new vscode.Selection(
      firstLine.lineNumber,
      firstLine.range.start.character,
      lastLine.lineNumber,
      lastLine.range.end.character
    )

  }
}

export const getTextAtSelection = (selection: vscode.Selection): string => {
  return vscode.window.activeTextEditor?.document.getText(new vscode.Range(selection.start, selection.end)) || ""
}

export const showInformationAsync = (str: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    vscode.window.showInformationMessage(str).then(() => resolve())
  })
}