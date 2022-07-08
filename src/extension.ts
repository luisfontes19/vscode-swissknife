import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import * as vscode from 'vscode'
import { Uri } from 'vscode'
import { informationRoutine, insertRoutine, replaceRoutine } from './editorOperations'
import { FileDecorator } from './fileDecorator'
import { IScript, IScriptQuickPickItem, ISwissKnifeContext } from './Interfaces'
import * as colors from './lib/colors'
import * as count from './lib/count'
import * as crypto from './lib/crypto'
import * as encodings from './lib/encodings'
import * as generators from './lib/generators'
import * as markdown from './lib/markdown'
import * as native from './lib/native'
import * as passwords from './lib/passwords'
import * as requestUtils from './lib/requestUtils'
import * as server from './lib/server'
import * as textBasic from './lib/textBasic'
import * as time from './lib/time'
import * as utils from './lib/utils'
import * as yaml from './lib/yaml'
import { default as _scripts } from './scripts'
import { relativePathForUri } from './utils'

export const nativeModules = { colors, count, crypto, encodings, generators, markdown, native, passwords, textBasic, time, utils, lib: { requestUtils, server }, yaml }
export const modules = { ...nativeModules }
export const extensionContext: ISwissKnifeContext = { insertRoutine, replaceRoutine, informationRoutine, vscode, modules, extensionPath: "", development: false }

let scripts: IScriptQuickPickItem[] = []
let internalScripts: IScriptQuickPickItem[] = []
let userScripts: IScriptQuickPickItem[] = []
let context: vscode.ExtensionContext
let extensionFolder: string
let userScriptsFolder: string

let fileDecorator: FileDecorator

export function activate(ctx: vscode.ExtensionContext) {
	context = ctx

	extensionContext.extensionPath = context.extensionPath
	extensionContext.development = ctx.extensionMode === vscode.ExtensionMode.Development

	extensionFolder = ctx.globalStorageUri.fsPath
	userScriptsFolder = path.join(extensionFolder, "scripts")
	fileDecorator = new FileDecorator()

	checkUserScriptsFolder()

	loadScripts().then(() => {
		// So that i can print a markdown table with the scripts to include in the readme :) 
		if (ctx.extensionMode === vscode.ExtensionMode.Development)
			printScriptsTable()

	})

	const disposables = [
		vscode.commands.registerCommand('swissknife.show', show),
		vscode.commands.registerCommand('swissknife.reload', reload),
		vscode.commands.registerCommand('swissknife.openScripts', openUserScriptsFolder),

		vscode.commands.registerCommand('swissknife.copyPathWithLine', copyPathWithLine),

		vscode.window.registerFileDecorationProvider(fileDecorator),
		vscode.commands.registerCommand("swissknife.decorators.check", (args) => { fileDecorator.decorate(args, FileDecorator.DECORATOR_CHECK) }),
		vscode.commands.registerCommand("swissknife.decorators.reject", (args) => { fileDecorator.decorate(args, FileDecorator.DECORATOR_REJECT) }),
		vscode.commands.registerCommand("swissknife.decorators.eyes", (args) => { fileDecorator.decorate(args, FileDecorator.DECORATOR_EYES) }),
		vscode.commands.registerCommand("swissknife.decorators.custom", (args, b) => {
			vscode.window.showInputBox({ prompt: "Provide a custom decorator (1 character only)" }).then(dec => {
				dec ||= ""
				if ([...dec].length !== 1) return vscode.window.showErrorMessage("Custom decorator must be 1 character long")

				fileDecorator.decorate(args, dec)
			})
		})
	]

	ctx.subscriptions.push(...disposables)
}

const printScriptsTable = async () => {
	let data = ";;\n" //empty headers
	const sortedScripts = internalScripts.sort((a, b) => a.label.localeCompare(b.label))

	for (let i = 0; i < sortedScripts.sort().length; i += 3)
		data += `${sortedScripts[i]?.label};${sortedScripts[i + 1]?.label || ""};${sortedScripts[i + 2]?.label || ""}\n`

	console.log(await markdown.csvToMarkdown(data, ";"))
}

// show swissknife's script launcher and event to handle script selection
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

// Reload scripts. Necessary for developing user scripts
const reload = () => loadScripts(true)

const openUserScriptsFolder = () => {
	vscode.env.openExternal(Uri.file(userScriptsFolder))
}

// clear cache will only work for user scripts
const loadScripts = async (clearCache = false) => {
	internalScripts = loadInternalScripts()
	userScripts = (await loadUserScripts(clearCache))
	scripts = [...internalScripts, ...userScripts]
}

const loadUserScripts = async (clearCache: boolean) => {

	let scripts: IScriptQuickPickItem[] = []

	const matches = glob.sync(path.join(userScriptsFolder, "/**/*.js"))
	for (let i = 0; i < matches.length; i++) {
		const modulePath = matches[i]
		console.log("[SWISSKNIFE] Queueing scripts module" + modulePath)

		try {
			if (clearCache) delete require.cache[require.resolve(modulePath)]
			const mod = await Promise.all([require(modulePath)])

			//add loaded user script to the context var, to be accessible in other scripts
			const moduleName = path.basename(modulePath).toString().replace(new RegExp(`${path.extname(modulePath)}$`), "") //remove extension from file name


			// if a module doesn't override an existing module we add it, otherwise we will append the scripts
			const newModule = extensionContext.modules[moduleName] === undefined
			if (newModule)
				extensionContext.modules[moduleName] = mod[0]

			const moduleScripts = createScriptsFromModule(mod[0])
			scripts = [...scripts, ...moduleScripts]

			// if a module with the same name already exists
			// lets just push the new scripts to it
			if (!newModule)
				extensionContext.modules[moduleName] = { ...extensionContext.modules[moduleName], ...mod[0] }

		} catch (ex: any) {
			console.log("[SWISSKNIFE]", ex.message)
		}
	}

	return scripts
}

const loadInternalScripts = (): IScriptQuickPickItem[] => {
	return _scripts.map(s => {
		const item: IScriptQuickPickItem = { alwaysShow: true, cb: s.cb, detail: s.detail, label: s.title }
		return item
	})
}

// A module is a file that contains multiple scripts
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
		const pos = editor.document.lineAt(editor.selection.active).range.start.line + 1 //range.start.line is zero indexed
		vscode.env.clipboard.writeText(`${filePath}#${pos}`)
	}
}

export function deactivate() { }
