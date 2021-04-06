import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as vscode from 'vscode';
import { informationRoutine, insertRoutine, replaceRoutine } from './editorOperations';
import { IScript, IScriptQuickPickItem, ISwissKnifeContext } from './Interfaces';
import * as colors from './scripts/colors';
import * as count from './scripts/count';
import * as crypto from './scripts/crypto';
import * as encodings from './scripts/encodings';
import * as generators from './scripts/generators';
import * as requestUtils from './scripts/lib/requestUtils';
import * as server from './scripts/lib/server';
import * as markdown from './scripts/markdown';
import * as native from './scripts/native';
import * as passwords from './scripts/passwords';
import * as textBasic from './scripts/textBasic';
import * as time from './scripts/time';
import * as utils from './scripts/utils';

export const nativeModules = { colors, count, crypto, encodings, generators, markdown, native, passwords, textBasic, time, utils, lib: { requestUtils, server } };
export const modules = { ...nativeModules };
export const extensionContext: ISwissKnifeContext = { insertRoutine, replaceRoutine, informationRoutine, vscode, modules };

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
const loadScripts = async (clearCache = false) => {
	scripts = [...loadInternalScripts(), ...(await loadUserScripts(clearCache))];
};

const loadUserScripts = async (clearCache: boolean) => {

	let scripts: IScriptQuickPickItem[] = [];

	const matches = glob.sync(path.join(userScriptsFolder, "/**/*.js"));
	for (let i = 0; i < matches.length; i++) {
		const modulePath = matches[i];
		console.log("Queueing script " + modulePath);

		try {
			if (clearCache) delete require.cache[require.resolve(modulePath)];
			const mod = await Promise.all([require(modulePath)]);

			//add loaded user script to the context var, to be accessible in other scripts
			const moduleName = path.basename(modulePath).toString().replace(new RegExp(`${path.extname(modulePath)}$`), "");
			extensionContext.modules[moduleName] = mod[0];

			const moduleScripts = createScriptsFromModule(mod[0]);
			scripts = [...scripts, ...moduleScripts];

		} catch (ex) {
			console.log(ex.message);
		}
	};

	return scripts;
};

const loadInternalScripts = () => {
	let scripts: IScriptQuickPickItem[] = [];
	//load internal scripts first, from modules
	Object.keys(nativeModules).forEach((k, n) => {
		if (k !== "lib" && k !== "userScripts") { //if so its not a script module...
			const m = Object.values(modules)[n];
			const moduleScripts = createScriptsFromModule(m);
			scripts = [...scripts, ...moduleScripts];
		}
	});

	return scripts;
};



const createScriptsFromModule = (m: any) => {
	const moduleScripts: IScriptQuickPickItem[] = [];

	m.default.forEach((s: IScript) => {
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
