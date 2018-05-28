import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {


    let disposable = vscode.commands.registerCommand('extension.generatePyFiles', (fileObj) => {

        let basePath = fileObj.path;
        let generators: Array<any> | null | undefined = vscode.workspace.getConfiguration('pyfilesgen').get('generators');


        let generatorsList = [{
            label: "Python modules",
            files: null
        }];

        if (generators) {
            for (let gen of generators) {
                if ('label' in gen && 'files' in gen && gen.label !== null && gen.files instanceof Array) {
                    generatorsList.push(gen);
                }
            }
        }

        vscode.window.showQuickPick(generatorsList)
            .then((value: any | undefined) => {
                if (value === undefined) {
                    return;
                }
                if (!value.files) {
                    vscode.window.showInputBox({
                        prompt: 'Enter the path you want to create',
                        validateInput: (value) => {
                            if (value) {
                                return null;
                            }
                            return 'Please enter a path';
                        }
                    }).then((subPath: string | undefined) => {
                        if (subPath === undefined) {
                            return;
                        }
                        if (subPath.startsWith('/')) {
                            subPath = subPath.slice(1);
                        }
                        if (subPath.endsWith('/')) {
                            subPath = subPath.slice(-1);
                        }
                        const paths = [];
                        const folders = subPath.split('/');
                        let basePath = fileObj.path;
                        for (const folder of folders) {
                            const newPath = path.join(basePath, folder);
                            paths.push(newPath);
                            basePath = newPath;
                        }

                        if (fs.existsSync(paths[0])) {
                            vscode.window.showErrorMessage(
                                `The folder ${paths[0]} already exists!`);
                        } else {
                            for (const p of paths) {
                                fs.mkdirSync(p);
                                const initFile = path.join(p, '__init__.py');
                                if (!fs.existsSync(initFile)) {
                                    fs.closeSync(fs.openSync(initFile, 'w'));
                                }
                            }
                        }
                    });
                }
                if (value.files && value.files instanceof Array) {
                    for (const filename of value.files) {
                        const fullPath = path.join(basePath, filename);
                        if (!fs.existsSync(fullPath)) {
                            fs.closeSync(fs.openSync(fullPath, 'w'));
                        }
                    }
                }
            });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}