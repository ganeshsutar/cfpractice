import * as vscode from 'vscode';
import * as dp from './download-problem';


export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cfpractice.downloadProblem', () => {
		vscode.window.showInputBox({
			prompt: 'Please enter the problem no or enter the url for the problem?',
		}).then((answer) => {
			let url = dp.getUrl(answer);
			if(!url) {
				vscode.window.showInformationMessage("Invalid problem no or url: " + answer);
				return;
			} else {
				vscode.window.showInformationMessage("Downloading URL: " + url);
				return dp.downloadProblem(url).then((data) => {
					if(!vscode.workspace.workspaceFolders) {
						vscode.window.showInformationMessage("No folder opened, Please open a folder from File -> Open Folder");
						return;
					} else {
						return dp.createDirectory(vscode.workspace.workspaceFolders[0]?.uri.fsPath, data);
					}
				}).catch((err) => {
					vscode.window.showErrorMessage('Error while preparing the directory. ' + JSON.stringify(err, null, 2));
				});
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
