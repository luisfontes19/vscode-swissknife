import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as vscode from 'vscode';
import { informationRoutine, insertRoutine, replaceRoutine } from './editorOperations';
import { IScript, IScriptQuickPickItem, ISwissKnifeContext } from './Interfaces';
import colors from './scripts/colors';
import count from './scripts/count';
import crypto from './scripts/crypto';
import encodings from './scripts/encodings';
import generators from './scripts/generators';
import markdown from './scripts/markdown';
import native from './scripts/native';
import passwords from './scripts/passwords';
import textBasic from './scripts/textBasic';
import time from './scripts/time';
import utils from './scripts/utils';


let scripts: IScriptQuickPickItem[] = [];
let context: vscode.ExtensionContext;

let extensionFolder: string;
let userScriptsFolder: string;



const show = () => {
	vscode.window.showQuickPick<IScriptQuickPickItem>(scripts).then((selectedItem: IScriptQuickPickItem | undefined) => {
		if (selectedItem)
			selectedItem.cb(extensionContext);
	});
};


export function activate(ctx: vscode.ExtensionContext) {
	context = ctx;

	const cmdShow = vscode.commands.registerCommand('swissknife.show', show);
	const cmdReload = vscode.commands.registerCommand('swissknife.reload', reload);
	const cmdOpen = vscode.commands.registerCommand('swissknife.openScripts', openUserScriptsFolder);

	extensionFolder = ctx.globalStorageUri.fsPath;
	userScriptsFolder = path.join(extensionFolder, "scripts");
	checkUserScriptsFolder();

	loadScripts();

	ctx.subscriptions.push(cmdShow);
	ctx.subscriptions.push(cmdReload);
	ctx.subscriptions.push(cmdOpen);
}


const reload = () => {
	loadScripts(true);
};

const openUserScriptsFolder = () => {
	vscode.env.openExternal(vscode.Uri.file(userScriptsFolder));
};


//clear cache will only work for user scripts
const loadScripts = (clearCache = false) => {

	scripts = [];

	//load internal scripts first, from modules
	const defaultScriptModules = [colors, count, crypto, encodings, generators, markdown, native, passwords, textBasic, time, utils];
	defaultScriptModules.forEach(m => {
		const moduleScripts = createScriptsFromModule(m);
		scripts = [...scripts, ...moduleScripts];
	});

	//load user scripts
	const userScriptPromises = loadScriptsAt(path.join(userScriptsFolder, "/**/*.js"), clearCache);

	Promise.all(userScriptPromises).then(modules => {
		modules.forEach((m: any) => {
			const moduleScripts = createScriptsFromModule(m);
			scripts = [...scripts, ...moduleScripts];
		});
	}).catch(err => console.log(err));
};


const loadScriptsAt = (path: string, clearCache: boolean) => {
	const promises: NodeRequire[] = [];

	const matches = glob.sync(path);
	matches.forEach(m => {
		console.log("Queueing script " + m);
		try {
			if (clearCache) delete require.cache[require.resolve(m)];
			promises.push(require(m));
		} catch (ex) {
			console.log(ex.message);
		}
	});

	return promises;
};

const createScriptsFromModule = (m: any) => {
	const moduleScripts: IScriptQuickPickItem[] = [];

	//default is for "require" loaded modules (user scripts)
	m = m.default || m;

	m.forEach((s: IScript) => {
		const item: IScriptQuickPickItem = { label: s.title, alwaysShow: true, detail: s.detail, cb: s.cb };
		console.log("Loading script " + s.title);
		moduleScripts.push(item);
	});

	return moduleScripts;
}

const checkUserScriptsFolder = () => {
	if (!fs.existsSync(extensionFolder))
		fs.mkdirSync(extensionFolder);
	if (!fs.existsSync(userScriptsFolder))
		fs.mkdirSync(userScriptsFolder);
};

// this method is called when your extension is deactivated
export function deactivate() { }

export const extensionContext: ISwissKnifeContext = { insertRoutine: insertRoutine, replaceRoutine, informationRoutine, vscode };


