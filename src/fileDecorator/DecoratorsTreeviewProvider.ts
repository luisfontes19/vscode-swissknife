import * as fs from 'fs'
import * as path from 'path'
import { Event, EventEmitter, TreeDataProvider, TreeItem, window, workspace } from 'vscode'
import { FileDecorator } from './FileDecorator'
import { DecoratorEntry } from './types'


// right now we chose to go with a flat tree structure, but it has some downsides like when there's a long file name
// TODO: reimplement this as a regular tree :)
export class DecoratorsTreeviewProvider implements TreeDataProvider<any> {
  private eventEmitter: EventEmitter<DecoratorEntry[] | undefined>
  readonly onDidChangeTreeData: Event<DecoratorEntry[] | undefined>
  private decoratedFiles: Record<string, DecoratorEntry[]> = {}

  public constructor() {
    this.eventEmitter = new EventEmitter<any>()
    this.onDidChangeTreeData = this.eventEmitter.event
  }

  refresh(fileDecorator: FileDecorator) {
    this.decoratedFiles = this.getAllDecorators(fileDecorator)
    this.eventEmitter.fire(undefined) // undefined since its the root node
  }

  getTreeItem(item: DecoratorEntry): TreeItem {
    return new TreeItem(`${item.decorator} ${item.file}`)
  }

  getChildren(element?: any): Thenable<DecoratorEntry[]> {
    //TODO: we may need to improve performance here :(

    // Add the workspace to the decorators path, so we can dinstinguish between workspaces
    const processedDecorators = Object.keys(this.decoratedFiles).map(workspace => {
      return this.decoratedFiles[workspace].map(decoratedFile => {
        const newObj = { ...decoratedFile } //otehrwise it will be a reference to the original object affecting the entire project
        newObj.file = path.join(workspace, decoratedFile.file)
        return newObj
      })
    }).flat()

    return Promise.resolve(processedDecorators)
  }

  // get decorators in all workspace folders so we can list them all in the panel
  // we watch for changes in the decorator's files so we can update the changes
  // TODO: we may want to to ditch the watch in favor of calling a method to update the decorators
  // when a new decorator is added, removed or changed
  getAllDecorators(fileDecorator: FileDecorator): Record<string, DecoratorEntry[]> {
    let decorators: Record<string, DecoratorEntry[]> = {}
    workspace.workspaceFolders?.forEach(workspace => {
      const workspacePath = workspace.uri.fsPath
      const decoratorFile = fileDecorator.decoratorsFilePath(workspacePath)
      const workspaceDecorators = fileDecorator.decoratedFilesForWorkspace(workspacePath)

      decorators[workspace.name] = workspaceDecorators


      fs.watch(decoratorFile, {}, async () => this.refresh(fileDecorator))
    })

    return decorators
  }


  onSelectionChange = (e: any) => {
    const selection = e.selection[0]
    const fileParts: string[] = selection.file.split(path.sep)

    // we have the workspace name (root folder) in the treeview item as the first part of the path
    // so we extract it here and search for that workspace full path (so we can open the file)
    const workspaceName = fileParts[0] || selection
    const workspacePath = workspace.workspaceFolders?.find(w => w.name === workspaceName)?.uri.path

    if (workspacePath) {
      // remove the workspace name from the file path
      // and construct the file path again
      fileParts.shift()
      const file = path.join(workspacePath, fileParts.join(path.sep))


      fs.lstat(file, (err, stats) => {
        if (err) console.log(`[SWISSKNIFE] ${err}`)

        if (stats.isFile())
          workspace.openTextDocument(file).then(doc => window.showTextDocument(doc))
        else if (stats.isDirectory())
          console.log(`[SWISSKNIFE] ${file} trying to open a directory, ignoring`)
      })

    }
  }
}
