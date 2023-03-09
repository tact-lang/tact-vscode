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
                    line: Number(error.line).valueOf() - 1,
                },
                start: {
                    character: Number(error.column).valueOf() - 1,
                    line: Number(error.line).valueOf() - 1,
                },
            },
            severity: severity,
        },
        fileName: fileName,
    };
}