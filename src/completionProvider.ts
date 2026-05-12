import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  Position,
  TextDocument,
  SnippetString,
} from 'vscode';
import { MaudeData, MaudeDocEntry } from './maudeData';

export class MaudeCompletionProvider implements CompletionItemProvider {
  private buildItem(entry: MaudeDocEntry): CompletionItem {
    const kindMap: Record<string, CompletionItemKind> = {
      keyword: CompletionItemKind.Keyword,
      command: CompletionItemKind.Function,
      attribute: CompletionItemKind.Property,
      moduleDecl: CompletionItemKind.Module,
      importation: CompletionItemKind.Reference,
      dataType: CompletionItemKind.TypeParameter,
      operation: CompletionItemKind.Method,
      logic: CompletionItemKind.Function,
      oo: CompletionItemKind.Class,
      parameterization: CompletionItemKind.Module,
      meta: CompletionItemKind.Function,
      environment: CompletionItemKind.Function,
      builtin: CompletionItemKind.TypeParameter,
    };

    const item = new CompletionItem(entry.label, kindMap[entry.kind] ?? CompletionItemKind.Keyword);
    item.detail = entry.detail;
    item.documentation = new MarkdownString(entry.documentation);

    if (entry.snippet) {
      item.insertText = new SnippetString(entry.snippet);
    }

    return item;
  }

  provideCompletionItems(
    document: TextDocument,
    position: Position
  ): CompletionItem[] {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    const wordMatch = linePrefix.match(/(?:^|\s)(\w*)$/);

    if (!wordMatch) {
      return MaudeData.keywords.map(e => this.buildItem(e));
    }

    const prefix = wordMatch[1].toLowerCase();

    const filtered = MaudeData.keywords.filter(e =>
      e.label.toLowerCase().startsWith(prefix)
    );

    if (filtered.length === 0) {
      return MaudeData.keywords.map(e => this.buildItem(e));
    }

    return filtered.map(e => this.buildItem(e));
  }
}
