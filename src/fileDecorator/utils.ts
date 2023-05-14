import * as vscode from 'vscode'
import { DecoratorsTreeviewProvider } from './DecoratorsTreeviewProvider'
import { FileDecorator } from './FileDecorator'

export const customDecorator = (fileDecorator: FileDecorator) => {
  return (args: any, b: any) => {

    vscode.window.showInputBox({ prompt: "Provide a custom decorator (1 character only)" }).then(dec => {
      dec ||= ""
      if ([...dec].length !== 1) return vscode.window.showErrorMessage("Custom decorator must be 1 character long")

      fileDecorator.decorate(args, dec)
    })
  }
}


export const setupDecoratorTree = (fileDecorator: FileDecorator) => {
  fileDecorator.onCreatedDecoratorFile = (filepath: string) => treeProvider.refresh(fileDecorator)

  const treeProvider = new DecoratorsTreeviewProvider()
  const tree = vscode.window.createTreeView("swissknife-decorators-tree", { treeDataProvider: treeProvider })
  tree.onDidChangeSelection((e: any) => treeProvider.onSelectionChange(e))

  treeProvider.refresh(fileDecorator)

  vscode.workspace.onDidChangeWorkspaceFolders(() => treeProvider.refresh(fileDecorator))
}
