import * as vscode from 'vscode'
import { Uri } from 'vscode'
import { selectAllTextIfNoSelection } from './editorOperations'
import { ISwissKnifeContext } from './Interfaces'

export const relativePathForUri = (uri: Uri): string => {
  const folderUri = vscode.workspace.getWorkspaceFolder(uri)?.uri
  if (!folderUri) return uri.path
  return uri.path.replace(`${folderUri.path}/`, "")
}

export const vscodeFolderUri = (folderUri: Uri): Uri => Uri.joinPath(folderUri, ".vscode")

export const fileExists = async (uri: Uri): Promise<boolean> => {
  try {
    await vscode.workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}

export const getAllFilesInFolder = async (dir: Uri): Promise<Uri[]> => {
  const entries = await vscode.workspace.fs.readDirectory(dir)

  let files: Uri[] = []
  for (const [name, type] of entries) {
    const entryUri = Uri.joinPath(dir, name)

    if (type === vscode.FileType.Directory)
      files = [...files, entryUri, ...(await getAllFilesInFolder(entryUri))]
    else
      files = [...files, entryUri]
  }

  return files
}

export const readInputAsync = async (prompt: string): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    vscode.window.showInputBox({ prompt }).then(answer => resolve(answer))
  })
}

export const getCurrentWorkspaceFolder = (): vscode.WorkspaceFolder | undefined => {
  const openFile = vscode.window.activeTextEditor?.document.uri
  if (openFile) {
    const folder = vscode.workspace.getWorkspaceFolder(openFile)
    if (folder) return folder
  }

  const workspacesCount = vscode.workspace.workspaceFolders?.length
  if (workspacesCount && workspacesCount > 0) return vscode.workspace.workspaceFolders![0]

  console.log("[SWISSKNIFE] Could not determinate current workspace")

  return undefined
}


// this feature is heavily based on the awesome https://github.com/jeffersonlicet/snipped
// hugo kudos to Jeff for his logic on that awesome extension
export const takeScreenshot = async (context: ISwissKnifeContext): Promise<void> => {
  const { vscode } = context
  const clipboard = await vscode.env.clipboard.readText()
  // TODO: improve these await and sync calls for performance

  selectAllTextIfNoSelection()
  await vscode.commands.executeCommand("editor.action.clipboardCopyWithSyntaxHighlightingAction")

  const panel = vscode.window.createWebviewPanel(
    "vscode-swissknife-screenshot", "Swissknife Screenshot",
    {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: false
    },
    {
      enableScripts: true,
      //localResourceRoots: [vscode.Uri.file(context.extensionPath)],
    }
  )

  const libraryUri = Uri.joinPath(context.extensionUri, 'node_modules', 'html2canvas', 'dist', 'html2canvas.min.js')
  const html2canvasPath = panel.webview.asWebviewUri(libraryUri)

  const templateUri = Uri.joinPath(context.extensionUri, context.development ? 'src' : 'out', 'screenshot_template.html')
  const html = Buffer.from(await vscode.workspace.fs.readFile(templateUri)).toString('utf-8')
  const filename = vscode.window.activeTextEditor?.document.fileName.split("/").pop() || "untitled"

  //the __html2canvasPath__ replace is only needed for dev, in production the html2canvas library is already loaded minified :)
  panel.webview.html = html.replace("{{__filename__}}", filename).replace("{{__html2canvasPath__}}", html2canvasPath.toString())

  panel.webview.onDidReceiveMessage(() => {
    vscode.env.clipboard.writeText(clipboard)
  })
}
