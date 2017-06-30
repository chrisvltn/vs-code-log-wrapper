'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range, Selection, TextEditor, QuickPickItem, Position, TextLine, TextEditorEdit, TextDocument, Disposable } from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const edit = (insertAfter: boolean) => {
        let editor: TextEditor = vscode.window.activeTextEditor;
        let selections: Selection[] = editor.selections;
        var doc: TextDocument = editor.document;
        var wrapper: string = getWrapper(editor.document.languageId);

        editor.edit(function(edit: TextEditorEdit): void {
            for(var x: number = 0; x < selections.length; x++) {
                let selectedText: string = doc.getText(new Range(selections[x].start, selections[x].end));
                let selLine: TextLine = doc.lineAt(selections[x].end.line);
                let insertPos: Range = selLine.range;
                let insertLineText: string = selLine.text;
                
                let indentCharactersLine: number = selections[x].end.line + (insertAfter ? 1 : 0);
                if(insertAfter && getIndentString(indentCharactersLine).length < getIndentString(indentCharactersLine - 1).length) indentCharactersLine--;
                let indent: string = getIndentString(indentCharactersLine);
                
                if(insertAfter)
                    edit.replace(insertPos, insertLineText + '\n' + indent + wrapText(selectedText, wrapper));
                else
                    edit.replace(insertPos, indent + wrapText(selectedText, wrapper) + '\n' + insertLineText);
            }
        });
    };

    let disposables: Array<Disposable> = [
        vscode.commands.registerCommand('extension.debugWrapAfter', () => {
            if(canRunCommand())
                edit(true);
        }),
        vscode.commands.registerCommand('extension.debugWrapBefore', () => {
            if(canRunCommand())
                edit(false);
        }),
        vscode.commands.registerCommand('extension.debugWrapMenu', () => {
            if(!canRunCommand()) return;
            var items: QuickPickItem[] = [];
            items.push({ label: "after", description: "Insert debug wrapper after selected line" });
            items.push({ label: "before", description: "Insert debug wrapper before selected line" });

            vscode.window.showQuickPick(items).then(selection => {
                if (!selection) return;
                switch(selection.label) {
                    case 'after': edit(true);
                        break;
                    case 'before': edit(false);
                        break;
                }
            })
        })
    ];

    context.subscriptions.push(disposables[0]);
    context.subscriptions.push(disposables[1]);
    context.subscriptions.push(disposables[2]);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function canRunCommand(): boolean {
    let editor = vscode.window.activeTextEditor;
    if(!editor) {
        vscode.window.showInformationMessage('Open a file first to manipulate text selections');
        return false;
    }
    if(!editor.selections.length) {
        vscode.window.showInformationMessage('Select one or more texts to run this command');
        return false;
    }

    return true;
}
function getIndentString(lineNumber: number): string {
    let doc = vscode.window.activeTextEditor.document;
    if(doc.lineCount > lineNumber && lineNumber >= 0)
        return (doc.lineAt(lineNumber).text.match(/^\s+/) || ['']).shift();
    return '';
}
export function getWrapper(lang: string): string {
    let list: object = vscode.workspace.getConfiguration("debugwrapper.wrappers");
    var wrapper: string = list[lang.toLowerCase()] || list['default'];
    return wrapper;
}
export function wrapText(selection: string, wrapper: string): string {
    return wrapper
        .replace(
            /\$eSEL/g, 
            selection.replace(
                /(\"|')/g, 
                "\\$1"
            )
        ).replace(
            /\$SEL/g, 
            selection
        );
}