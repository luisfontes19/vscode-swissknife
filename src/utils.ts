import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { Uri } from 'vscode'
import { selectAllTextIfNoSelection } from './editorOperations'
import { ISwissKnifeContext } from './Interfaces'

export const workspacePathForUri = (uri: Uri) => vscode.workspace.getWorkspaceFolder(uri)?.uri.path || ""
export const relativePathForUri = (uri: Uri) => uri.path.replace(`${workspacePathForUri(uri)}/`, "")
export const vscodeFolderPathForWorkspace = (workspace: string) => path.join(workspace, ".vscode")

export const getAllFilesInFolder = (dir: string): string[] => {
  return fs.readdirSync(dir).reduce((files: string[], file: string) => {
    const name = path.join(dir, file)
    const isDirectory = fs.statSync(name).isDirectory()
    return isDirectory ? [...files, name, ...getAllFilesInFolder(name)] : [...files, name]
  }, [])
}

export const readInputAsync = async (prompt: string): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    vscode.window.showInputBox({ prompt }).then(answer => resolve(answer))
  })
}

export const getCurrentWorkspaceFolder = (): string | undefined => {
  const openFile = vscode.window.activeTextEditor?.document.uri
  if (openFile) return workspacePathForUri(openFile)

  const workspacesCount = vscode.workspace.workspaceFolders?.length
  if (workspacesCount === 1) return vscode.workspace.workspaceFolders![0].uri.path

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

  const libraryPath = vscode.Uri.file(path.join(context.extensionPath, 'node_modules', 'html2canvas', 'dist', 'html2canvas.min.js'))
  const html2canvasPath = panel.webview.asWebviewUri(libraryPath)

  const templatePath = context.extensionPath + (context.development ? `/src/screenshot_template.html` : `/out/screenshot_template.html`)
  const html = fs.readFileSync(templatePath).toString()
  const filename = vscode.window.activeTextEditor?.document.fileName.split("/").pop() || "untitled"

  //the __html2canvasPath__ replace is only needed for dev, in production the html2canvas library is already loaded minified :)
  panel.webview.html = html.replace("{{__filename__}}", filename).replace("{{__html2canvasPath__}}", html2canvasPath.toString())

  panel.webview.onDidReceiveMessage(() => {
    vscode.env.clipboard.writeText(clipboard)
  })
}

