import { HoverProvider, Hover, MarkdownString, Position, TextDocument } from 'vscode';
import { MaudeData } from './maudeData';

export class MaudeHoverProvider implements HoverProvider {
  provideHover(document: TextDocument, position: Position): Hover | undefined {
    const range = document.getWordRangeAtPosition(position);
    if (!range) return undefined;

    const word = document.getText(range).toLowerCase();
    if (!word) return undefined;

    const entry = MaudeData.getByLabel(word);
    if (!entry) return undefined;

    const markdown = new MarkdownString(entry.documentation);
    return new Hover(markdown, range);
  }
}
