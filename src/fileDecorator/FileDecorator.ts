import * as vscode from 'vscode'
import { Event, EventEmitter, FileDecoration, FileDecorationProvider, Uri } from 'vscode'
import { fileExists, getAllFilesInFolder, relativePathForUri, vscodeFolderUri } from '../utils'
import { DecoratorEntry, DecoratorOp } from './types'

export class FileDecorator implements FileDecorationProvider {

  private eventEmitter: EventEmitter<Uri | Uri[]>
  public onDidChangeFileDecorations: Event<Uri | Uri[] | undefined>
  public onCreatedDecoratorFile: undefined | ((filepath: Uri) => void) = undefined

  // this variable is used to track if the .vscode folder exists for a workspace
  // since we need to check this for every file in the file tree, its better to cache it
  // instead of checking with the OS for every file
  // keyed by the workspace folder's Uri.toString()
  private vscodeFolderExistsForWorkspace: Record<string, boolean> = {}

  // cached decoreted files settings. same logic as im vscodeFolderExistsForWorkspace
  // instead of reading the file every time, we read it once and cache it
  // ex: {workspaceUriString: [{file:"some/file", decorator: "x" }]}
  // keyed by the workspace folder's Uri.toString()
  private decorators: Record<string, DecoratorEntry[]> = {}


  public static DECORATOR_CHECK = "✓"
  public static DECORATOR_REJECT = "✗"
  public static DECORATOR_EYES = "👀"

  private DECORATORS_FILE = "swissknifeDecorators.json"
  private OLD_DECORATORS_FILE = "swissknifeCheckedFiles.json" // TODO: REMOVE IN NEWER VERSIONS

  public constructor() {
    this.eventEmitter = new EventEmitter()
    this.onDidChangeFileDecorations = this.eventEmitter.event
  }

  public async provideFileDecoration(uri: Uri): Promise<FileDecoration | undefined> {

    const folder = vscode.workspace.getWorkspaceFolder(uri)
    if (!folder) return

    const decoratorsForWorkspace = await this.decoratedFilesForWorkspace(folder)

    const decorator = decoratorsForWorkspace.find(f => f.file === relativePathForUri(uri))

    if (decorator) {
      //color: new vscode.ThemeColor("button.background"),
      return { badge: decorator.decorator }
    }
  }

  private determinateDecorateOperationForUri = (decorators: DecoratorEntry[], uri: Uri, decorator: string) => {
    let op: DecoratorOp
    const relativePath = relativePathForUri(uri)
    const decoratedFile = decorators.find(f => f.file === relativePath)

    if (!decoratedFile) op = DecoratorOp.ADD
    else if (decoratedFile.decorator === decorator) op = DecoratorOp.REMOVE // has decorator and is the same,  remove
    else op = DecoratorOp.UPDATE // has decorator and is different, update

    return op
  }

  // this method should only have multiple files when the user is selecting a folder
  private async decorateFiles(uris: Uri[], decorator: string, folder: boolean) {
    // multiple uris only show up when togling a folder. so the workspace is the same for all
    const workspace = vscode.workspace.getWorkspaceFolder(uris[0])
    if (!workspace) return
    await this.ensureVscodeFolderExists(workspace)

    let decorators: DecoratorEntry[] = await this.decoratedFilesForWorkspace(workspace)
    let toAdd: DecoratorEntry[] = []
    let toRemove: string[] = []

    let op: DecoratorOp

    //if its a folder all files inside will have the same decorator as the one determinated for the folder
    if (folder) op = this.determinateDecorateOperationForUri(decorators, uris[0], decorator)

    uris.forEach((uri, i) => {
      const relativePath = relativePathForUri(uri)
      const entry = { file: relativePath, decorator } as DecoratorEntry

      if (!folder) op = this.determinateDecorateOperationForUri(decorators, uri, decorator)

      if (op === DecoratorOp.ADD)
        toAdd.push(entry)
      else if (op === DecoratorOp.REMOVE)
        toRemove.push(relativePath)
      else if (op === DecoratorOp.UPDATE) { //remove existing decorator and add new one
        toRemove.push(relativePath)
        toAdd.push(entry)
      }

    })

    decorators = [...decorators.filter(de => !toRemove.includes(de.file)), ...toAdd]

    await this.updateDecoratorsForWorkspace(uris, decorators)
  }

  public async decorate(args: any, decorator: string) {
    // explorer/context commands receive the clicked resource as a Uri directly
    const selectedFile = args as Uri
    const stat = await vscode.workspace.fs.stat(selectedFile)
    const isFolder = stat.type === vscode.FileType.Directory

    if (isFolder) {
      const files = [selectedFile, ...(await getAllFilesInFolder(selectedFile))]
      await this.decorateFiles(files, decorator, true)
    }
    else
      await this.decorateFile(selectedFile, decorator)
  }

  public async decorateFile(args: any, decorator: string) {
    const selectedFile = args as Uri
    await this.decorateFiles([selectedFile], decorator, false)
  }

  public async decoratedFilesForWorkspace(workspace: vscode.WorkspaceFolder) {
    const key = workspace.uri.toString()

    // if the checks file doesn't exist we can assume the user has never checked anything in this workspace
    if (!Object.keys(this.decorators).includes(key)) {
      const decoratorsFile = await this.decoratorsFilePath(workspace)
      this.decorators[key] = (await fileExists(decoratorsFile)) ? await this.readDecoratorsFile(decoratorsFile) : []
    }

    return this.decorators[key]
  }

  private async updateDecoratorsForWorkspace(uris: Uri[], decorators: DecoratorEntry[]) {
    const workspace = vscode.workspace.getWorkspaceFolder(uris[0])
    if (!workspace) return

    const decoratorsFile = await this.decoratorsFilePath(workspace)
    this.decorators[workspace.uri.toString()] = decorators

    // trigger event for vscode to update the file decorations
    this.eventEmitter.fire(uris)

    // save file with checks
    await this.ensureVscodeFolderExists(workspace)
    await this.writeDecoratorsFile(decoratorsFile, decorators)
  }

  public async decoratorsFilePath(workspace: vscode.WorkspaceFolder): Promise<Uri> {
    const vscodeFolder = vscodeFolderUri(workspace.uri)

    //TODO: remove in newer versions
    const oldFile = Uri.joinPath(vscodeFolder, this.OLD_DECORATORS_FILE)
    const newFile = Uri.joinPath(vscodeFolder, this.DECORATORS_FILE)
    if (await fileExists(oldFile)) await this.migrateDecoratorsFile(oldFile, newFile)

    return newFile
  }


  private async ensureVscodeFolderExists(workspace: vscode.WorkspaceFolder) {
    const key = workspace.uri.toString()

    if (!this.vscodeFolderExistsForWorkspace[key]) {
      await vscode.workspace.fs.createDirectory(vscodeFolderUri(workspace.uri))
      this.vscodeFolderExistsForWorkspace[key] = true
    }
  }

  private async readDecoratorsFile(filePath: Uri) {
    const content = await vscode.workspace.fs.readFile(filePath)
    return JSON.parse(Buffer.from(content).toString('utf-8')) || []
  }

  private async writeDecoratorsFile(filePath: Uri, content: any) {
    const existed = await fileExists(filePath)
    await vscode.workspace.fs.writeFile(filePath, Buffer.from(JSON.stringify(content, null, 2), 'utf-8'))

    if (!existed && this.onCreatedDecoratorFile) this.onCreatedDecoratorFile(filePath)
  }

  private async migrateDecoratorsFile(oldFilePath: Uri, newFilePath: Uri) {
    const content = await this.readDecoratorsFile(oldFilePath)

    const newFormat = content.map((c: string) => ({ file: c, decorator: FileDecorator.DECORATOR_CHECK }) as DecoratorEntry)
    await this.writeDecoratorsFile(newFilePath, newFormat)

    await vscode.workspace.fs.delete(oldFilePath)

  }
}
