'use strict';
import * as fs from 'fs';
import {Contract} from './contract';

export class ContractCollection {
    public contracts: Array<Contract>;
    constructor() {
        this.contracts = new Array<Contract>();
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

    public addContractAndResolveImports(contractPath: string, code: string) {
        const contract = this.addContract(contractPath, code);
        if (contract !== null) {
            contract.resolveImports();
            contract.imports.forEach(foundImport => {
                if (fs.existsSync(foundImport)) {
                    if (!this.containsContract(foundImport)) {
                        const importContractCode = this.readContractCode(foundImport);
                        if (importContractCode != null) {
                            this.addContractAndResolveImports(foundImport, importContractCode);
                        }
                    }
                }
            });
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

    private readContractCode(contractPath: string) {
        if (fs.existsSync(contractPath)) {
            return fs.readFileSync(contractPath, 'utf8');
        }
        return null;
    }
}
