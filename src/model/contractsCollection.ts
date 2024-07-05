'use strict';
import * as fs from 'fs';
import {Contract} from './contract';
import { DocumentStore } from '../documentStore';

export class ContractCollection {
    public contracts: Array<Contract>;
    private documentStore: DocumentStore;
    constructor(documentStore: DocumentStore) {
        this.contracts = new Array<Contract>();
        this.documentStore = documentStore;
    }

    public findContract(contract: Contract, contractPath: string) {
        return contract.absolutePath === contractPath;
    }

    public containsContract(contractPath: string) {
        return this.contracts.findIndex((contract: Contract) => { return contract.absolutePath === contractPath; }) > -1;
    }

    public getDefaultContractsForCompilationDiagnostics() {
        return this.getContractsForCompilation();
    }

    public getContractsForCompilation() {
        const contractsForCompilation: any = {};
        // we must to use reversed array, because imports must be handled before the basic smart contract code
        this.contracts.reverse().forEach(contract => {
            contractsForCompilation[contract.absolutePath] = {content: contract.code};
        });
        const compilation = {
            settings: {},
            sources : contractsForCompilation,
        };
        return compilation;
    }

    public async addContractAndResolveImports(contractPath: string, code: string) {
        const contract = this.addContract(contractPath, code);
        if (contract !== null) {
            contract.resolveImports();
            
            // Collect all the promises from the imports
            const importPromises = contract.imports.map(async foundImport => {
                if (fs.existsSync(foundImport)) {
                    if (!this.containsContract(foundImport)) {
                        const importContractCode = await this.readContractCode(foundImport);
                        if (importContractCode.exists) {
                            await this.addContractAndResolveImports(foundImport, importContractCode.document.getText());
                        }
                    }
                }
            });
            
            // Wait for all the import promises to resolve
            await Promise.all(importPromises);
        }
        return contract;
    }

    private addContract(contractPath: string, code: string) {
        if (!this.containsContract(contractPath)) {
            const contract = new Contract(contractPath, code);
            this.contracts.push(contract);
            return contract;
        }
        return null;
    }

    private async readContractCode(contractPath: string) {
        return await this.documentStore.retrieve(contractPath);
    }
}
