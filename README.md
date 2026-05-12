# Maude Language Support for Visual Studio Code

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/lamouriml.Maude-Rewriting-Logic-Extension)
![License](https://img.shields.io/github/license/lamouriml/Maude-Rewriting-Logic-Extension)

Provides comprehensive language support for the **Maude** rewriting logic specification language in Visual Studio Code.

**Author:** Mohamed Lamine Lamouri — [lamourimhmd@gmail.com](mailto:lamourimhmd@gmail.com) — [github.com/lamouriml](https://github.com/lamouriml)

## Features

### Syntax Highlighting
Full TextMate grammar covering:
- Module declarations (`fmod`, `mod`, `omod`)
- Module importation (`protecting`, `extending`, `including`)
- Rewrite rules (`rl`, `crl`) and equations (`eq`, `ceq`)
- Operations (`op`, `ops`) with mixfix notation support
- Variables (convention: uppercase identifiers)
- Operator attributes (`ctor`, `assoc`, `comm`, `id:`, etc.)
- Full Maude keywords (`class`, `msg`, `subclass`)
- Parameterization (`fth`, `view`, `from`, `to`)
- Meta-level functions (`metaReduce`, `metaRewrite`, etc.)
- Comments (`---` line comments, `{- -}` block comments)
- Quoted strings and numeric literals

### Autocomplete
Intelligent completion suggestions as you type:
- All Maude keywords with descriptions
- Commands and environment directives
- Operator attributes
- Meta-level functions

### Hover Documentation
Hover over any keyword to see formatted Markdown documentation:
- Syntax examples
- Usage guidelines
- Related keywords

### Snippets
Pre-built templates for common constructs:
- `fmod`, `mod`, `omod` — module declarations
- `eq`, `ceq` — equations
- `rl`, `crl` — rewrite rules
- `op`, `ops` — operations
- `var`, `vars` — variables
- `sort`, `subsort` — type declarations
- `protecting`, `including`, `extending` — imports
- `class`, `msg` — Full Maude OO constructs
- `search`, `rewrite`, `reduce` — commands
- `mb`, `cmb` — membership axioms
- `fth`, `view` — parameterization

## Requirements

- Visual Studio Code 1.85.0 or higher

## Installation

### From Visual Studio Marketplace (Not set yet)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Maude System Rewriting Logic Extension"
4. Click **Install**

### Manual Installation from VSIX File

If you have downloaded a `.vsix` file from [GitHub Releases](https://github.com/lamouriml/Maude-Rewriting-Logic-Extension/releases) or another source, follow these steps:

1. **Download the VSIX file**
   - Get the `.vsix` file from the [releases page](https://github.com/lamouriml/Maude-Rewriting-Logic-Extension/releases) or build it yourself

2. **Install from VS Code UI**
   - Open VS Code
   - Go to Extensions (`Ctrl+Shift+X`)
   - Click the `...` menu at the top-right of the Extensions panel
   - Select **Install from VSIX...**
   - Choose the downloaded `.vsix` file


3. **Verify Installation**
   - Create or open a `.maude` file
   - You should see syntax highlighting, autocomplete, and hover documentation working

## Extension Settings

This extension contributes the following settings:

* `maude.language`: Maude language configuration


## Future Plans

- Error diagnostics
- Go to definition
- Symbol navigation
- Language Server Protocol (LSP) implementation

---

**Enjoy writing Maude specifications!**
