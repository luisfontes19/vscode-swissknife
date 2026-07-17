import * as os from 'os'
import { v1 } from 'uuid'
import * as vscode from 'vscode'
import { fileExists, relativePathForUri, vscodeFolderUri } from './utils'

export const NOTES_FILE_NAME = 'swissknifeNotes.json'

// notes are kept per workspace folder (multi-root support), keyed by the folder's Uri.toString()
export let notes: Record<string, NoteComment[]> = {}

const keyFor = (folder: vscode.WorkspaceFolder) => folder.uri.toString()

const getNotesFileUri = (folder: vscode.WorkspaceFolder): vscode.Uri =>
  vscode.Uri.joinPath(folder.uri, '.vscode', NOTES_FILE_NAME)

export const loadNotesFromFile = async (notesController: vscode.CommentController) => {
  for (const folder of vscode.workspace.workspaceFolders ?? [])
    await loadNotesForFolder(folder, notesController)
}

const loadNotesForFolder = async (folder: vscode.WorkspaceFolder, notesController: vscode.CommentController) => {
  const fileUri = getNotesFileUri(folder)
  if (!(await fileExists(fileUri))) return

  const content = Buffer.from(await vscode.workspace.fs.readFile(fileUri)).toString('utf-8')
  const _notes = JSON.parse(content)

  notes[keyFor(folder)] = _notes.map((note: InternalNote) => {
    const comment = new NoteComment(
      note.body,
      vscode.CommentMode.Preview,
      { name: note.author }
    )

    const thread = notesController.createCommentThread(
      vscode.Uri.joinPath(folder.uri, ...note.file.split('/')),
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

  // a workspace folder added later in the session (multi-root) needs its notes loaded too
  const foldersListener = vscode.workspace.onDidChangeWorkspaceFolders(e => {
    e.added.forEach(folder => loadNotesForFolder(folder, controller))
  })

  const dispose = controller.dispose.bind(controller)
  controller.dispose = () => {
    foldersListener.dispose()
    dispose()
  }

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

  const folder = vscode.workspace.getWorkspaceFolder(thread.uri)
  if (!folder) return

  const key = keyFor(folder)
  notes[key] = [...(notes[key] ?? []), newComment]
  saveNotesToFile(folder)
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

  const folder = vscode.workspace.getWorkspaceFolder(comment.parent!.uri)
  if (!folder) return

  const note = notes[keyFor(folder)]?.find(n => n.id === comment.id)
  if (note) note.body = comment.body

  saveNotesToFile(folder)
}

export const onDeleteNote = (thread: vscode.CommentThread) => {
  const folder = vscode.workspace.getWorkspaceFolder(thread.uri)
  const deletedId = (thread.comments[0] as NoteComment).id

  thread.dispose()

  if (!folder) return

  const key = keyFor(folder)
  notes[key] = (notes[key] ?? []).filter(note => note.id !== deletedId)
  saveNotesToFile(folder)
}

export const saveNotesToFile = async (folder: vscode.WorkspaceFolder) => {
  await vscode.workspace.fs.createDirectory(vscodeFolderUri(folder.uri))

  const folderNotes = notes[keyFor(folder)] ?? []
  const _notes = folderNotes.map(note => ({
    id: note.id,
    body: note.body,
    file: relativePathForUri(note.parent!.uri),
    line: note.parent!.range.start.line,
    author: note.author.name
  }))

  await vscode.workspace.fs.writeFile(getNotesFileUri(folder), Buffer.from(JSON.stringify(_notes, null, 2), 'utf-8'))
}

export const generateNotesDoc = () => {
  const folders = vscode.workspace.workspaceFolders ?? []
  const multiRoot = folders.length > 1

  let md = `# ${vscode.workspace.name} Notes\n\n`

  folders.forEach(folder => {
    const folderNotes = notes[keyFor(folder)] ?? []
    if (folderNotes.length === 0) return

    if (multiRoot) md += `## ${folder.name}\n\n`

    folderNotes.forEach(note => {
      const path = relativePathForUri(note.parent!.uri)
      md += `${multiRoot ? '###' : '##'} ${path}#${note.parent?.range.start.line}\n\n`
      md += `${note.body}\n\n`
    })
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
