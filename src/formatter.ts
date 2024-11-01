import * as prettier from 'prettier';
import * as path from 'path';
import { TextEdit, Range } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';

export function formatDocument(document: TextDocument, rootPath: string): TextEdit[] | undefined {

    if (rootPath) {
        const ignoreOptions = { ignorePath: path.join(rootPath, '.prettierignore') };
        const fileInfo = prettier.getFileInfo.sync(document.uri, ignoreOptions);
        if (fileInfo.ignored) return;
    }

    const lspPath = __dirname;

    const source = document.getText();
    // @TODO create npm module later
    const pluginPath = path.join(lspPath, 'prettier-plugin-tact', 'prettier-plugin-tact.js'); // 'node_modules',
    const options = {
        'parser': 'tact-parser',
        'pluginSearchDirs': [lspPath],
        'plugins': [pluginPath],
    };

    const config = prettier.resolveConfig.sync(document.uri);

    if (config !== null) {
        prettier.clearConfigCache();
    }
    Object.assign(options, config);

    const startIndex = document.positionAt(0);
    const endIndex = document.positionAt(document.getText().length);

    const fullTextRange = Range.create(startIndex, endIndex);
    let formatted = "";
    try {
        formatted = prettier.format(source, options);
    } catch (e) {
        formatted = source;
        console.log(e);
    }
    return [TextEdit.replace(fullTextRange, formatted)];
}
