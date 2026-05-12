export interface DefinitionEntry {
  name: string;
  line: number;
  character: number;
}

const patterns: RegExp[] = [
  /^\s*op\s+([A-Za-z0-9_]+)\s*:/,
  /^\s*ops\s+([A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)*)\s*:/,
  /^\s*sort\s+([A-Za-z0-9_-]+)\b/,
  /^\s*sorts\s+(.+?)\s*\./,
  /^\s*var\s+([A-Z][A-Za-z0-9'_]*)\s*:/,
  /^\s*vars\s+((?:[A-Z][A-Za-z0-9'_]*\s+)*[A-Z][A-Za-z0-9'_]*)\s*:/,
  /^\s*(?:fmod|mod|omod)\s+([A-Za-z0-9_-]+)\b/,
  /^\s*class\s+([A-Za-z0-9_-]+)\b/,
  /^\s*msg\s+([A-Za-z0-9_-]+)\s*:/,
  /^\s*view\s+([A-Za-z0-9_-]+)\s+from\b/,
  /^\s*fth\s+([A-Za-z0-9_-]+)\b/,
];

export function extractAllDefinitions(lines: string[]): DefinitionEntry[] {
  const entries: DefinitionEntry[] = [];
  let inCommentBlock = false;
  let commentDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
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
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('***')) continue;

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const raw = match[1];
        if (match[0].startsWith('ops ') || match[0].startsWith('sorts ') || match[0].startsWith('vars ')) {
          const names = raw.split(/\s+/);
          for (const name of names) {
            if (name && !name.startsWith('*')) {
              const col = text.indexOf(name);
              entries.push({ name, line: i, character: col >= 0 ? col : 0 });
            }
          }
        } else {
          const col = text.indexOf(raw);
          entries.push({ name: raw, line: i, character: col >= 0 ? col : 0 });
        }
        break;
      }
    }
  }

  return entries;
}
