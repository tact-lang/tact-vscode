'use strict';
import * as path from 'path';
import {
    LanguageClient, LanguageClientOptions, ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

// tslint:disable-next-line:no-duplicate-imports
import {
    workspace, ExtensionContext, DiagnosticCollection,
    languages
} from 'vscode';

let diagnosticCollection: DiagnosticCollection;
let clientDisposable: LanguageClient;

export async function activate(context: ExtensionContext) {
    const ws = workspace.workspaceFolders;
    diagnosticCollection = languages.createDiagnosticCollection('tact');

    context.subscriptions.push(diagnosticCollection);
    
    const serverModule = path.join(__dirname, './server.js');

    const serverOptions: ServerOptions = {
        debug: {
            module: serverModule,
            options: {
                execArgv: ['--nolazy', '--inspect=6010'],
            },
            transport: TransportKind.ipc,
        },
        run: {
            module: serverModule,
            transport: TransportKind.ipc,
        },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { language: 'tact', scheme: 'file' },
            { language: 'tact', scheme: 'untitled' },
        ],
        synchronize: {
            // Synchronize the setting section 'tact' to the server
            configurationSection: 'tact',
        },
        initializationOptions: context.extensionPath,
    };

    if (ws) {
        clientDisposable = new LanguageClient(
            'tact',
            'Tact Language Server',
            serverOptions,
            clientOptions);

        clientDisposable.onDidChangeState((data: any) => {
            console.log(`State event received: ${JSON.stringify(data)}`);
        });

        clientDisposable.start();
    }
}

export function deactivate(): Thenable<void> | undefined {
    if (!clientDisposable) {
        return undefined;
    }
    return clientDisposable.stop();
}