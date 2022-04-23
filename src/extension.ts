import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import * as vscode from 'vscode'
import { Uri } from 'vscode'
import { informationRoutine, insertRoutine, replaceRoutine } from './editorOperations'
import { FileDecorator } from './fileDecorator'
import { IScript, IScriptQuickPickItem, ISwissKnifeContext } from './Interfaces'
import * as colors from './scripts/colors'
import * as count from './scripts/count'
import * as crypto from './scripts/crypto'
import * as encodings from './scripts/encodings'
import * as generators from './scripts/generators'
import * as requestUtils from './scripts/lib/requestUtils'
import * as server from './scripts/lib/server'
import * as markdown from './scripts/markdown'
import * as native from './scripts/native'
import * as passwords from './scripts/passwords'
import * as textBasic from './scripts/textBasic'
import * as time from './scripts/time'
import * as utils from './scripts/utils'
import { relativePathForUri } from './utils'

export const nativeModules = { colors, count, crypto, encodings, generators, markdown, native, passwords, textBasic, time, utils, lib: { requestUtils, server } }
export const modules = { ...nativeModules }
export const extensionContext: ISwissKnifeContext = { insertRoutine, replaceRoutine, informationRoutine, vscode, modules }

let scripts: IScriptQuickPickItem[] = []
let context: vscode.ExtensionContext
let extensionFolder: string
let userScriptsFolder: string

let fileDecorator: FileDecorator

export function activate(ctx: vscode.ExtensionContext) {
	context = ctx

	extensionFolder = ctx.globalStorageUri.fsPath
	userScriptsFolder = path.join(extensionFolder, "scripts")
	fileDecorator = new FileDecorator()

	checkUserScriptsFolder()
	loadScripts()

	const disposables = [
		vscode.commands.registerCommand('swissknife.show', show),
		vscode.commands.registerCommand('swissknife.reload', reload),
		vscode.commands.registerCommand('swissknife.openScripts', openUserScriptsFolder),

		vscode.commands.registerCommand('swissknife.copyPathWithLine', copyPathWithLine),

		vscode.window.registerFileDecorationProvider(fileDecorator),
		vscode.commands.registerCommand("swissknife.toggleCheckedFile", (args) => { fileDecorator.toggleCheckedFile(args) }),
		vscode.commands.registerCommand("swissknife.toggleCheckedFolder", (args) => { fileDecorator.toggleCheckedFolder(args) }),
	]

	ctx.subscriptions.push(...disposables)
}

const show = () => {
	vscode.window.showQuickPick<IScriptQuickPickItem>(scripts).then((selectedItem: IScriptQuickPickItem | undefined) => {
		if (selectedItem) {
			console.log("[SWISSKNIFE] Calling script: " + selectedItem.label)
			selectedItem.cb(extensionContext).then(() => {
				console.log("[SWISSKNIFE] Script call ended: " + selectedItem.label)
			})
		}
	})
}

const reload = () => {
	loadScripts(true)
}

const openUserScriptsFolder = () => {
	vscode.env.openExternal(Uri.file(userScriptsFolder))
}

//clear cache will only work for user scripts
const loadScripts = async (clearCache = false) => {
	scripts = [...loadInternalScripts(), ...(await loadUserScripts(clearCache))]
}

const loadUserScripts = async (clearCache: boolean) => {

	let scripts: IScriptQuickPickItem[] = []

	const matches = glob.sync(path.join(userScriptsFolder, "/**/*.js"))
	for (let i = 0; i < matches.length; i++) {
		const modulePath = matches[i]
		console.log("[SWISSKNIFE] Queueing script " + modulePath)

		try {
			if (clearCache) delete require.cache[require.resolve(modulePath)]
			const mod = await Promise.all([require(modulePath)])

			//add loaded user script to the context var, to be accessible in other scripts
			const moduleName = path.basename(modulePath).toString().replace(new RegExp(`${path.extname(modulePath)}$`), "")
			extensionContext.modules[moduleName] = mod[0]

			const moduleScripts = createScriptsFromModule(mod[0])
			scripts = [...scripts, ...moduleScripts]

		} catch (ex: any) {
			console.log("[SWISSKNIFE]", ex.message)
		}
	};

	return scripts
}

const loadInternalScripts = () => {
	let scripts: IScriptQuickPickItem[] = []
	//load internal scripts first, from modules
	Object.keys(nativeModules).forEach((k, n) => {
		if (k !== "lib" && k !== "userScripts") { //if so its not a script module...
			const m = Object.values(modules)[n]
			const moduleScripts = createScriptsFromModule(m)
			scripts = [...scripts, ...moduleScripts]
		}
	})

	return scripts
}

const createScriptsFromModule = (m: any) => {
	const moduleScripts: IScriptQuickPickItem[] = []

	m.default.forEach((s: IScript) => {
		const item: IScriptQuickPickItem = { label: s.title, alwaysShow: true, detail: s.detail, cb: s.cb }
		console.log("[SWISSKNIFE] Loading script " + s.title)
		moduleScripts.push(item)
	})

	return moduleScripts
}

const checkUserScriptsFolder = () => {
	if (!fs.existsSync(extensionFolder))
		fs.mkdirSync(extensionFolder)
	if (!fs.existsSync(userScriptsFolder))
		fs.mkdirSync(userScriptsFolder)
}

const copyPathWithLine = () => {
	const editor = vscode.window.activeTextEditor
	if (editor) {
		const filePath = relativePathForUri(editor.document.uri)
		const pos = editor.document.lineAt(editor.selection.active).range.start.line
		vscode.env.clipboard.writeText(`${filePath}#${pos}`)
	}
}

export function deactivate() { }
