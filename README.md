# Maude Language Support for Visual Studio Code

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/lamouriml.Maude-Rewriting-Logic-Extension)
![License](https://img.shields.io/github/license/lamouriml/Maude-Rewriting-Logic-Extension)

Provides comprehensive language support for the **Maude** rewriting logic specification language in Visual Studio Code.

**Author:** Mohamed Lamine Lamouri — [lamourimhmd@gmail.com](mailto:lamourimhmd@gmail.com) — [github.com/lamouriml](https://github.com/lamouriml)

## Github Repository 
[github.com/lamouriml/Maude-Rewriting-Logic-Extension](https://github.com/lamouriml/Maude-Rewriting-Logic-Extension/)

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
- Comments (`---` / `***` line comments, `---(` / `***(` block comments, `{- -}` block comments)
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

### Symbol Navigation
Navigate your Maude files using VS Code's Outline view, Breadcrumbs, and symbol search:
- **Modules** (`fmod`, `mod`, `omod`) and theories (`fth`)
- **Operators** (`op`, `ops`)
- **Equations** (`eq`, `ceq`) and **rewrite rules** (`rl`, `crl`)
- **Sort** declarations (`sort`, `sorts`)
- **Classes** and **messages** (Full Maude OO)
- **Views** and **variables**
- Symbols are organized hierarchically under their containing module

### Go To Definition
Jump directly to the definition of any symbol with Ctrl+Click:
- Operators, sorts, variables, modules, classes, messages, views
- File-local indexing via lightweight regex extraction

### Interactive Panel Session (Experimental)

> ⚠️ **Unstable — under development.** This feature is a work-in-progress and may change or break.

A **Visualization Panel** that captures Maude terminal output and displays it with formatted, collapsible, color-coded sections for easier analysis:

- `Ctrl+Shift+P` → `Maude: Open Visualization` opens a side panel with an embedded input field
- Maude runs as a background child process — no terminal or pseudoterminal needed
- Commands are typed directly into the panel (Enter to submit, Shift+Enter for newline)
- Output is rendered with syntax coloring and structured collapse/expand sections:
  - **Solutions** → collapsible `Solution N` blocks
  - **Show Path** → accordion steps (State ➔ Rule ➔ State) — `state 0,` detection
  - **Counterexamples** → Path / Cycle split with `{State, Rule}` pair parsing
  - **Trace output** → grouped into a single collapsible per command
- Toolbar: **Start** (restart session), **Clear** (clear buffer), **Stop** (SIGINT)
- Zoom in/out via buttons or `Ctrl+=` / `Ctrl+-` / `Ctrl+0`
- **Known issues and limitations are documented in `PANEL_SESSION_GUIDE.md`**

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

## Screenshots

### Hover Documentation
![Hover Documentation - Editor and Hover Description](images/editor%20and%20hover%20description.png)
*Displays formatted Markdown documentation when hovering over Maude keywords, providing syntax examples and usage guidelines.*

### Autocomplete Suggestions
![Autocomplete Suggestions - Snippet and Auto Complete](images/snippet%20and%20auto%20complete.png)
*Intelligent autocomplete suggestions as you type, offering keywords, commands, and operator attributes with descriptions.*

### Extension in Marketplace
![Extension in Marketplace - Readme](images/extension%20in%20marketplace%20readme.png)
*The extension is available on the Visual Studio Code Marketplace for easy installation and discovery.*

## Requirements

- Visual Studio Code 1.50.0 or higher

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


**Enjoy writing Maude specifications!**
