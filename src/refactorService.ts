'use strict';
import { Position } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Range, WorkspaceChange } from 'vscode-languageserver';

export class RefactorService {
    
    public rootPath: string | undefined;

    constructor(rootPath: string | undefined) {
        this.rootPath = rootPath;
    }

    public rename(document: TextDocument | undefined, position: Position, newValue: string) {
        if (document == undefined) {
            return;
        }
        const lines = document.getText().split(/\r?\n/g);
        const wordLine = lines[position.line];

        const wordObject = this.getWord(wordLine, position.character-1);

        const workspaceEdit = new WorkspaceChange();
        workspaceEdit.getTextEditChange(document.uri).replace(Range.create(Position.create(position.line, wordObject.start+1), Position.create(position.line, wordObject.end)), newValue);

        const findWord = wordObject.word;
        for (let i = 0; i < lines.length; i++) {
            if (i == position.line) {
                continue;
            }
            let pos = -1;
            while (lines[i].length > pos + 1) {
                pos = lines[i].indexOf(findWord, pos);
                const localWordObject = this.getWord(lines[i], pos+1);
                if (pos != -1 && localWordObject.word == findWord) {
                    workspaceEdit.getTextEditChange(document.uri).replace(Range.create(Position.create(i, pos), Position.create(i, pos + wordObject.word.length)), newValue);
                    pos++;
                } else {
                    pos = lines[i].length;
                }
            }
        }

        return workspaceEdit.edit;
    }

    public dump(document: TextDocument | undefined, range: Range) {
        if (document == undefined) {
            return;
        }
        const lines = document.getText().split(/\r?\n/g);
        const wordLine = lines[range.start.line];

        const wordObject = this.getWord(wordLine, range.start.character-1, [" ", "(", ")", "[", "]", ";", ",", "!", "+", "-", "*", ":", "{", "=", "&", "^", "%", "~"]);

        const startLineText = document.getText({
            start: { line: range.start.line, character: 0 },
            end: { line: range.start.line, character: range.start.character }
        }) || '';        
        const indentation = startLineText.match(/^\s*/)?.[0] || '';
        const workspaceEdit = new WorkspaceChange();
        workspaceEdit.getTextEditChange(document.uri).insert(Position.create(range.start.line + 1, 0), `${indentation}dump(${wordObject.word});\n`);
        return workspaceEdit.edit;
    }

    private getWord(lineText: string, charecterPosition: number, stopCharacters = [" ", "(", ")", "[", "]", ";", ",", "!", "+", "-", "*", ":", ".", "{", "=", "&", "^", "%", "~"]): any {
        let offsetStart = charecterPosition;
        let offsetEnd = charecterPosition;
        let wordStart = charecterPosition;
        let wordEnd = charecterPosition;
        while (offsetStart >= -1) {
            wordStart = offsetStart;
            if (stopCharacters.includes(lineText[offsetStart])) {
                break;
            }
            offsetStart--;
        }
        while (offsetEnd <= lineText.length) {
            wordEnd = offsetEnd;
            if (stopCharacters.includes(lineText[offsetEnd])) {
                break;
            }
            offsetEnd++;
        }
        const word = lineText.substr(wordStart+1, wordEnd-(wordStart+1));
        return {"start": wordStart,
                "end": wordEnd,
                "word": word
                }
    }
}
