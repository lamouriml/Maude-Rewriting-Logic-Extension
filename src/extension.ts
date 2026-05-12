import { ExtensionContext, languages, commands, window } from 'vscode';
import { MaudeCompletionProvider } from './completionProvider';
import { MaudeHoverProvider } from './hoverProvider';

const MAUDE_LANGUAGE_ID = 'maude';

export function activate(context: ExtensionContext): void {
  registerCompletionProviders(context);
  registerHoverProvider(context);
  registerLegacyCommands(context);

  window.showInformationMessage('Maude language support is now active!');
}

function registerCompletionProviders(context: ExtensionContext): void {
  const completionProvider = languages.registerCompletionItemProvider(
    MAUDE_LANGUAGE_ID,
    new MaudeCompletionProvider(),
    ...[' ', '.', '(', '[', ':', '>', '=']
  );
  context.subscriptions.push(completionProvider);
}

function registerHoverProvider(context: ExtensionContext): void {
  const hoverProvider = languages.registerHoverProvider(
    MAUDE_LANGUAGE_ID,
    new MaudeHoverProvider()
  );
  context.subscriptions.push(hoverProvider);
}

function registerLegacyCommands(context: ExtensionContext): void {
  context.subscriptions.push(
    commands.registerCommand('maude.showHello', () => {
      window.showInformationMessage('Hello from Maude extension!');
    })
  );
}

export function deactivate(): void {
}
