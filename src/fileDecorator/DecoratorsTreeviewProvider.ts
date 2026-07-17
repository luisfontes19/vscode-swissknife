import { Event, EventEmitter, FileType, RelativePattern, TreeDataProvider, TreeItem, Uri, window, workspace } from 'vscode'
import { fileExists } from '../utils'
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

  async refresh(fileDecorator: FileDecorator) {
    this.decoratedFiles = await this.getAllDecorators(fileDecorator)
    this.eventEmitter.fire(undefined) // undefined since its the root node
  }

  getTreeItem(item: DecoratorEntry): TreeItem {
    return new TreeItem(`${item.decorator} ${item.file}`)
  }

  getChildren(element?: any): Thenable<DecoratorEntry[]> {
    //TODO: we may need to improve performance here :(

    // Add the workspace to the decorators path, so we can dinstinguish between workspaces
    const processedDecorators = Object.keys(this.decoratedFiles).map(workspaceName => {
      return this.decoratedFiles[workspaceName].map(decoratedFile => {
        const newObj = { ...decoratedFile } //otehrwise it will be a reference to the original object affecting the entire project
        newObj.file = `${workspaceName}/${decoratedFile.file}`
        return newObj
      })
    }).flat()

    return Promise.resolve(processedDecorators)
  }

  // get decorators in all workspace folders so we can list them all in the panel
  // we watch for changes in the decorator's files so we can update the changes
  // TODO: we may want to to ditch the watch in favor of calling a method to update the decorators
  // when a new decorator is added, removed or changed
  async getAllDecorators(fileDecorator: FileDecorator): Promise<Record<string, DecoratorEntry[]>> {
    let decorators: Record<string, DecoratorEntry[]> = {}

    for (const folder of workspace.workspaceFolders ?? []) {
      const decoratorFile = await fileDecorator.decoratorsFilePath(folder)
      const workspaceDecorators = await fileDecorator.decoratedFilesForWorkspace(folder)

      decorators[folder.name] = workspaceDecorators

      if (!(await fileExists(decoratorFile))) continue

      const watcher = workspace.createFileSystemWatcher(new RelativePattern(folder, '.vscode/swissknifeDecorators.json'))
      watcher.onDidChange(() => this.refresh(fileDecorator))
      watcher.onDidCreate(() => this.refresh(fileDecorator))
      watcher.onDidDelete(() => this.refresh(fileDecorator))
    }

    return decorators
  }


  onSelectionChange = async (e: any) => {
    const selection = e.selection[0]
    const fileParts: string[] = selection.file.split('/')

    // we have the workspace name (root folder) in the treeview item as the first part of the path
    // so we extract it here and search for that workspace full path (so we can open the file)
    const workspaceName = fileParts[0] || selection
    const folder = workspace.workspaceFolders?.find(w => w.name === workspaceName)

    if (folder) {
      // remove the workspace name from the file path
      // and construct the file path again
      fileParts.shift()
      const fileUri = Uri.joinPath(folder.uri, ...fileParts)

      try {
        const stat = await workspace.fs.stat(fileUri)

        if (stat.type === FileType.File)
          window.showTextDocument(await workspace.openTextDocument(fileUri))
        else
          console.log(`[SWISSKNIFE] ${fileUri} trying to open a directory, ignoring`)
      } catch (err) {
        console.log(`[SWISSKNIFE] ${err}`)
      }
    }
  }
}
