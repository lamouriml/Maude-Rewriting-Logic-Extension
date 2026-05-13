import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import {
    ExtensionContext, languages, commands, window, workspace, ColorThemeKind,
} from 'vscode';
import { MaudeCompletionProvider } from './completionProvider';
import { MaudeHoverProvider } from './hoverProvider';
import { MaudeSymbolProvider } from './symbols/symbolProvider';
import { MaudeDefinitionProvider } from './definition/definitionProvider';
import { OutputProcessor } from './outputProcessor';
import { VisualizationPanel } from './visualizationPanel';

const MAUDE_LANGUAGE_ID = 'maude';

let maudeProcess: ChildProcess | null = null;
let outputProcessor: OutputProcessor | null = null;
let panel: VisualizationPanel | null = null;
let isDark = true;
let executionState: 'ready' | 'running' = 'ready';

export function activate(context: ExtensionContext): void {
    registerCompletionProviders(context);
    registerHoverProvider(context);
    registerSymbolProvider(context);
    registerDefinitionProvider(context);
    registerSessionCommands(context);
    window.showInformationMessage('Maude language support is now active!');
}

function registerCompletionProviders(context: ExtensionContext): void {
    const provider = languages.registerCompletionItemProvider(
        MAUDE_LANGUAGE_ID, new MaudeCompletionProvider(),
        ...[' ', '.', '(', '[', ':', '>', '=']
    );
    context.subscriptions.push(provider);
}

function registerHoverProvider(context: ExtensionContext): void {
    context.subscriptions.push(
        languages.registerHoverProvider(MAUDE_LANGUAGE_ID, new MaudeHoverProvider())
    );
}

function registerSymbolProvider(context: ExtensionContext): void {
    context.subscriptions.push(
        languages.registerDocumentSymbolProvider(MAUDE_LANGUAGE_ID, new MaudeSymbolProvider())
    );
}

function registerDefinitionProvider(context: ExtensionContext): void {
    context.subscriptions.push(
        languages.registerDefinitionProvider(MAUDE_LANGUAGE_ID, new MaudeDefinitionProvider())
    );
}

function registerSessionCommands(context: ExtensionContext): void {
    context.subscriptions.push(
        commands.registerCommand('maude.openVisualization', openSession),
        commands.registerCommand('maude.closeVisualization', closeSession),
    );
}

function getCwd(): string | undefined {
    const config = workspace.getConfiguration('maude');
    const configuredCwd = config.get<string>('workingDirectory', '');
    if (configuredCwd) return configuredCwd;

    const exePath = config.get<string>('executablePath', 'maude');
    if (exePath && exePath !== 'maude') {
        const exeDir = path.dirname(exePath);
        if (exeDir) return exeDir;
    }
    return workspace.workspaceFolders?.[0]?.uri?.fsPath;
}

async function openSession(): Promise<void> {
    killMaude();

    const config = workspace.getConfiguration('maude');
    const exePath = config.get<string>('executablePath', 'maude');
    const cwd = getCwd();

    // Log CWD for debugging
    console.log(`Maude-RL: exePath=${exePath}, cwd=${cwd}`);

    outputProcessor = new OutputProcessor();
    isDark = window.activeColorTheme.kind === ColorThemeKind.Dark
        || window.activeColorTheme.kind === ColorThemeKind.HighContrast;

    try {
        maudeProcess = spawn(exePath, [], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: cwd,
        });
    } catch (err: any) {
        window.showErrorMessage(`Failed to start Maude: ${err.message}`);
        return;
    }

    maudeProcess.stdout?.on('data', onMaudeData);
    maudeProcess.stderr?.on('data', onMaudeData);

    maudeProcess.on('error', (err: Error) => {
        window.showErrorMessage(`Maude error: ${err.message}. Check settings.`);
        closeSession();
    });

    maudeProcess.on('exit', (code) => {
        if (maudeProcess) {
            outputProcessor?.append(`[Maude exited with code ${code}]\n`);
            refreshPanel();
        }
        maudeProcess = null;
    });

    if (!panel) {
        panel = new VisualizationPanel();
        panel.create();
        panel.onDidReceiveCommand(onUserCommand);
        panel.onStopRequested(onStopRequested);
        panel.onClearRequested(onClearRequested);
        panel.onStartRequested(onStartRequested);
    } else {
        panel.reveal();
    }
    refreshPanel();
}

function onMaudeData(data: Buffer): void {
    const text = data.toString();
    outputProcessor?.append(text);
    if (text.includes('\nMaude>') || text.endsWith('Maude> ')) {
        executionState = 'ready';
    }
    refreshPanel();
}

function onUserCommand(cmd: string): void {
    executionState = 'running';
    outputProcessor?.append(`Maude> ${cmd}\n`);
    refreshPanel();
    if (maudeProcess?.stdin?.writable) {
        maudeProcess.stdin.write(cmd + '\n');
    }
}

function onStopRequested(): void {
    if (!maudeProcess) return;
    try {
        maudeProcess.kill('SIGINT');
        outputProcessor?.append('[Interrupted]\n');
    } catch {
        try { maudeProcess?.kill('SIGTERM'); } catch { /* */ }
    }
    executionState = 'ready';
    refreshPanel();
}

function onClearRequested(): void {
    outputProcessor?.clear();
    // Keep Maude process running, just clear the buffer
    refreshPanel();
}

function onStartRequested(): void {
    // Full restart: kill Maude, clear everything, start fresh
    killMaude();
    outputProcessor?.clear();
    executionState = 'ready';
    openSession();
}

function killMaude(): void {
    if (!maudeProcess) return;
    try { maudeProcess.kill('SIGINT'); } catch { /* */ }
    setTimeout(() => {
        if (maudeProcess) try { maudeProcess.kill('SIGKILL'); } catch { /* */ }
    }, 1500);
    maudeProcess = null;
    executionState = 'ready';
}

function refreshPanel(): void {
    if (!panel || !outputProcessor) return;
    isDark = window.activeColorTheme.kind === ColorThemeKind.Dark
        || window.activeColorTheme.kind === ColorThemeKind.HighContrast;
    try {
        panel.update(outputProcessor.generateHtml(isDark), executionState);
    } catch { /* */ }
}

function closeSession(): void {
    killMaude();
    outputProcessor = null;
    panel?.dispose();
    panel = null;
}

export function deactivate(): void {
    closeSession();
}
