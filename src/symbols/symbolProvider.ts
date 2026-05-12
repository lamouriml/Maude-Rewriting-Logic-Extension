import {
  DocumentSymbolProvider, DocumentSymbol, SymbolKind,
  TextDocument, CancellationToken,
  Range, Position,
} from 'vscode';
import { extractMaudeSymbols } from './symbolExtractor';
import { SymbolInfo, MaudeSymbolKind } from './symbolKinds';

const kindMap: Record<MaudeSymbolKind, SymbolKind> = {
  module: SymbolKind.Module,
  operator: SymbolKind.Function,
  equation: SymbolKind.Null,
  rule: SymbolKind.Event,
  sort: SymbolKind.Class,
  class: SymbolKind.Class,
  message: SymbolKind.Method,
  view: SymbolKind.Module,
  theory: SymbolKind.Module,
  variable: SymbolKind.Variable,
};

function toDocumentSymbol(info: SymbolInfo): DocumentSymbol {
  const range = new Range(info.line, info.character, info.endLine, info.endCharacter);
  const selectionRange = new Range(info.line, info.character, info.line, info.character + info.name.length);
  return new DocumentSymbol(
    info.name,
    info.detail,
    kindMap[info.kind] ?? SymbolKind.Null,
    range,
    selectionRange,
  );
}

export class MaudeSymbolProvider implements DocumentSymbolProvider {
  provideDocumentSymbols(
    document: TextDocument,
    _token: CancellationToken,
  ): DocumentSymbol[] {
    const allSymbols = extractMaudeSymbols(document);
    const root: DocumentSymbol[] = [];

    const moduleSymbols = allSymbols.filter(s => s.kind === 'module' || s.kind === 'theory');
    const memberSymbols = allSymbols.filter(s => s.kind !== 'module' && s.kind !== 'theory');
    const orphans = memberSymbols.filter(s => !s.containerName);

    for (const mod of moduleSymbols) {
      const modSym = toDocumentSymbol(mod);
      const children = memberSymbols
        .filter(s => s.containerName === mod.name)
        .map(toDocumentSymbol);
      if (children.length > 0) {
        modSym.children = children;
      }
      root.push(modSym);
    }

    for (const orphan of orphans) {
      root.push(toDocumentSymbol(orphan));
    }

    return root;
  }
}
