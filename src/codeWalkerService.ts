import * as vscode from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ContractCollection } from './model/contractsCollection';
import { Parser } from './parser/tact';
import { DocumentStore } from './documentStore';

export class ParsedCode {
    public element: any;
    public name: string | undefined;
    public location: vscode.Location | undefined;

    protected isElementedSelected(element:any, offset:number | undefined): boolean {
        if (offset == undefined) {
            return false;
        }

        if (element !== undefined && element !== null) {
            if (element.start <= offset && offset <= element.end) {
                return true;
            }
        }
        return false;
    }
}

export class DeclarationType extends ParsedCode {
    static create(literal: any): DeclarationType {
        const declarationType = new DeclarationType();
        declarationType.initialise(literal);
        return declarationType;
    }
    public isArray: boolean | undefined;
    public isMapping: boolean | undefined;

    public initialise(literal: any) {
        this.element = literal;
        if (literal.members !== undefined && literal.members.length > 0) {
            this.name = literal.members[0];    
        } else {
            this.name = literal.literal;
        }
        this.isArray = literal.array_parts.length > 0;
        this.isMapping = false;
        const literalType = literal.literal;
        if (literalType.type !== undefined)  {
             this.isMapping = literalType.type === 'MappingExpression';
             this.name = 'map';
        }
    }
}

export class Contract2 extends ParsedCode {
    public functions: Function[] = [];
    public stateVariables: StateVariable[] = [];
    public structs: Struct[] = [];
    public messages: Message[] = [];
    public contractType: string | undefined;
    public extendsContracts: Contract2[] = [];
    public extendsContractNames: string[] = [];

    public initialise(element:any) {
        this.element = element;
        this.name = element.name;
        this.location; //
        this.contractType = element.type;
        this.initialiseChildren();                
    }

    public initialiseExtendContracts(contracts:Contract2[]) {
        if (this.extendsContracts.length === 0 && this.extendsContractNames.length > 0) {
            this.extendsContractNames.forEach(contractName => {
               let contractMatched =  contracts.find(x => x.name === contractName);
               if (contractMatched !== undefined) {
                    contractMatched.initialiseExtendContracts(contracts);
                    this.extendsContracts.push(contractMatched);
               }
            });
        }
    }

    public getSelectedFunction(offset:number) {
        let selectedFunction =  this.functions.find(x => {
            let element = x.element;
            if (element !== undefined && element !== null) {
               if (element.start <= offset && offset <= element.end) {
                    return true;
               }
            }
            return false;
        });

        return selectedFunction;
    }

    public getAllFunctions() : Function[] {
        let returnItems: Function[] = [];
        returnItems = returnItems.concat(this.functions);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllFunctions());
         });
        return returnItems;
    }

    public getAllStructs() : Struct[] {
        let returnItems: Struct[] = [];
        returnItems = returnItems.concat(this.structs);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllStructs());
         });
        return returnItems;
    }

    public getAllMessages() : Message[] {
        let returnItems: Message[] = [];
        returnItems = returnItems.concat(this.messages);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllMessages());
         });
        return returnItems;
    }

    public getAllStateVariables() : StateVariable[] {
        let returnItems: StateVariable[] = [];
        returnItems = returnItems.concat(this.stateVariables);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllStateVariables());
         });
        return returnItems;
    }

    public initialiseChildren(){
        if (this.element.is !== undefined) {
            this.element.is.forEach((isElement: any) => { 
                this.extendsContractNames.push(isElement.name);
            });
        }
        if (this.element.body !== undefined) {
            this.element.body.forEach((contractElement: any) => {
                if (contractElement.type === 'FunctionDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    this.functions.push(functionContract);
                }
/*
                if (contractElement.type === 'InitDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    this.functions.push(functionContract);
                }

                if (contractElement.type === 'ReceiveDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    this.functions.push(functionContract);
                }

                if (contractElement.type === 'OnBounceDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    this.functions.push(functionContract);
                }
*/
                if (contractElement.type === 'StateVariableDeclaration') {
                    let stateVariable = new StateVariable();
                    stateVariable.initialise(contractElement, this);
                    this.stateVariables.push(stateVariable);
                }

                if (contractElement.type === 'StructDeclaration') {
                    let struct = new Struct();
                    struct.initialise(contractElement, this);
                    this.structs.push(struct);
                }

                if (contractElement.type === 'MessageStatement') {
                    let message = new Message();
                    message.initialise(contractElement, this);
                    this.messages.push(message);
                }

            });
        }
    }
}

export class Function extends ParsedCode {
    public input:     Parameter[] = [];
    public output:    Parameter[] = [];
    public variablesInScope: FunctionVariable[] = [];
    public contract:  Contract2 | undefined;

    public initialise(element:any, contract:Contract2) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; //
        this.initialiseParamters();                
    }
    
    public initialiseParamters(){
        this.input = Parameter.extractParameters(this.element.params);
        this.output = Parameter.extractParameters(this.element.returnParams);
    }

    public findVariableDeclarationsInScope(offset:number | undefined) {
        if(this.element.body !== undefined && this.element.body.type === 'BlockStatement') {
            this.findVariableDeclarationsInInnerScope(offset, this.element.body);
        }
    }

    public findVariableDeclarationsInInnerScope(offset:number | undefined, block:any) {
        if(block !== undefined) {
            if(this.isElementedSelected(block, offset)) {
                if(block.body !== undefined) {
                    block.body.forEach((blockBodyElement: any) => {
                        if (blockBodyElement.type === 'ExpressionStatement') {
                            let expression = blockBodyElement.expression;
                            this.addVariableInScopeFromExpression(expression);
                        }

                        if (blockBodyElement.type === 'ForStatement') {
                            if(this.isElementedSelected(blockBodyElement, offset)) {
                                this.addVariableInScopeFromExpression(blockBodyElement.init);
                                this.findVariableDeclarationsInInnerScope(offset, blockBodyElement.body);
                            }
                        }

                        if (blockBodyElement.type === 'IfStatement') {
                            if(this.isElementedSelected(blockBodyElement, offset)) {
                                this.findVariableDeclarationsInInnerScope(offset, blockBodyElement.consequent);
                                this.findVariableDeclarationsInInnerScope(offset, blockBodyElement.alternate);
                            }
                        }
                    });
                }
            }
        }
    }

    private addVariableInScopeFromExpression(expression: any) {
        let declarationStatement = undefined;
        if (expression.type === 'AssignmentExpression') {
            if (expression.left.type === 'DeclarativeExpression') {
                declarationStatement = expression.left;
            }
        }

        if (expression.type === 'DeclarativeExpression') {
            declarationStatement = expression;
        }

        if (declarationStatement !== undefined) {
            let variable = new FunctionVariable();
            variable.element = declarationStatement;
            variable.name = declarationStatement.name;
            variable.type = DeclarationType.create(declarationStatement.literal);
            variable.function = this;
            this.variablesInScope.push(variable);
        }
    }
}

export class Message extends ParsedCode {
    public variables: MessageVariable[] = [];
    public contract:  Contract2 | undefined;

    public initialise(element:any, contract:Contract2) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; // 

        if (this.element.body !== undefined) {
            this.element.body.forEach((structBodyElement: any) => {
                if (structBodyElement.type === 'DeclarativeExpression'){
                    let variable = new MessageVariable();
                    variable.element = structBodyElement;
                    variable.name = structBodyElement.name;
                    variable.type = DeclarationType.create(structBodyElement.literal);
                    variable.message = this;
                    this.variables.push(variable);
                }
            });
        }
    }
}

export class Struct extends ParsedCode {
    public variables:     StructVariable[] = [];
    public contract:  Contract2 | undefined;

    public initialise(element:any, contract:Contract2) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; // 

        if (this.element.body !== undefined) {
            this.element.body.forEach((structBodyElement: any) => {
                if (structBodyElement.type === 'DeclarativeExpression' || structBodyElement.type === 'StateVariableDeclaration') {
                    let variable = new StructVariable();
                    variable.element = structBodyElement;
                    variable.name = structBodyElement.name;
                    variable.type = DeclarationType.create(structBodyElement.literal);
                    variable.struct = this;
                    this.variables.push(variable);
                }
            });
        }
    }
}

export class Variable extends ParsedCode {
    public type:  DeclarationType | undefined;
}

export class StructVariable extends Variable {
    public struct: Struct | undefined;
}

export class MessageVariable extends Variable {
    public message: Message | undefined;
}

export class FunctionVariable extends Variable {
    public function: Function | undefined;
}

export class StateVariable extends Variable {
    public initialise(element:any, contract:Contract2) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; //  
        this.type = DeclarationType.create(element.literal);            
    }
    public contract: Contract2 | undefined;
}

export class Parameter extends Variable {
    static extractParameters(params: any) : Parameter[] {
        const parameters: Parameter[] = [];
        if (typeof params !== 'undefined' && params !== null) {
            if (params.hasOwnProperty('params')) {
                params = params.params;
            }
            params.forEach((parameterElement: any) => {
                const parameter: Parameter = new Parameter();
                parameter.element = parameterElement;
                if (typeof parameterElement.literal != "undefined") {
                    parameter.type = DeclarationType.create(parameterElement.literal);
                } else {
                    //parameter.type = undefined;
                }
                if (typeof parameterElement.id !== 'undefined' && parameterElement.id !== null ) { // no name on return parameters
                    parameter.name = parameterElement.id;
                }
                parameters.push(parameter);
            });
        }
        return parameters;
    }
}

export class DocumentContract {
    public allContracts: Contract2[] = []; 
    public selectedContract: Contract2 | undefined;
}

export class TactCodeWalker {
  private rootPath: string | undefined;
  private tactparser = new Parser();
  private documentStore: DocumentStore;

  constructor(rootPath: string | undefined, documentStore: DocumentStore) {
    this.rootPath = rootPath;
    this.documentStore = documentStore;
  }

  public async getAllContracts(document: TextDocument, position: vscode.Position): Promise<DocumentContract> {
        let documentContract:DocumentContract = new DocumentContract();
        const documentText = document.getText();
        const contractPath = URI.parse(document.uri).fsPath;
        const contracts = new ContractCollection(this.documentStore);
        await contracts.addContractAndResolveImports(
            contractPath,
            documentText
        );
        const contract = contracts.contracts[0];
        const offset = document.offsetAt(position);
        
        documentContract = this.getSelectedContracts(documentText, offset, position.line);
 
        contracts.contracts.forEach(contractItem => {
            if (contractItem !== contract) {
                let contractsParsed = this.getContracts(contractItem.code);
                documentContract.allContracts = documentContract.allContracts.concat(contractsParsed);
            } else {
                if (documentContract.selectedContract !== undefined ) {
                    documentContract.selectedContract.messages = this.getMessages(contractItem.code);
                    documentContract.selectedContract.structs = this.getStructs(contractItem.code);
                }
            }
        });

        if (documentContract.selectedContract !== undefined ) {
            documentContract.selectedContract.initialiseExtendContracts(documentContract.allContracts); 
        }

        return documentContract;
  }

  private findElementByOffset(elements: Array<any>, offset: number): any {
    return elements.find(
      element => element.start <= offset && offset <= element.end,
    );
  }

  public getSelectedContracts(documentText: string, offset: number, line: number): DocumentContract {
    let contracts : DocumentContract = new DocumentContract();
    try {
        const result = this.tactparser.parse(documentText, "");
        let selectedElement = this.findElementByOffset(result.body, offset);
        result.body.forEach((element: any) => {       
            if (element.type === 'ContractStatement' || element.type == 'InterfaceStatement') {
                var contract = new Contract2();
                contract.initialise(element);
                if (selectedElement === element) {
                    contracts.selectedContract = contract;
                }
                contracts.allContracts.push(contract);
            }
        });
    } catch (error) {
        //if we error parsing (cannot cater for all combos) we fix by removing current line.
        const lines = documentText.split(/\r?\n/g);
        if (lines[line].trim() !== '') { //have we done it already?
            lines[line] = ''.padStart(lines[line].length, ' '); //adding the same number of characters so the position matches where we are at the moment
            let code = lines.join('\r\n');
            return this.getSelectedContracts(code, offset, line);
        }
    }
    return contracts;
  }

  public getContracts(documentText: string): Contract2[] {
    let contracts : Contract2[] = [];
    try {
        const result = this.tactparser.parse(documentText, "");
        result.body.forEach((element: any) => {
            if (element.type === 'ContractStatement' || element.type == 'InterfaceStatement') {
                var contract = new Contract2();
                contract.initialise(element);
                contracts.push(contract);
            }
        });
    } catch (error) {
        // console.log(error.message);
        const result = this.tactparser.getPrevResult();
        result.body.forEach((element: any) => {
            if (element.type === 'ContractStatement' || element.type == 'InterfaceStatement') {
                var contract = new Contract2();
                contract.initialise(element);
                contracts.push(contract);
            }
        });
    }
    return contracts;
  }

  public getStructs(documentText: string): Struct[] {
    let structs : Struct[] = [];
    try {
        const result = this.tactparser.parse(documentText, "");
        result.body.forEach((element: any) => {
            if (element.type === 'StructDeclaration') {
                var struct = new Struct();
                struct.initialise(element, new Contract2());
                structs.push(struct);
            }
        });
    } catch (error) {
        // console.log(error.message);
        const result = this.tactparser.getPrevResult();
        result.body.forEach((element: any) => {
            if (element.type === 'StructDeclaration') {
                var struct = new Struct();
                struct.initialise(element, new Contract2());
                structs.push(struct);
            }
        });
    }
    return structs;
  }

  public getMessages(documentText: string): Message[] {
    let messages : Message[] = [];
    try {
        const result = this.tactparser.parse(documentText, "");
        result.body.forEach((element: any) => {
            if (element.type === 'MessageStatement') {
                var message = new Message();
                message.initialise(element, new Contract2());
                messages.push(message);
            }
        });
    } catch (error) {
        // console.log(error.message);
        const result = this.tactparser.getPrevResult();
        result.body.forEach((element: any) => {
            if (element.type === 'MessageStatement') {
                var message = new Message();
                message.initialise(element, new Contract2());
                messages.push(message);
            }
        });
    }
    return messages;
  }
}
