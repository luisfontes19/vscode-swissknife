import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { Uri } from 'vscode'

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