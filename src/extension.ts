import * as vscode from 'vscode';
import * as dp from './download-problem';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cfpractice.downloadProblem', () => {
		//vscode.window.showInformationMessage('Downloading Problem');
		vscode.window.showInputBox({
			prompt: 'Please enter the problem no or enter the url for the problem?',
		}).then((answer) => {
			// vscode.window.showInformationMessage("User entered the input " + answer);
			let url = dp.getUrl(answer);
			if(!url) {
				vscode.window.showInformationMessage("Invalid problem no or url: " + answer);
				return;
			} else {
				vscode.window.showInformationMessage("Downloading URL: " + url);
				return dp.downloadProblem(url).then((title) => {
					//vscode.window.showInformationMessage("Info: " + JSON.stringify(title, null, 2));
					console.log(title);
				});
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
