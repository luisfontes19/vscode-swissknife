import * as fs from 'fs'
import * as path from 'path'
import { Event, EventEmitter, FileDecoration, FileDecorationProvider, ProviderResult, Uri } from 'vscode'
import { getAllFilesInFolder, relativePathForUri, vscodeFolderPathForWorkspace, workspacePathForUri } from './utils'

interface DecoratorEntry {
  file: string
  decorator: string
}

enum DecoratorOp {
  ADD, REMOVE, UPDATE
}

export class FileDecorator implements FileDecorationProvider {

  private eventEmitter: EventEmitter<Uri | Uri[]>
  public onDidChangeFileDecorations: Event<Uri | Uri[] | undefined>

  // this variable is used to track if the .vscode folder exists for a workspace
  // since we need to check this for every file in the file tree, its better to cache it
  // instead of checking with the OS for every file
  private vscodeFolderExistsForWorkspace: Record<string, boolean> = {}

  // cached decoreted files settings. same logic as im vscodeFolderExistsForWorkspace
  // instead of reading the file every time, we read it once and cache it
  // ex: {workspace1: [{file:"/some/file", decorator: "x" }]}

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

  public provideFileDecoration(uri: Uri): ProviderResult<FileDecoration> {
    const workspace = workspacePathForUri(uri)
    const decoratorsForWorkspace = this.decoratedFilesForWorkspace(workspace)

    const decorator = decoratorsForWorkspace.find(f => f.file === relativePathForUri(uri))

    if (decorator)
      //color: new vscode.ThemeColor("button.background"),
      return { badge: decorator.decorator }
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
  private decorateFiles(uris: Uri[], decorator: string, folder: boolean) {
    // multiple uris only show up when togling a folder. so the workspace is the same for all
    const workspace = workspacePathForUri(uris[0])
    this.ensureVscodeFolderExists(workspace)

    let decorators: DecoratorEntry[] = this.decoratedFilesForWorkspace(workspace)
    let toAdd: DecoratorEntry[] = []
    let toRemove: string[] = []

    let op: DecoratorOp

    //if its a folder all files inside will have the same decorator as the one determinated for the folder
    if (folder) op = this.determinateDecorateOperationForUri(decorators, uris[0], decorator)

    uris.forEach((uri, i) => {
      const relativePath = relativePathForUri(uri)

      const decoratedFile = decorators.find(f => f.file === relativePathForUri(uri))
      const fileIsDecorated = decoratedFile ? true : false // just for sugar syntax :) 
      const fileHasSameDecorator = (decoratedFile && decorator === decoratedFile.decorator) || false

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

    this.updateDecoratorsForWorkspace(uris, decorators)
  }

  public decorate(args: any, decorator: string) {
    const selectedFile = Uri.file(args.path)
    let isFolder = fs.lstatSync(args.path).isDirectory()

    if (isFolder) {
      const files = [selectedFile.path, ...getAllFilesInFolder(selectedFile.path)]
      this.decorateFiles(files.map(file => Uri.file(file)), decorator, true)
    }
    else
      this.decorateFile(selectedFile, decorator)
  }

  public async decorateFile(args: any, decorator: string) {
    const selectedFile = Uri.file(args.path)
    this.decorateFiles([selectedFile], decorator, false)
  }

  private decoratedFilesForWorkspace(workspace: string) {
    const decoratorsFile = this.decoratorsFilePath(workspace)

    // if the checks file doesn't exist we can assume the user has never checked anything in this workspace
    if (!Object.keys(this.decorators).includes(workspace))
      this.decorators[workspace] = fs.existsSync(decoratorsFile) ? this.readDecoratorsFile(decoratorsFile) : []

    return this.decorators[workspace]
  }

  private async updateDecoratorsForWorkspace(uris: Uri[], decorators: DecoratorEntry[]) {
    const workspace = workspacePathForUri(uris[0])
    const decoratorsFile = this.decoratorsFilePath(workspace)
    this.decorators[workspace] = decorators

    // trigger event for vscode to update the file decorations
    this.eventEmitter.fire(uris)

    // save file with checks
    this.ensureVscodeFolderExists(workspace)
    this.writeDecoratorsFile(decoratorsFile, decorators)
  }

  private decoratorsFilePath(workspace: string) {
    const vscodeFolder = vscodeFolderPathForWorkspace(workspace)

    //TODO: remove in newer versions
    const oldFile = path.join(vscodeFolder, this.OLD_DECORATORS_FILE)
    const newFile = path.join(vscodeFolder, this.DECORATORS_FILE)
    if (fs.existsSync(oldFile)) this.migrateDecoratorsFile(oldFile, newFile)

    return newFile
  }

  private ensureVscodeFolderExists(workspace: string) {
    const vscodeFolder = vscodeFolderPathForWorkspace(workspace)

    if (!Object.keys(this.vscodeFolderExistsForWorkspace).includes(workspace)) {
      if (!fs.existsSync(vscodeFolder)) fs.mkdirSync(vscodeFolder)
      else this.vscodeFolderExistsForWorkspace[workspace] = true
    }
  }

  private readDecoratorsFile(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath).toString()) || []
  }

  private writeDecoratorsFile(filePath: string, content: any) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2))
  }

  private migrateDecoratorsFile(oldFilePath: string, newFilePath: string) {
    const content = this.readDecoratorsFile(oldFilePath)

    const newFormat = content.map((c: string) => ({ file: c, decorator: FileDecorator.DECORATOR_CHECK }) as DecoratorEntry)
    this.writeDecoratorsFile(newFilePath, newFormat)

    fs.unlinkSync(oldFilePath)

  }
}



