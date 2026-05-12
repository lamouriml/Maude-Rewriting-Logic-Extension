# Development Guide

## Getting the Codebase

```bash
git clone https://github.com/lamouriml/Maude-Rewriting-Logic-Extension.git
cd Maude-Rewriting-Logic-Extension
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Visual Studio Code](https://code.visualstudio.com/) >= 1.85.0

## Setup

```bash
npm install
```

## Compile

```bash
npm run compile
```

Or watch mode (auto-recompiles on changes):

```bash
npm run watch
```

## Run in VS Code (Extension Host)

1. Open the `Maude-Rewriting-Logic-Extension` folder in VS Code
2. Press `F5` (or Run → Start Debugging)
3. A new VS Code window opens with the extension loaded
4. Open or create a `.maude` file to test syntax highlighting, autocomplete, and hover docs

## Package

```bash
npm install -g @vscode/vsce
vsce package
```

Produces `Maude-Rewriting-Logic-Extension-<version>.vsix` in the project root.

## Install the VSIX

1. VS Code → Extensions view (`Ctrl+Shift+X`)
2. `...` → Install from VSIX...
3. Select the `.vsix` file

## Project Structure

```
src/
  extension.ts              # Activation entry point
  maudeData.ts              # Centralized language data
  completionProvider.ts     # Autocomplete provider
  hoverProvider.ts          # Hover documentation provider
syntaxes/
  maude.tmLanguage.json     # TextMate grammar for highlighting
snippets/
  maude.json                # Code snippets
language-configuration.json # Comments, brackets, indentation
```

## How to Add / Modify Features

### Add a New Keyword (Autocomplete + Hover)

Edit `src/maudeData.ts`. Each entry in the `keywords` array follows this structure:

```typescript
{
  label: 'keyword-name',         // The word users type
  detail: 'Short description',   // Shown in autocomplete list
  documentation: `## Title       // Markdown content shown on hover
Full description here.

**Syntax:**
\`\`\`maude
example usage .
\`\`\`

**Example:**
\`\`\`maude
concrete example .
\`\`\``,
  kind: 'keyword',               // One of: keyword | command | attribute | moduleDecl | importation | dataType | operation | logic | oo | parameterization | meta | environment | builtin
  snippet?: 'text $1 here .'     // Optional snippet syntax (uses VSCode SnippetString format)
}
```

After editing, recompile: `npm run compile`.

### Add a New Snippet

Edit `snippets/maude.json`. Each entry follows this structure:

```json
"Snippet Name": {
  "prefix": "trigger-word",
  "body": [
    "first line with ${1:placeholder}",
    "\tsecond line indented",
    "third line with ${2|choice1,choice2|}"
  ],
  "description": "What this snippet does"
}
```

Snippet placeholders:
- `${1:name}` — tab-stop with default text
- `${2}` — tab-stop only
- `${1|a,b|}` — tab-stop with choices
- `$0` — final cursor position

After editing, reload the VS Code window to pick up changes (no compile needed for snippets).

### Add a New Syntax Highlighting Rule

Edit `syntaxes/maude.tmLanguage.json`. Add a new pattern in the `repository` object:

```json
"patternName": {
  "name": "scope.name.maude",
  "match": "\\bkeyword\\b"
}
```

Then include it in the main `patterns` array:

```json
{ "include": "#patternName" }
```

Common scope names:
- `keyword` — for language keywords
- `keyword.control` — for control flow
- `keyword.operator` — for operators
- `support.type` — for built-in types
- `constant.numeric` — for numbers
- `string.quoted` — for strings
- `comment.line` — for comments
- `variable.other` — for variables

After editing, reload the VS Code window (no compile needed for grammar files).

### Add a New Language Configuration

Edit `language-configuration.json` to change:
- **Comments** — line and block comment syntax
- **Brackets** — matching bracket pairs
- **autoClosingPairs** — automatic closing characters
- **indentationRules** — patterns that increase/decrease indent
- **folding** — markers for code folding

After editing, reload the VS Code window.

### Add a New Command to the Extension

1. In `src/extension.ts`, add your command registration:
```typescript
context.subscriptions.push(
  commands.registerCommand('maude.yourCommand', () => {
    window.showInformationMessage('Your command executed!');
  })
);
```

2. In `package.json`, add the command to `contributes.commands`:
```json
{
  "command": "maude.yourCommand",
  "title": "Maude: Your Command"
}
```

3. Recompile: `npm run compile`.

### Quick Reference: Which Files to Edit

| What you want to change | File to edit | Recompile needed? |
|---|---|---|
| Keyword / hover doc / autocomplete | `src/maudeData.ts` | Yes |
| Snippet | `snippets/maude.json` | No |
| Syntax highlighting color | `syntaxes/maude.tmLanguage.json` | No |
| Comments / brackets / indentation | `language-configuration.json` | No |
| New VS Code command | `src/extension.ts` + `package.json` | Yes |
| Extension metadata (name, version, etc.) | `package.json` | No |
