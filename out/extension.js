"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const axios = require("axios");
const Languages_1 = require("./typings/Languages");
const urlBase = 'https://snip-index.herokuapp.com';
function activate(context) {
    const getSnippet = (editor, snippetId) => __awaiter(this, void 0, void 0, function* () {
        const requestString = `${urlBase}/fetch/py/${snippetId}`;
        const result = yield axios.get(requestString).catch((err) => {
            vscode.window.showErrorMessage('Could not fetch snippets: ' + err);
            return;
        });
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, result.data[0]);
        });
    });
    const searchSnippets = () => __awaiter(this, void 0, void 0, function* () {
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
            const lang = Languages_1.Languages.get(languageId);
            const word = document.getText(selection);
            const requestString = `${urlBase}/search/${lang}/5%20${word}`;
            const result = yield axios.get(requestString).catch((err) => {
                vscode.window.showErrorMessage('Could not fetch snippets: ' + err);
                return;
            });
            const pickItems = [];
            result.data.forEach((el) => {
                pickItems.push({ value: el[2], label: el[3] });
            });
            vscode.window.showQuickPick(pickItems).then((selectedSnippet) => {
                getSnippet(activeTextEditor, selectedSnippet === null || selectedSnippet === void 0 ? void 0 : selectedSnippet.value);
            });
        }
    });
    let disposable = vscode.commands.registerCommand('extension.searchSnippet', searchSnippets);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map