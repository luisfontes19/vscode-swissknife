import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { v1 } from 'uuid'
import * as vscode from 'vscode'
import { getCurrentWorkspaceFolder, relativePathForUri, vscodeFolderPathForWorkspace } from './utils'

export let notes: NoteComment[] = []
export const NOTES_FILE_NAME = 'swissknifeNotes.json'

export const loadNotesFromFile = (notesController: vscode.CommentController) => {
  const filePath = getNotesFilePath()

  if (!filePath) return
  if (!fs.existsSync(filePath)) return


  const notesFile = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const _notes = JSON.parse(notesFile)
  const workspaceFolder = getCurrentWorkspaceFolder()
  if (!workspaceFolder) return

  notes = _notes.map((note: InternalNote) => {
    const comment = new NoteComment(
      note.body,
      vscode.CommentMode.Preview,
      { name: note.author }
    )

    const thread = notesController.createCommentThread(
      vscode.Uri.file(path.join(workspaceFolder, note.file)),
      new vscode.Range(new vscode.Position(note.line, 0), new vscode.Position(note.line, 0)),
      [comment]
    )
    thread.canReply = false
    comment.parent = thread

    return comment
  })
}


export const initNotesController = () => {
  const controller = vscode.comments.createCommentController('swissknife-notes', 'Swissknife Notes')

  controller.options = { placeHolder: 'Type something here', prompt: "Create a new note" }

  // A `CommentingRangeProvider` controls where gutter decorations that allow adding comments are shown
  controller.commentingRangeProvider = {
    provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken,) =>
      [new vscode.Range(0, 0, document.lineCount - 1, 0)]
    ,
  }

  loadNotesFromFile(controller)

  return controller
}

export const onCreateNote = (note: vscode.CommentReply) => {

  const thread = note.thread

  thread.canReply = false

  const newComment = new NoteComment(
    note.text,
    vscode.CommentMode.Preview,
    { name: os.userInfo().username },
    thread,
    undefined
  )

  thread.comments = [newComment]

  notes = [...notes, newComment]
  saveNotesToFile()
}

export const onEditNote = (thread: vscode.CommentThread) => {
  thread.comments = thread.comments.map(c => {
    c.mode = vscode.CommentMode.Editing
    return c
  })
}

export const onSaveEditNote = (comment: NoteComment) => {

  comment.mode = vscode.CommentMode.Preview
  comment.parent!.comments = [comment]

  notes.find(note => note.id === comment.id)!.body = comment.body
  saveNotesToFile()
}

export const onDeleteNote = (thread: vscode.CommentThread) => {
  notes = notes.filter(note => { console.log(note.id); return note.id !== (thread.comments[0] as NoteComment).id })
  thread.dispose()
  saveNotesToFile()
}

export const saveNotesToFile = () => {
  const notesFilePath = getNotesFilePath()
  if (!notesFilePath) return

  const wsFolder = getCurrentWorkspaceFolder()
  const vscodeFolder = vscodeFolderPathForWorkspace(wsFolder!)
  if (!fs.existsSync(vscodeFolder)) fs.mkdirSync(vscodeFolder)

  const _notes = notes.map(note => ({
    id: note.id,
    body: note.body,
    file: relativePathForUri(note.parent!.uri),
    line: note.parent!.range.start.line,
    author: note.author.name
  }))


  fs.writeFileSync(notesFilePath, JSON.stringify(_notes, null, 2))
}

const getNotesFilePath = () => {
  const vscodeFolder = getCurrentWorkspaceFolder()

  if (!vscodeFolder) {
    vscode.window.showErrorMessage("Could not find current workspace. Notes will not be saved")
    return
  }

  return path.join(vscodeFolder, ".vscode", NOTES_FILE_NAME)
}

export const generateNotesDoc = () => {
  let md = `# ${vscode.workspace.name} Notes\n\n`

  notes.forEach(note => {
    const path = relativePathForUri(note.parent!.uri)
    md += `## ${path}#${note.parent?.range.start.line}\n`
    md += `${note.body}\n\n`
  })

  vscode.workspace.openTextDocument({ content: md, language: "markdown" }).then(doc => vscode.window.showTextDocument(doc))
}

class NoteComment implements vscode.Comment {
  id: string
  label: string | undefined
  constructor(
    public body: string | vscode.MarkdownString,
    public mode: vscode.CommentMode,
    public author: vscode.CommentAuthorInformation,
    public parent?: vscode.CommentThread,
    public contextValue?: string
  ) {
    this.id = v1()
  }
}

export interface InternalNote {
  id: string
  body: string
  file: string
  line: number
  author: string
}
