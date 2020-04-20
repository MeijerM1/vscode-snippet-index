import * as vscode from 'vscode';
import * as axios from 'axios';
import { PickItem } from './typings/Typings';
import { Languages } from './typings/Languages';

const urlBase = 'https://snip-index.herokuapp.com';

export function activate(context: vscode.ExtensionContext) {

	const getSnippet = async (editor: vscode.TextEditor, snippetId?: string) => {
		const requestString = `${urlBase}/fetch/py/${snippetId}`;
		const result = await axios.get(requestString).catch((err: any) => {
			vscode.window.showErrorMessage('Could not fetch snippets: ' + err);
			return;
		});

		editor.edit(editBuilder => {
			editBuilder.insert(editor.selection.active, result.data[0]);
			editBuilder.delete(editor.selection);
		});

	};

	const searchSnippets = async () => {

		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {

			const document = activeTextEditor.document;
			const selection = activeTextEditor.selection;


			if (!selection || document.getText(selection) === '') {
				vscode.window.showInformationMessage('Make a selection first');
				return;
			}

			vscode.window.showInformationMessage('Fetching snippets...');

			const languageId = document.languageId;
			const lang = Languages.get(languageId);

			const word = document.getText(selection);
			const requestString = `${urlBase}/search/${lang}/5%20${word}`;

			const result = await axios.get(requestString).catch((err: any) => {
				vscode.window.showErrorMessage('Could not fetch snippets: ' + err);
				return;
			});

			const pickItems: PickItem[] = [];
			result.data.forEach((el: any) => {
				pickItems.push({ value: el[2], label: el[3] });
			});

			vscode.window.showQuickPick<PickItem>(pickItems).then((selectedSnippet) => {
				getSnippet(activeTextEditor, selectedSnippet?.value);
			});
		}

	};

	let disposable = vscode.commands.registerCommand('extension.searchSnippet', searchSnippets);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
