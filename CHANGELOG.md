# Change Log

## [1.1.0] - 2026-05-12

### Changed
- Author updated to Mohamed Lamine Lamouri
- Extension renamed to "Maude System Rewriting Logic Extension"
- Publisher updated to lamouriml
- Repository links updated

## [0.4.0] - 2026-05-12

### Added
- Comprehensive syntax highlighting with TextMate grammar
  - Module declarations, importation, data types, operations
  - Rewrite rules, equations, membership axioms
  - Operator attributes, Full Maude keywords
  - Parameterization, meta-level functions, built-in sorts
- Intelligent autocomplete via CompletionItemProvider
  - Keyword suggestions filtered by typing prefix
  - Descriptions and Markdown documentation for each keyword
  - Snippet insert support for operations
- Formatted hover documentation via HoverProvider
  - Markdown-rendered help for all keywords
  - Syntax examples for common constructs
- Rich snippet library (30+ snippets)
  - All module types, equations, rules, operations, variables
  - Full Maude OO constructs, parameterization, commands
- Language configuration (comments, brackets, auto-closing, indentation)
- Modular TypeScript architecture
  - `maudeData.ts` — centralized language data
  - `completionProvider.ts` — autocomplete logic
  - `hoverProvider.ts` — hover documentation logic
  - `extension.ts` — activation entry point

### Changed
- Full rewrite from prior version; complete architecture modernization
- Migrated to TextMate JSON grammar format
- Centralized all language data for extensibility

## [0.3.0] - 2025-08-15

### Added
- Initial syntax highlighting support
- Basic snippet library
