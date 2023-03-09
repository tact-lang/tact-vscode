'use strict';
import * as path from 'path';
import * as fs from 'fs';
import { errorToDiagnostic } from './tactErrorsToDiagnostics';
import { ContractCollection } from './model/contractsCollection';
import { CompilerContext } from './../tact/src/context';
import { precompile } from './../tact/src/pipeline/precompile';
import files from "./../tact/src/imports/stdlib";
import { createVirtualFileSystem } from "./../tact/src/main";
export class TactCompiler {

    public rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    public isRootPathSet(): boolean {
        return this.rootPath !== undefined && this.rootPath !== "";
    }

    private async runCompilation(args: {
        file: string,
        sources: any,
        outputDir?: string,
    }): Promise<String> {
        let errors = [];
        const ext = path.extname(args.file);
        if (ext !== ".tact") {
            errors[0] = 'Choose Tact source file (.tact).';
            return "";
        }

        try {
            let ctx = new CompilerContext({ shared: {} });
            const pathKey = path.relative( this.rootPath, args.file).replaceAll('\\','/');
            const pathContent = fs.readFileSync(pathKey);
            const fsObject = {} as any;
                  fsObject[pathKey] = pathContent.toString('base64');
                for (let pathKey in args.sources) {
                    fsObject[path.relative( this.rootPath, pathKey).replaceAll('\\','/')] = Buffer.from(args.sources[pathKey].content).toString('base64');
                }
                ctx = precompile(ctx, 
                                createVirtualFileSystem(path.resolve(this.rootPath).replaceAll('\\','/'), fsObject), createVirtualFileSystem('@stdlib', files),
                                path.relative( this.rootPath, args.file).replaceAll('\\','/')
                                );
        } catch(e: any) {
            return `${args.file}\n${e.message}`;
        }

        return "";
    }

    public async compile(contracts: any): Promise<any> {
        let rawErrors = [];

        for (let fileNameId in contracts.sources) {
            rawErrors.push(await this.runCompilation({"file": fileNameId, "sources": contracts.sources}));
        }
        return this.parseErrors(rawErrors);
    }

    private parseErrors(rawErrors: String[]) {
        let outputErrors: any = [];
        for (let i in rawErrors) {
            let error = rawErrors[i].split("\n");
            if (error.length == 1) continue;
            // we check all imported files, but an error must be shown only for the files that contains them initially
            if (error[1].indexOf(error[0]) == -1) continue;
            if (error.length == 2) {
                outputErrors.push({"severity": "Error", "message": error[error.length-1], "file": error[0], "length": 2, "line": 1, "column": 1});
            } else {
                const match = Array.from(error[2].matchAll(/Line ([0-9]*), col ([0-9]*):/g)); //place
                let matchErrorLength = error[5].match(/\^(~*)/);
                let message = [error[1]].concat(error.slice(3, error.length-1)).join("\n");
                outputErrors.push({"severity": "Error", "message": message, "file": error[0], "length": matchErrorLength != null ? matchErrorLength[1].length : 2, "line": match[0][1], "column": match[0][2]});
            }
        }
        return outputErrors;
    }

    public async compileTactDocumentAndGetDiagnosticErrors(filePath: string, documentText: string) {
        if (this.isRootPathSet()) {
            const contracts = new ContractCollection();
            contracts.addContractAndResolveImports(filePath, documentText);
            const contractsForCompilation = contracts.getDefaultContractsForCompilationDiagnostics();
            const output = await this.compile(contractsForCompilation);
            if (output) {
                return output.map((error: any) => errorToDiagnostic(error));
            }
        } else {
            const contract: any = {};
            contract[filePath] = documentText;
            const output = await this.compile({ sources: contract });

            if (output) {
                return output.map((error: any) => errorToDiagnostic(error));
            }
        }
        return [];
    }

}

