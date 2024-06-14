'use strict';
import * as path from 'path';
import * as fs from 'fs';
import { errorToDiagnostic } from './tactErrorsToDiagnostics';
import { ContractCollection } from './model/contractsCollection';
import { check, createVirtualFileSystem, CheckResult, CheckResultItem } from '@tact-lang/compiler';
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
    }): Promise<CheckResult> {
        const ext = path.extname(args.file);
        if (ext !== ".tact") {
            return {
                ok: false,
                messages: [{
                    type: 'error',
                    message: 'Choose Tact source file (.tact).',
                    location: {
                        file: args.file,
                        line: 0,
                        column: 0,
                        length: 0
                    }
                }]
            };
        }

        const pathKey = path.relative( this.rootPath, args.file).replaceAll('\\','/');

        let rootPath = this.rootPath;

        // If the root path is not set, which occurs when a single file is opened separately, set the root path to the directory containing the file.
        if(!this.isRootPathSet()) {
            rootPath = path.dirname(args.file);
        }

        const pathContent = fs.readFileSync(pathKey);
        const fsObject = {} as any;
                fsObject[pathKey] = pathContent.toString('base64');
            for (let pathKey in args.sources) {
                const fileContent = args.sources[pathKey].content || args.sources[pathKey];
                fsObject[path.relative( rootPath, pathKey).replaceAll('\\','/')] = Buffer.from(fileContent).toString('base64');
            }
        const result: CheckResult = check({ project: createVirtualFileSystem(path.resolve(rootPath).replaceAll('\\','/'), fsObject),
                                            entrypoint: path.relative( rootPath, args.file).replaceAll('\\','/')
                                            });
        return result;
    }

    public async compile(contracts: any): Promise<any> {
        let rawErrors: CheckResultItem[] = [];

        for (let fileNameId in contracts.sources) {
            const result = await this.runCompilation({"file": fileNameId, "sources": contracts.sources});
            if (!result.ok) {
                rawErrors = rawErrors.concat(result.messages);
            }
        }
        return this.parseErrors(rawErrors);
    }

    private parseErrors(rawErrors: any[]) {
        let outputErrors: any = [];
        for (let i in rawErrors) {
            outputErrors.push({"severity": "Error", "message": rawErrors[i].message, "file": rawErrors[i].location.file, "length": rawErrors[i].location.length == 0 ? 2 : rawErrors[i].location.length, "line": rawErrors[i].location.line, "column": rawErrors[i].location.column});
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
