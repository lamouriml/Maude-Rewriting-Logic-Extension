import {
  DefinitionProvider, Definition, DefinitionLink,
  TextDocument, Position, CancellationToken,
  Location,
} from 'vscode';
import { SymbolIndex } from './symbolIndex';

export class MaudeDefinitionProvider implements DefinitionProvider {
  private symbolIndex = new SymbolIndex();

  provideDefinition(
    document: TextDocument,
    position: Position,
    _token: CancellationToken,
  ): Definition | DefinitionLink[] | undefined {
    const range = document.getWordRangeAtPosition(position);
    if (!range) return undefined;

    const word = document.getText(range);
    if (!word) return undefined;

    this.symbolIndex.buildIndex(document);
    const def = this.symbolIndex.getDefinition(word);
    if (!def) return undefined;

    return new Location(def.uri, new Position(def.line, def.character));
  }
}
