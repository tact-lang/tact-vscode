'use strict';
import { Position } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TactCodeWalker, Variable } from './codeWalkerService';
import { MarkupContent, MarkupKind } from 'vscode-languageserver/node';

export class HoverService {
    
    public rootPath: string | undefined;

    constructor(rootPath: string | undefined) {
        this.rootPath = rootPath;
    }

    public getHoverItems( document: TextDocument | undefined,
                          position: Position): MarkupContent {
        if (document == undefined) {
            return {
                kind: MarkupKind.Markdown,
                value: ""
                };
        }
        let suggestion = null;
        const lines = document.getText().split(/\r?\n/g);
        const wordLine = lines[position.line];

        const wordObject = this.getWord(wordLine, position.character);

        if (wordObject.word == "") {
            return {
                kind: MarkupKind.Markdown,
                value: ""
                };
        }

        var walker = new TactCodeWalker(this.rootPath);
        const offset = document.offsetAt(position);

        var documentContractSelected = walker.getAllContracts(document, position);

        let variableType: string | undefined = "global";
        if (documentContractSelected != undefined && documentContractSelected.selectedContract != undefined) {
            let allVariables: Variable[] = documentContractSelected.selectedContract.getAllStateVariables();
            let selectedFunction = documentContractSelected.selectedContract.getSelectedFunction(offset);
            if (selectedFunction !== undefined)  {
                selectedFunction.findVariableDeclarationsInScope(offset);
                //adding input parameters
                allVariables = allVariables.concat(selectedFunction.input);
                //ading all variables
                allVariables = allVariables.concat(selectedFunction.variablesInScope);
            }

            if (wordObject.word.indexOf(".") != -1) {
                const prefix = wordObject.word.split('.')[0];
                allVariables.forEach(item => {
                    if (item.name === prefix) {
                        if (item.type?.isArray) {
                            variableType = "array";
                        } else if (item.type?.isMapping) {
                            variableType = "mapping";
                        } else {
                            variableType = item.type?.name;
                        }
                    }
                })
            }
        }

        for (const [, value] of Object.entries(hoverDescription)) {
            const re = new RegExp(`${value.pattern}$`);
            if (!wordObject.word.match(re)) continue;
            if (value.type != variableType) continue;
            if (Array.isArray(value.description)) {
                suggestion =  value.description.join("\n");
            } else {
                suggestion = value.description;
            }
        }
        return  { kind: MarkupKind.Markdown, value: suggestion ?? "" };
    }

    private getWord(lineText: string, charecterPosition:number): any {
        let offsetStart = charecterPosition;
        let offsetEnd = charecterPosition;
        let wordStart = charecterPosition;
        let wordEnd = charecterPosition;
        const stopCharacters = [" ", "(", ")", "[", "]", ";", "!", "+", "-", "*", ":", ".", "{", "=", "&", "^", "%", "~"];
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

const hoverDescription = {
    "import contract": {
        "pattern": "import",
        "type": "global",
        "description": [
            "Tact compiler allows user to import files.\n",
            "Example:\n",
            "```\nimport \"@stdlib/jetton\";\n```",
            "```\ncontract SampleJetton with Jetton {\n\\\\...\n}\n```"
        ]
    },
    "address": {
        "pattern": "Address",
        "type": "global",
        "description": [
            "Type Address.\n",
            "Example:\n",
            "```\nowner: Address;\n```\n"
        ]
    },
    "bool": {
        "pattern": "Bool",
        "type": "global",
        "description": [
            "Type Bool.\n",
            "Example:\n",
            "```\ncompleted: Bool;\n```\n"
        ]
    },
    "int": {
        "pattern": "Int",
        "type": "global",
        "description": [
            "Type Int.\n",
            "Example:\n",
            "```\namount: Int;\n```\n"
        ]
    },
    "SendParameters": {
        "pattern": "SendParameters",
        "type": "global",
        "description": [
            "This function will prepare parameters for the message sending:\n",
            "  bounce:bool\n",
            "  to:address\n",
            "  value:int257\n",
            "  mode:int257\n",
            "  body:Maybe ^cell\n",
            "  code:Maybe ^cell\n",
            "  data:Maybe ^cell"
        ]
    },
    "receive": {
        "pattern": "receive",
        "type": "global",
        "description": [
            "Receiver functions are special function that are responsible of ",
            "receiving messages in contracts and could be defined only within ",
            "a contract or trait."
        ]
    },
    "require": {
        "pattern": "require",
        "type": "global",
        "description": [
            "fun require(condition: Bool, error: String);\nChecks condition and throws an exception with error message if condition is false."
        ]
    },
    "getConfigParam":  {
        "pattern": "getConfigParam",
        "type": "global",
        "description": [
            "Get config param.",
            "Return Cell."
        ]
    },
}