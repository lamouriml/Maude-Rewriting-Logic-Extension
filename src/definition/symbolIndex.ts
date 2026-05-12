import { TextDocument, Uri, Position } from 'vscode';
import { extractAllDefinitions, DefinitionEntry } from './regexExtractors';

export interface DefinitionLocation {
  uri: Uri;
  line: number;
  character: number;
}

export class SymbolIndex {
  private index = new Map<string, DefinitionLocation>();

  buildIndex(document: TextDocument): void {
    this.index.clear();
    const lines: string[] = [];
    for (let i = 0; i < document.lineCount; i++) {
      lines.push(document.lineAt(i).text);
    }
    const entries = extractAllDefinitions(lines);
    for (const entry of entries) {
      const key = entry.name.toLowerCase();
      if (!this.index.has(key)) {
        this.index.set(key, {
          uri: document.uri,
          line: entry.line,
          character: entry.character,
        });
      }
    }
  }

  getDefinition(name: string): DefinitionLocation | undefined {
    return this.index.get(name.toLowerCase());
  }

  clear(): void {
    this.index.clear();
  }
}
