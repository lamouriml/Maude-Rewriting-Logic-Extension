import { TextDocument } from 'vscode';
import { SymbolInfo, MaudeSymbolKind } from './symbolKinds';

const moduleStart = /^\s*(fmod|mod|omod|fth)\s+([A-Za-z0-9_-]+)\b/;
const moduleEnd = /^\s*(endfm|endm|endom|endfth)\b/;
const viewStart = /^\s*view\s+([A-Za-z0-9_-]+)\s+from\b/;
const viewEnd = /^\s*endv\b/;
const opPattern = /^\s*op\s+([A-Za-z0-9_]+)\s*:/;
const opsPattern = /^\s*ops\s+([A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)*)\s*:/;
const eqPattern = /^\s*(eq|ceq)\s+/;
const rlPattern = /^\s*(rl|crl)\s+/;
const sortPattern = /^\s*sort\s+([A-Za-z0-9_-]+)\b/;
const sortsPattern = /^\s*sorts\s+(.+?)\s*\./;
const classPattern = /^\s*class\s+([A-Za-z0-9_-]+)\b/;
const msgPattern = /^\s*msg\s+([A-Za-z0-9_-]+)\s*:/;
const varPattern = /^\s*var\s+([A-Z][A-Za-z0-9'_]*)\s*:/;

export function extractMaudeSymbols(document: TextDocument): SymbolInfo[] {
  const symbols: SymbolInfo[] = [];
  const moduleStack: string[] = [];
  let inCommentBlock = false;
  let commentDepth = 0;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const text = line.text;
    const lineNum = line.lineNumber;
    const trimmed = text.trim();

    if (inCommentBlock) {
      for (const ch of trimmed) {
        if (ch === '(') commentDepth++;
        if (ch === ')') {
          commentDepth--;
          if (commentDepth === 0) { inCommentBlock = false; break; }
        }
      }
      continue;
    }
    if (trimmed.startsWith('---(') || trimmed.startsWith('***( ') || trimmed.startsWith('***(') || trimmed === '***(') {
      inCommentBlock = true;
      commentDepth = 1;
      const prefix = trimmed.startsWith('---(') ? '---(' : '***(';
      const rest = trimmed.substring(trimmed.indexOf(prefix) + 4);
      for (const ch of rest) {
        if (ch === '(') commentDepth++;
        if (ch === ')') {
          commentDepth--;
          if (commentDepth === 0) { inCommentBlock = false; break; }
        }
      }
      continue;
    }
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('***') || trimmed.startsWith('{-')) {
      continue;
    }

    let match = text.match(moduleStart);
    if (match) {
      const name = match[2];
      const kind: MaudeSymbolKind = match[1] === 'fth' ? 'theory' : 'module';
      moduleStack.push(name);
      symbols.push({
        name, kind,
        line: lineNum, character: text.indexOf(name),
        endLine: lineNum, endCharacter: text.length,
        detail: `${match[1]} ${name}`,
      });
      continue;
    }

    match = text.match(viewStart);
    if (match) {
      const name = match[1];
      moduleStack.push('__view__');
      symbols.push({
        name, kind: 'view',
        line: lineNum, character: text.indexOf(name),
        endLine: lineNum, endCharacter: text.length,
        detail: `view ${name}`,
      });
      continue;
    }

    match = text.match(moduleEnd);
    if (match && moduleStack.length > 0) {
      const last = moduleStack[moduleStack.length - 1];
      if (last !== '__view__') {
        moduleStack.pop();
      }
      continue;
    }

    match = text.match(viewEnd);
    if (match && moduleStack.length > 0 && moduleStack[moduleStack.length - 1] === '__view__') {
      moduleStack.pop();
      continue;
    }

    const containerName = moduleStack.length > 0 ? moduleStack[moduleStack.length - 1] : undefined;
    if (containerName === '__view__') continue;

    match = text.match(opPattern);
    if (match) {
      symbols.push({
        name: match[1], kind: 'operator',
        line: lineNum, character: text.indexOf(match[1]),
        endLine: lineNum, endCharacter: text.length,
        detail: `op ${match[1]}`, containerName,
      });
      continue;
    }

    match = text.match(opsPattern);
    if (match) {
      const names = match[1].split(/\s+/);
      for (const name of names) {
        symbols.push({
          name, kind: 'operator',
          line: lineNum, character: text.indexOf(name),
          endLine: lineNum, endCharacter: text.length,
          detail: `op ${name}`, containerName,
        });
      }
      continue;
    }

    match = text.match(eqPattern);
    if (match) {
      const keyword = match[1];
      symbols.push({
        name: `${keyword} ...`, kind: 'equation',
        line: lineNum, character: text.indexOf(keyword),
        endLine: lineNum, endCharacter: text.length,
        detail: `${keyword} ...`, containerName,
      });
      continue;
    }

    match = text.match(rlPattern);
    if (match) {
      const keyword = match[1];
      symbols.push({
        name: `${keyword} ...`, kind: 'rule',
        line: lineNum, character: text.indexOf(keyword),
        endLine: lineNum, endCharacter: text.length,
        detail: `${keyword} ...`, containerName,
      });
      continue;
    }

    match = text.match(sortPattern);
    if (match) {
      symbols.push({
        name: match[1], kind: 'sort',
        line: lineNum, character: text.indexOf(match[1]),
        endLine: lineNum, endCharacter: text.length,
        detail: `sort ${match[1]}`, containerName,
      });
      continue;
    }

    match = text.match(sortsPattern);
    if (match) {
      const names = match[1].split(/\s+/);
      for (const name of names) {
        if (name && !name.startsWith('*')) {
          symbols.push({
            name, kind: 'sort',
            line: lineNum, character: text.indexOf(name),
            endLine: lineNum, endCharacter: text.length,
            detail: `sort ${name}`, containerName,
          });
        }
      }
      continue;
    }

    match = text.match(classPattern);
    if (match) {
      symbols.push({
        name: match[1], kind: 'class',
        line: lineNum, character: text.indexOf(match[1]),
        endLine: lineNum, endCharacter: text.length,
        detail: `class ${match[1]}`, containerName,
      });
      continue;
    }

    match = text.match(msgPattern);
    if (match) {
      symbols.push({
        name: match[1], kind: 'message',
        line: lineNum, character: text.indexOf(match[1]),
        endLine: lineNum, endCharacter: text.length,
        detail: `msg ${match[1]}`, containerName,
      });
      continue;
    }

    match = text.match(varPattern);
    if (match) {
      symbols.push({
        name: match[1], kind: 'variable',
        line: lineNum, character: text.indexOf(match[1]),
        endLine: lineNum, endCharacter: text.length,
        detail: `var ${match[1]}`, containerName,
      });
      continue;
    }
  }

  return symbols;
}
