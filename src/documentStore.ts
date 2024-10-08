import * as lsp from 'vscode-languageserver';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LRUMap } from './util/lruMap';

export interface TextDocumentChange2 {
	document: TextDocument,
	changes: {
		range: lsp.Range;
		rangeOffset: number;
		rangeLength: number;
		text: string;
	}[]
}

type DocumentEntry = { exists: true, document: TextDocument } | { exists: false, document: undefined };

export class DocumentStore extends TextDocuments<TextDocument> {

	private readonly _onDidChangeContent2 = new lsp.Emitter<TextDocumentChange2>();
	readonly onDidChangeContent2 = this._onDidChangeContent2.event;

	private readonly _decoder = new TextDecoder();
	private readonly _fileDocuments: LRUMap<string, Promise<DocumentEntry>>;

	constructor(private readonly _connection: lsp.Connection) {
		super({
			create: TextDocument.create,
			update: (doc, changes, version) => {
				let result: TextDocument;
				let incremental = true;
				let event: TextDocumentChange2 = { document: doc, changes: [] };

				for (const change of changes) {
					if (!lsp.TextDocumentContentChangeEvent.isIncremental(change)) {
						incremental = false;
						break;
					}
					const rangeOffset = doc.offsetAt(change.range.start);
					event.changes.push({
						text: change.text,
						range: change.range,
						rangeOffset,
						rangeLength: change.rangeLength ?? doc.offsetAt(change.range.end) - rangeOffset,
					});
				}
				result = TextDocument.update(doc, changes, version);
				if (incremental) {
					this._onDidChangeContent2.fire(event);
				}
				return result;
			}
		});

		this._fileDocuments = new LRUMap<string, Promise<DocumentEntry>>({
			size: 200,
			dispose: _entries => { }
		});

		super.listen(_connection);
	}

	async retrieve(uri: string): Promise<DocumentEntry> {
		let result = this.get(uri);
		if (result) {
			return { exists: true, document: result };
		}

		let promise = this._fileDocuments.get(uri);
		if (!promise) {
			promise = this._requestDocument(uri);
			this._fileDocuments.set(uri, promise);
		}
		return promise;
	}

	private async _requestDocument(uri: string): Promise<DocumentEntry> {
		const localPath = uriToPath(uri);
		// Check if the file exists locally
        // if (localPath && fs.existsSync(localPath)) {
        //     const content = fs.readFileSync(localPath, { encoding: 'utf-8' });
        //     const document = TextDocument.create(uri, "tact", 1, content);
        //     return document;
        // }
		const reply = await this._connection.sendRequest<{ type: string, content: String, message?: string}>('file/read', uri);
		if(reply.type === 'error') {
			return { exists: false, document: undefined };
		}
		// I am getting buffer from server, so I need to convert it to string
		// to create TextDocument
		const content = Buffer.from(reply.content).toString('utf-8');
		const document =  TextDocument.create(uri, "tact", 1, content);
		return { exists: true, document: document };
	}

	// remove "file document", e.g one that has been retrieved from "disk"
	// and not one that is sync'd by LSP
	removeFile(uri: string) {
		return this._fileDocuments.delete(uri);
	}
}


function uriToPath(uri: string): string | null {
    if (uri.startsWith('file://')) {
        return uri.slice(7); // Remove 'file://' from URI to get the path
    }
    return null;
}
