import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as vscode from 'vscode';
import { informationRoutine, insertRoutine, replaceRoutine } from './editorOperations';
import { IScript, IScriptQuickPickItem, ISwissKnifeContext } from './Interfaces';


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



const loadScripts = (clearCache = false) => {

	scripts = [];

	//load native scripts
	const scriptsPath = path.join(__dirname, "/scripts/**/*.js");
	loadScriptsAt(scriptsPath, clearCache);

	//load user scripts
	loadScriptsAt(path.join(userScriptsFolder, "/**/*.js"), clearCache);

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

	Promise.all(promises).then(modules => {

		modules.forEach((m: any) => {
			if (!m.default) return; //not compliant

			m.default.forEach((s: IScript) => {
				const item: IScriptQuickPickItem = { label: s.title, alwaysShow: true, detail: s.detail, cb: s.cb };
				scripts.push(item);
			});
		});
	}).catch(err => console.log(err));
};


const checkUserScriptsFolder = () => {
	if (!fs.existsSync(extensionFolder))
		fs.mkdirSync(extensionFolder);
	if (!fs.existsSync(userScriptsFolder))
		fs.mkdirSync(userScriptsFolder);
};

// this method is called when your extension is deactivated
export function deactivate() { }

export const extensionContext: ISwissKnifeContext = { insertRoutine: insertRoutine, replaceRoutine, informationRoutine, vscode };


