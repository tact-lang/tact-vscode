'use strict';
import { DiagnosticSeverity } from 'vscode-languageserver';

export interface CompilerError {
    diagnostic: any;
    fileName: string;
}

export function getDiagnosticSeverity(severity: string): DiagnosticSeverity {
    switch (severity) {
        case 'Error':
            return DiagnosticSeverity.Error;
        case 'Warning':
            return DiagnosticSeverity.Warning;
        case 'Info':
            return DiagnosticSeverity.Information;
        default:
            return DiagnosticSeverity.Error;
    }
}

export function errorToDiagnostic(error: any): CompilerError {
    let fileName = error.file;
    const errorMessage = error.message;
    const severity = getDiagnosticSeverity(error.severity);
    return {
        diagnostic: {
            message: errorMessage,
            range: {
                end: {
                    character: Number(error.column).valueOf() + Number(error.length).valueOf() - 1,
                    line: error.line != 0 ? Number(error.line).valueOf() - 1: 0,
                },
                start: {
                    character: error.column != 0 ? Number(error.column).valueOf() - 1: 0,
                    line: error.line != 0 ? Number(error.line).valueOf() - 1: 0,
                },
            },
            severity: severity,
        },
        fileName: fileName,
    };
}