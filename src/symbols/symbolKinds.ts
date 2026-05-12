export type MaudeSymbolKind =
  | 'module'
  | 'operator'
  | 'equation'
  | 'rule'
  | 'sort'
  | 'class'
  | 'message'
  | 'view'
  | 'theory'
  | 'variable';

export interface SymbolInfo {
  name: string;
  kind: MaudeSymbolKind;
  line: number;
  character: number;
  endLine: number;
  endCharacter: number;
  detail: string;
  containerName?: string;
}
