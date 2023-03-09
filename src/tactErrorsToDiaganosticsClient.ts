'use strict';
import { DiagnosticCollection, Diagnostic, Uri } from 'vscode';
import { errorToDiagnostic } from './tactErrorsToDiagnostics';
import { DiagnosticSeverity } from 'vscode-languageserver';

interface ErrorWarningCounts {
    errors: number;
    warnings: number;
}

export function errorsToDiagnostics(diagnosticCollection: DiagnosticCollection, errors: any): ErrorWarningCounts {
        const errorWarningCounts: ErrorWarningCounts = {errors: 0, warnings: 0};
        const diagnosticMap: Map<Uri, Diagnostic[]> = new Map();

        errors.forEach((error: any) => {
            const {diagnostic, fileName} = errorToDiagnostic(error);

            const targetUri = Uri.file(fileName);
            let diagnostics = diagnosticMap.get(targetUri);

            if (!diagnostics) {
                diagnostics = [];
            }

            diagnostics.push(diagnostic);
            diagnosticMap.set(targetUri, diagnostics);
        });

        const entries: [Uri, Diagnostic[]][] = [];

        diagnosticMap.forEach((diags, uri) => {
            errorWarningCounts.errors += diags.filter((diagnostic) => diagnostic.severity === DiagnosticSeverity.Error).length;
            errorWarningCounts.warnings += diags.filter((diagnostic) => diagnostic.severity === DiagnosticSeverity.Warning).length;

            entries.push([uri, diags]);
        });

        diagnosticCollection.set(entries);

        return errorWarningCounts;
    }
