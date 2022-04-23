import * as fs from 'fs'
import * as path from 'path'
import { Event, EventEmitter, FileDecoration, FileDecorationProvider, ProviderResult, Uri } from 'vscode'
import { getAllFilesInFolder, relativePathForUri, vscodeFolderPathForWorkspace, workspacePathForUri } from './utils'

export class FileDecorator implements FileDecorationProvider {

  private eventEmitter: EventEmitter<Uri | Uri[]>
  public onDidChangeFileDecorations: Event<Uri | Uri[] | undefined>

  // this variable is used to track if the .vscode folder exists for a workspace
  // since we need to check this for every file in the file tree, its better to cache it
  // instead of checking with the OS for every file
  private vscodeFolderExistsForWorkspace: Record<string, boolean> = {}

  //cached check files settings. same logic as im vscodeFolderExistsForWorkspace
  // instead of reading the file every time, we read it once and cache it
  private checkedFiles: Record<string, string[]> = {}

  private vscodeFolderChecked

  public constructor() {
    this.eventEmitter = new EventEmitter()
    this.onDidChangeFileDecorations = this.eventEmitter.event
    this.vscodeFolderChecked = false
  }

  public provideFileDecoration(uri: Uri): ProviderResult<FileDecoration> {
    const workspace = workspacePathForUri(uri)
    const checkedFile = this.checkedFilesForWorkspace(workspace)

    if (checkedFile.includes(relativePathForUri(uri))) {
      return {
        badge: "✓",
        //color: new vscode.ThemeColor("button.background"),
      }
    }
  }

  private toggleFiles(uris: Uri[], folder = false) {
    const workspace = workspacePathForUri(uris[0])
    const checkedFile = this.checksFilePathForWorkspace(workspace)

    this.ensureVscodeFolder(workspace)

    let checks: Array<any> = this.checkedFilesForWorkspace(workspace)

    let toAdd: string[] = []
    let toRemove: string[] = []
    let folderOperationRemove = false

    uris.forEach((uri, i) => {
      const relativePath = relativePathForUri(uri)
      const fileAlreadyChecked = checks.includes(relativePath)

      //if its a folder it will check or uncheck all based on the parent folder status
      if (i === 0) folderOperationRemove = fileAlreadyChecked
      if (folder) folderOperationRemove ? toRemove.push(relativePath) : toAdd.push(relativePath)
      else fileAlreadyChecked ? toRemove.push(relativePath) : toAdd.push(relativePath)
    })

    checks = [...toAdd, ...checks.filter(file => !toRemove.includes(file))]

    this.updateCheckedFilesForWorkspace(uris, checks)
  }

  public toggleCheckedFolder(args: any) {
    const selectedFolder = Uri.file(args.path)
    const files = [selectedFolder.path, ...getAllFilesInFolder(selectedFolder.path)]
    this.toggleFiles(files.map(file => Uri.file(file)), true)
  }

  public async toggleCheckedFile(args: any) {
    console.log(args)
    const selectedFile = Uri.file(args.path)
    this.toggleFiles([selectedFile])
  }

  private checkedFilesForWorkspace(workspace: string) {
    const settingsFile = this.checksFilePathForWorkspace(workspace)

    if (!Object.keys(this.checkedFiles).includes(workspace))
      this.checkedFiles[workspace] = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile).toString()) : []

    return this.checkedFiles[workspace]
  }

  private async updateCheckedFilesForWorkspace(uris: Uri[], checks: string[]) {
    const workspace = workspacePathForUri(uris[0])
    const settingsFile = this.checksFilePathForWorkspace(workspace)
    this.checkedFiles[workspace] = checks

    this.eventEmitter.fire(uris)

    this.ensureVscodeFolder(workspace)
    fs.writeFile(settingsFile, JSON.stringify(checks, null, 2), () => { })
  }

  private checksFilePathForWorkspace(workspace: string) {
    const vscodeFolder = vscodeFolderPathForWorkspace(workspace)
    return path.join(vscodeFolder, "swissknifeCheckedFiles.json")
  }

  private ensureVscodeFolder(workspace: string) {
    const vscodeFolder = vscodeFolderPathForWorkspace(workspace)

    if (!Object.keys(this.vscodeFolderExistsForWorkspace).includes(workspace)) {
      if (!fs.existsSync(vscodeFolder)) fs.mkdirSync(vscodeFolder)
      else this.vscodeFolderExistsForWorkspace[workspace] = true
    }
  }
}
function pathgetAllFilesInFolder(path: string) {
  throw new Error('Function not implemented.')
}

