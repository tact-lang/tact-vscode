import * as prettier from 'prettier';
import { workspace, ExtensionContext, Range, TextDocument, TextEdit } from 'vscode';
import * as path from 'path';

export function formatDocument(document: TextDocument, context: ExtensionContext): TextEdit[] | undefined {
    const rootPath = workspace.getWorkspaceFolder(document.uri)?.name;
    
    const ignoreOptions = { ignorePath: path.join(rootPath ? rootPath: "", '.prettierignore') };

    const fileInfo = prettier.getFileInfo.sync(document.uri.fsPath, ignoreOptions);
    
    if (!fileInfo.ignored) {
      const source = document.getText();
      // @TODO create npm module later
      const pluginPath = path.join(context.extensionPath, 'out', 'prettier-plugin-tact', 'prettier-plugin-tact.js'); // 'node_modules', 
      const options = {
        'parser': 'tact-parser',
        'pluginSearchDirs': [context.extensionPath],
        'plugins': [pluginPath],
      };
      //
      const config = prettier.resolveConfig.sync(document.uri.fsPath);
      if (config !== null) {
        prettier.clearConfigCache();
      }
      Object.assign(options, config);
      
      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(document.lineCount - 1);
      const fullTextRange = new Range(firstLine.range.start, lastLine.range.end);
      let formatted = "";
      try {
        formatted = prettier.format(source, options);
      } catch(e) {
        formatted = source;
        console.log(e);
      }
      return [TextEdit.replace(fullTextRange, formatted)];
    }
}
