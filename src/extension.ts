import * as vscode from 'vscode';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import { replaceRoutine, informationRoutine, insertRoutine } from './editorOperations';
import { IScript, IScriptQuickPickItem, ISwissKnifeContext } from './Interfaces';


let scripts: IScriptQuickPickItem[] = [];
let context: vscode.ExtensionContext;
let userScriptsFolder: string;


export function activate(ctx: vscode.ExtensionContext) {
	context = ctx;

	userScriptsFolder = path.join(ctx.globalStorageUri.fsPath, "scripts");
	checkUserScriptsFolder();

	loadScripts();
	vscode.commands.registerCommand('swissknife.show', show);
	vscode.commands.registerCommand('swissknife.reload', reload);
	vscode.commands.registerCommand('swissknife.openScript', openUserScriptsFolder);

}


const reload = () => {
	loadScripts(true);
};

const show = () => {
	vscode.window.showQuickPick<IScriptQuickPickItem>(scripts).then((selectedItem: IScriptQuickPickItem | undefined) => {
		if (selectedItem)
			selectedItem.cb(extensionContext);
	});
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
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(userScriptsFolder))
			return fs.mkdir(userScriptsFolder, (err) => {
				if (err) reject(err);
				else resolve();
			});
	});

};

// this method is called when your extension is deactivated
export function deactivate() { }

export const extensionContext: ISwissKnifeContext = { insertRoutine: insertRoutine, replaceRoutine, informationRoutine, vscode };


