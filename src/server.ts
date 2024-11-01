'use strict';
import {
    createConnection, Connection, WorkspaceChange, 
    CodeActionKind, CodeActionParams,
    CodeAction, TextDocuments, InitializeResult, 
    Hover, ProposedFeatures, Files, Diagnostic,
    TextDocumentPositionParams, CompletionItem, Location,
    TextDocumentSyncKind, HoverParams, MarkupContent
} from 'vscode-languageserver/node';
import { DiagnosticSeverity } from 'vscode-languageserver';;
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompilerError } from './tactErrorsToDiagnostics';
import { CompletionService } from './completionService';
import { TactDefinitionProvider } from './definitionProvider';
import { HoverService } from './hoverService';
import { RefactorService } from './refactorService';
import { TactCompiler } from './tactCompiler';
import { URI } from 'vscode-uri';
import { formatDocument } from './formatter';
import { DocumentStore } from './documentStore';

interface Settings {
    tact: TactSettings;
}

interface TactSettings {
    // option for backward compatibilities, please use "linter" option instead
    linter: boolean | string;
    enabledAsYouTypeCompilationErrorCheck: boolean;
    defaultCompiler: string;
    compileUsingLocalVersion: string;
    validationDelay: number;
}

// Create a connection for the server
const connection: Connection = createConnection(ProposedFeatures.all);

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

const documents = new DocumentStore(connection);

let rootPath: string | undefined;
let tactCompiler: TactCompiler;

let enabledAsYouTypeErrorCheck = true;
let validationDelay = 1500;

// flags to avoid trigger concurrent validations (compiling is slow)
let validatingDocument = false;
let validatingAllDocuments = false;
let documentsWithErrors: any = [];

async function validate(document: TextDocument) {
    try {
        validatingDocument = true;
        const uri = document.uri;
        const filePath = Files.uriToFilePath(uri) ?? "";

        const documentText = document.getText();
        try {
            if (enabledAsYouTypeErrorCheck) {
                const errors: CompilerError[] = await tactCompiler.compileTactDocumentAndGetDiagnosticErrors(filePath, documentText);
                const compileErrorDiagnostics: any = {};
                errors.forEach(errorItem => {
                    if (typeof compileErrorDiagnostics[errorItem.fileName] == "undefined") {
                        compileErrorDiagnostics[errorItem.fileName] = [];
                    }
                    compileErrorDiagnostics[errorItem.fileName].push(errorItem.diagnostic);
                });
                let newDocumentsWithErrors: any = [];
                for (let fileName in compileErrorDiagnostics) {
                    newDocumentsWithErrors.push(URI.file(fileName).path);
                    connection.sendDiagnostics({diagnostics: compileErrorDiagnostics[fileName], uri: "file://"+URI.file(fileName).path});
                }
                let difference = documentsWithErrors.filter((x: any) => !newDocumentsWithErrors.includes(x));
                // if an error is resolved, we must to send empty diagnostics for the URI contained it;
                for(let item in difference) {
                    connection.sendDiagnostics({diagnostics: [], uri: "file://"+difference[item]});
                } 
                documentsWithErrors = newDocumentsWithErrors;
            }
        } catch (e) {
            //console.log(JSON.stringify(e));
        }
    } finally {
        validatingDocument = false;
    }
}

// This handler provides the initial list of the completion items.
connection.onCompletion(async (textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
    let completionItems: CompletionItem[] = [];
    const document = await documents.retrieve(textDocumentPosition.textDocument.uri);
    if(!document.exists) return [];
    const service = new CompletionService(rootPath, documents);
    completionItems = completionItems.concat(await service.getAllCompletionItems( document.document, textDocumentPosition.position ));
    return completionItems;
});

connection.onHover(async(textPosition: HoverParams): Promise<Hover> => {
    const hoverService = new HoverService(rootPath, documents);
    const document = await documents.retrieve(textPosition.textDocument.uri);
    if(!document.exists) return {contents: ""};
    const suggestion = await hoverService.getHoverItems(document.document, textPosition.position);
    let doc: MarkupContent = suggestion
    return {
      contents: doc
    }
});

connection.onDefinition(async (handler: TextDocumentPositionParams): Promise<Location | Location[] | undefined> => {
    let provider: TactDefinitionProvider;
    try {
        provider = new TactDefinitionProvider(rootPath, documents);
        const document = await documents.retrieve(handler.textDocument.uri);
        if(!document.exists) return [];
        return provider.provideDefinition(document.document, handler.position);
    } catch(e: any) {
        let error = (e.message as string).match(/(.*) Contract: (.*) at Line: ([0-9]*), Column: ([0-9]*)/);
        if (error === null) {
            throw e; // not a compiler diagnostic, but a type error
        }

        const compileErrorDiagnostics: Diagnostic[] = [];
        compileErrorDiagnostics.push({
            message: error[1],
            range: {
                end: {
                    character: Number(error[4]).valueOf() + Number(error.length).valueOf() - 1,
                    line: Number(error[3]).valueOf() - 1,
                },
                start: {
                    character: Number(error[4]).valueOf() - 1,
                    line: Number(error[3]).valueOf() - 1,
                },
            },
            severity: DiagnosticSeverity.Error
        });
        const diagnostics = compileErrorDiagnostics;
        connection.sendDiagnostics({diagnostics, uri: "file:///" + error[2]});
    }
});

// This handler resolve additional information for the item selected in
// the completion list.
// connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
//   item.
// });
function validateAllDocuments() {
    if (!validatingAllDocuments) {
        try {
            validatingAllDocuments = true;
            documents.all().forEach(document => validate(document));
        } finally {
            validatingAllDocuments = false;
        }
    }
}

function startValidation() {
    if (enabledAsYouTypeErrorCheck) {
        validateAllDocuments();
    } else {
        //console.log('error check on typing is disabled');
    }
}

documents.onDidOpen(event => {
    const document = event.document;
    if (!validatingDocument && !validatingAllDocuments) {
        validate(document);
    }
});

/*
// Here issue with the previous content on the FS
// Can be resolved by creating a temporary file
*/
documents.onDidChangeContent(event => {
    const document = event.document;

    if (!validatingDocument && !validatingAllDocuments) {
        validatingDocument = true; // control the flag at a higher level

        // slow down, give enough time to type (1.5 seconds?)
        setTimeout(() =>  validate(document), validationDelay);
    }
});

documents.onDidSave(event => {
    const document = event.document;
    if (!validatingDocument && !validatingAllDocuments) {
        validatingDocument = true; // control the flag at a higher level
        // slow down, give enough time to type (1.5 seconds?)
        setTimeout(() =>  validate(document), validationDelay);
    }
});

// remove diagnostics from the Problems panel when we close the file
documents.onDidClose(event => {
    connection.sendDiagnostics({
        diagnostics: [],
        uri: event.document.uri,
    });
});

connection.onInitialize((result): InitializeResult => {
    if (result.workspaceFolders != undefined && result.workspaceFolders?.length > 0) {
        rootPath = Files.uriToFilePath(result.workspaceFolders[0].uri);
    } else if(result.rootUri != undefined) {
        rootPath = Files.uriToFilePath(result.rootUri);
    }
    
    tactCompiler = new TactCompiler(rootPath ?? "", documents);

    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: [ '.' ],
            },
            hoverProvider: true,
            definitionProvider: true,
            renameProvider: true,
            codeActionProvider: {
                resolveProvider: true
            },
            documentFormattingProvider: true,
            textDocumentSync: TextDocumentSyncKind.Incremental,
        },
    };
});

connection.onInitialized(() => {
    console.log('Tact language server is created.');
});

connection.onDidChangeConfiguration((change) => {
    const settings = <Settings>change.settings;
    enabledAsYouTypeErrorCheck = settings.tact.enabledAsYouTypeCompilationErrorCheck;
    validationDelay = settings.tact.validationDelay;

    startValidation();
});

connection.onCodeAction(async (params: CodeActionParams): Promise<CodeAction[] | undefined> => {
    const codeAction: CodeAction = {
        title: 'Dump this',
        kind: CodeActionKind.Refactor,
        data: params.textDocument.uri
    };

    let provider = new RefactorService(rootPath);
    const document = await documents.retrieve(params.textDocument.uri);
    if(!document.exists) return [];
    codeAction.edit = provider.dump(document.document as TextDocument, params.range);
    return [
        codeAction
    ];
});

connection.onRenameRequest(async (params) => {
    let provider = new RefactorService(rootPath);
    const document = await documents.retrieve(params.textDocument.uri);
    if(!document.exists) return undefined;
    return provider.rename(document.document, params.position, params.newName);
});

connection.onDocumentFormatting(async (params) => {
    const document = await documents.retrieve(params.textDocument.uri);
    if (!document.exists) {
        return [];
    }
    return formatDocument(document.document, rootPath as string);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
