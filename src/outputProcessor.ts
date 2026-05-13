interface PathState {
    num: number;
    sort: string;
    content: string;
}

interface PathStep {
    fromState: PathState;
    transitionRule: string;
    transitionLabel: string;
    toState: PathState;
}

interface CexPair {
    state: string;
    rule: string;
}

export class OutputProcessor {
    private buffer = '';

    get fullOutput(): string {
        return this.buffer;
    }

    append(text: string): void {
        this.buffer += text;
    }

    clear(): void {
        this.buffer = '';
    }

    generateHtml(isDark: boolean): string {
        const clean = this.buffer
            .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
            .replace(/\x1b[^a-zA-Z]*[a-zA-Z]/g, '')
            .replace(/\x1b/g, '')
            .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g, '');
        const lines = clean.split('\n');
        const bodyHtml = this.render(lines);
        return this.wrap(bodyHtml, isDark);
    }

    private render(lines: string[]): string {
        const parts: string[] = [];
        let solCount = 0;
        let inSol = false;
        let inRes = false;
        let inCex = false;
        let resLines: string[] = [];
        let cexLines: string[] = [];

        // Path mode
        let inPath = false;
        let pathSteps: PathStep[] = [];
        let pathCurState: PathState | null = null;
        let pathCurTransition = '';
        let pathCurLabel = '';

        // Trace accum
        let traceGroup: string[] = [];

        const emitRes = () => { if (resLines.length) { parts.push(`<div class="res">${resLines.map(esc).join('\n')}</div>`); resLines = []; } };
        const emitCex = () => { if (cexLines.length) { parts.push(renderCexPairs(parseCexPairs(cexLines.join('\n')))); cexLines = []; } };
        const closeSol = () => { if (inSol) { parts.push('</details>'); inSol = false; } };
        const closeRes = () => { if (inRes) { emitRes(); inRes = false; } };
        const closeCex = () => { if (inCex) { emitCex(); inCex = false; } };
        const closeAll = () => { closeCex(); closeRes(); closeSol(); flushPath(); flushTrace(); };

        const flushPath = () => {
            if (inPath) {
                if (pathCurState) {
                    if (pathSteps.length > 0) {
                        pathSteps[pathSteps.length - 1].toState = pathCurState;
                    }
                }
                if (pathSteps.length > 0) {
                    parts.push(renderPathSteps(pathSteps));
                } else if (pathCurState) {
                    parts.push(renderSingleState(pathCurState));
                }
                inPath = false;
                pathSteps = [];
                pathCurState = null;
                pathCurTransition = '';
                pathCurLabel = '';
            }
        };

        const flushTrace = () => {
            if (traceGroup.length > 0) {
                parts.push(renderTraceGroup(traceGroup));
                traceGroup = [];
            }
        };

        for (const raw of lines) {
            const t = raw.trimEnd();

            if (inPath) {
                const stateM = t.match(/^state\s+(\d+),\s*(\S+):/i);
                const transM = t.match(/^===+\[+\s*rl\s+(\S+)(?:\s+\[label\s+(\S+?)\])?/i);

                if (stateM) {
                    // Finalize previous step
                    if (pathCurState) {
                        const step: PathStep = {
                            fromState: pathCurState,
                            transitionRule: pathCurTransition,
                            transitionLabel: pathCurLabel,
                            toState: { num: 0, sort: '', content: '' }, // placeholder
                        };
                        if (pathSteps.length > 0) {
                            pathSteps[pathSteps.length - 1].toState = pathCurState;
                        }
                        pathSteps.push(step);
                    }
                    pathCurState = { num: parseInt(stateM[1]), sort: stateM[2], content: t };
                    pathCurTransition = '';
                    pathCurLabel = '';
                    continue;
                }

                if (transM) {
                    pathCurTransition = transM[1];
                    pathCurLabel = transM[2] || '';
                    continue;
                }

                // Check if this line ends path mode
                if (/^Maude>/.test(t) || /^(Warning|Error|Advisory):/i.test(t) || /^\s*$/.test(t)) {
                    flushPath();
                    // Fall through to normal processing
                } else {
                    // Accumulate state content
                    if (pathCurState) {
                        pathCurState.content += '\n' + t;
                    }
                    continue;
                }
            }

            if (/^Maude>\s*$/.test(t)) { closeAll(); continue; }

            if (/^Maude>/.test(t) && !/^Maude>\s*$/.test(t)) {
                flushPath(); closeAll();
                parts.push(`<div class="cmd">${esc(t.replace(/^Maude>\s*/, ''))}</div>`);
                continue;
            }

            // Advisory → green
            if (/^Advisory:/i.test(t)) {
                flushPath(); closeAll();
                parts.push(`<div class="adv">${esc(t)}</div>`);
                continue;
            }

            // Warning → orange
            if (/^Warning:/i.test(t)) {
                flushPath(); closeAll();
                parts.push(`<div class="warn">${esc(t)}</div>`);
                continue;
            }

            if (/^Error:/i.test(t)) {
                flushPath(); closeAll();
                parts.push(`<div class="err">${esc(t)}</div>`);
                continue;
            }

            if (/noParse\(/i.test(t)) {
                flushPath(); closeAll();
                parts.push(`<div class="err">${esc(t)}</div>`);
                continue;
            }

            if (/^(rewrites?|states?):/i.test(t)) {
                flushPath(); closeCex(); closeRes();
                if (inSol) parts.push(`<div class="sol-line meta">${esc(t)}</div>`);
                else parts.push(`<div class="meta">${esc(t)}</div>`);
                continue;
            }

            const solM = t.match(/^(Solution\s+\d+)\s*(\(state\s+\d+\))?/i);
            if (solM) {
                flushPath(); closeAll(); inSol = true; solCount++;
                parts.push(`<details class="sol" id="sol-${solCount}"><summary class="sol-hdr">${esc(solM[0])}</summary>`);
                continue;
            }

            if (/^No\s+(more\s+)?solution/i.test(t)) { flushPath(); closeAll(); parts.push(`<div class="info">${esc(t)}</div>`); continue; }

            if (/-->/.test(t) && inSol) { parts.push(`<div class="sol-line binding">${esc(t)}</div>`); continue; }

            if (/^result\s+\S+\s*:/.test(t)) { flushPath(); closeSol(); closeCex(); inRes = true; resLines.push(t); continue; }

            if (/counterexample\(/.test(t)) {
                flushPath();
                if (inRes) { emitRes(); inRes = false; }
                closeSol();
                inCex = true;
                cexLines.push(t);
                continue;
            }

            if (inCex) {
                cexLines.push(t);
                const joined = cexLines.join(' ');
                const openC = (joined.match(/\(/g) || []).length;
                const closeC = (joined.match(/\)/g) || []).length;
                if (openC > 0 && openC <= closeC) { emitCex(); inCex = false; }
                continue;
            }

            if (inRes) { resLines.push(t); continue; }

            // Path detection: only on state 0 (avoid show solution / search graph collisions)
            if (!inSol && !inCex && !inRes) {
                const pathStateM = t.match(/^state\s+(\d+),\s*(\S+):/i);
                if (pathStateM && parseInt(pathStateM[1]) === 0) {
                    inPath = true;
                    pathCurState = { num: 0, sort: pathStateM[2], content: t };
                    pathCurTransition = '';
                    pathCurLabel = '';
                    continue;
                }
            }

            // Trace lines: collect into ONE group per command (no per-step flush)
            if (/^\*{3,}\s/.test(t) || /^---+>?(?:\s|$)/.test(t) || /^===+\[/.test(t)) {
                flushPath(); closeAll();
                traceGroup.push(t);
                continue;
            }

            if (traceGroup.length > 0 && /^\s*$/.test(t)) {
                traceGroup.push(t);
                continue;
            }

            if (traceGroup.length > 0 && !/^(?:\*{3,}\s|---+>?\s|===+\[)/.test(t) && t.length > 0) {
                traceGroup.push(t);
                continue;
            }

            if (t === '') { parts.push(`<div class="empty"></div>`); continue; }

            if (inSol) { parts.push(`<div class="sol-line">${esc(t)}</div>`); continue; }

            parts.push(`<div class="plain">${esc(t)}</div>`);
        }

        closeAll();
        return parts.join('\n');
    }

    private wrap(body: string, isDark: boolean): string {
        const theme = isDark ? DARK : LIGHT;
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<title>Maude-RL</title>
<style>${theme}</style>
</head>
<body><div class="output">${body}</div></body>
</html>`;
    }
}

function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Convert raw state content into readable indented lines */
function formatStateContent(content: string): string {
    // Remove the "state N, Sort:" header line for formatting
    const lines = content.split('\n');
    const body = lines.slice(1).join('\n').trim();

    let formatted = body
        .replace(/</g, '\n<')
        .replace(/\b([a-zA-Z_]\w*\()/g, '\n$1')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join('\n  ');

    if (formatted) {
        return '  ' + formatted;
    }
    return '';
}

/** Render path steps as collapsible accordions */
function renderPathSteps(steps: PathStep[]): string {
    if (steps.length === 0) return '';

    const parts: string[] = [];
    parts.push('<div class="path-container">');

    for (const step of steps) {
        const fromLabel = `State ${step.fromState.num}`;
        const toLabel = step.toState && step.toState.content ? `State ${step.toState.num}` : '(end)';
        const ruleLabel = step.transitionLabel
            ? `[${step.transitionLabel}]`
            : step.transitionRule
                ? `[${step.transitionRule}]`
                : '—';

        const header = `${fromLabel} ${esc(ruleLabel)} ${toLabel}`;
        const bodyContent = formatStateContent(step.fromState.content);
        const toContent = step.toState && step.toState.content ? formatStateContent(step.toState.content) : '';

        parts.push(`<details class="path-step"><summary class="path-hdr">${esc(header)}</summary>`);
        if (bodyContent) {
            parts.push(`<div class="path-body"><span class="path-state-label">${esc(fromLabel)}</span>`);
            parts.push(`<pre class="path-state">${esc(bodyContent)}</pre></div>`);
        }
        if (toContent) {
            parts.push(`<div class="path-body"><span class="path-state-label">${esc(toLabel)}</span>`);
            parts.push(`<pre class="path-state">${esc(toContent)}</pre></div>`);
        }
        parts.push('</details>');
    }

    parts.push('</div>');
    return parts.join('\n');
}

/** Render a single isolated state (no transition) */
function renderSingleState(state: PathState): string {
    const label = `State ${state.num}`;
    const content = formatStateContent(state.content);
    let html = `<details class="path-step"><summary class="path-hdr">${esc(label)}</summary>`;
    if (content) {
        html += `<div class="path-body"><span class="path-state-label">${esc(label)}</span>`;
        html += `<pre class="path-state">${esc(content)}</pre></div>`;
    }
    html += '</details>';
    return html;
}

/** Parse {<State>, 'Rule} pairs from counterexample text */
function parseCexPairs(text: string): CexPair[] {
    const pairs: CexPair[] = [];
    const pairRegex = /\{<([^>]*)>,\s*'([^'}\s]+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = pairRegex.exec(text)) !== null) {
        pairs.push({ state: m[1].trim(), rule: m[2] });
    }
    return pairs;
}

/** Render counterexample pairs as collapsible list */
function renderCexPairs(pairs: CexPair[]): string {
    if (pairs.length === 0) return '—';

    const parts: string[] = ['<div class="cex-pairs">'];

    // Detect cycle boundary: find where the pairs repeat
    // The first occurrence marks the end of the path, the second is the cycle
    let cycleStart = -1;
    for (let i = 0; i < pairs.length; i++) {
        for (let j = i + 1; j < pairs.length; j++) {
            if (pairs[i].state === pairs[j].state && pairs[i].rule === pairs[j].rule) {
                if (j - i > 1) {
                    cycleStart = j;
                    break;
                }
            }
        }
        if (cycleStart >= 0) break;
    }

    // If no cycle found via repetition, check for the `}, {` separator in original text
    // Use a simpler heuristic: if pairs are even, split in half
    if (cycleStart < 0 && pairs.length > 2 && pairs.length % 2 === 0) {
        cycleStart = pairs.length / 2;
    }

    if (cycleStart > 0) {
        // Path section
        parts.push('<details class="cex-section"><summary class="cex-hdr path-color">✕ Path</summary>');
        parts.push(renderCexPairList(pairs.slice(0, cycleStart)));
        parts.push('</details>');

        // Cycle section
        parts.push('<details class="cex-section"><summary class="cex-hdr cycle-color">⟳ Cycle</summary>');
        parts.push(renderCexPairList(pairs.slice(cycleStart)));
        parts.push('</details>');
    } else {
        parts.push(renderCexPairList(pairs));
    }

    parts.push('</div>');
    return parts.join('\n');
}

function renderCexPairList(pairs: CexPair[]): string {
    const items: string[] = [];
    for (let i = 0; i < pairs.length; i++) {
        const p = pairs[i];
        items.push(`<div class="cex-pair">${i + 1}. <span class="cex-state">⟨${esc(p.state)}⟩</span> → <span class="cex-rule">'${esc(p.rule)}</span></div>`);
    }
    return items.join('\n');
}

/** Render a trace group as a single collapsible with all steps */
function renderTraceGroup(lines: string[]): string {
    if (lines.length === 0) return '';

    // Label = first ******* line (literal, starting with asterisks)
    const firstLine = lines.find(l => /^\*{3,}\s/.test(l)) || lines[0];
    const label = firstLine.trim();

    const body = lines.map(l => {
        if (/^\s*$/.test(l)) return `<div class="trace-blank"></div>`;
        if (/^\*{3,}\s/.test(l)) return `<div class="trace-hdr-line">${esc(l)}</div>`;
        if (/^---/.test(l)) return `<div class="trace-arrow">${esc(l)}</div>`;
        return `<div class="trace-line">${esc(l)}</div>`;
    }).join('\n');

    return `<details class="trace-step"><summary class="trace-summary">${label}</summary><div class="trace-detail">${body}</div></details>`;
}

const DARK = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Consolas','Courier New',monospace;font-size:13px;line-height:1.6;background:#1e1e1e;color:#d4d4d4;padding:0;overflow-x:hidden}
.output{padding:12px 16px;user-select:text;cursor:text;white-space:pre-wrap;overflow-wrap:break-word}
.cmd{color:#569cd6;font-weight:bold;padding:4px 8px;margin:8px 0 4px 0;background:#1e2a3a;border-radius:3px;border-left:3px solid #569cd6;white-space:pre-wrap;overflow-wrap:break-word}
.res{color:#4ec9b0;background:#0d2b2b;padding:6px 10px;margin:6px 0;border-radius:3px;border-left:3px solid #4ec9b0;font-weight:bold;white-space:pre-wrap;overflow-wrap:break-word}
.sol{margin:6px 0;border:1px solid #3c3c3c;border-radius:4px;background:#252526}
.sol-hdr{color:#569cd6;cursor:pointer;font-weight:bold;padding:6px 10px;background:#1e2a3a;border-radius:3px;user-select:none}
.sol-hdr:hover{background:#2a3a4a}
.sol-line{padding:2px 10px 2px 24px;color:#d4d4d4;white-space:pre-wrap;overflow-wrap:break-word}
.sol-line.meta{color:#6a9955;font-style:italic;padding-left:24px}
.sol-line.binding{color:#c586c0;padding-left:24px}
.warn{color:#ce9178;background:#2d2a1e;padding:4px 8px;margin:4px 0;border-left:3px solid #d7ba7d;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.adv{color:#4ec9b0;background:#0d2b2b;padding:4px 8px;margin:4px 0;border-left:3px solid #4ec9b0;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.err{color:#f44747;background:#2d1e1e;padding:4px 8px;margin:4px 0;border-left:3px solid #f44747;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.meta{color:#6a9955;font-style:italic;padding:2px 8px;white-space:pre-wrap;overflow-wrap:break-word}
.info{color:#569cd6;font-style:italic;padding:4px 8px;margin:4px 0;border-left:3px solid #569cd6;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.plain{color:#d4d4d4;padding:2px 8px;white-space:pre-wrap;overflow-wrap:break-word}
.empty{height:6px}

/* Path accordion */
.path-container{margin:6px 0}
.path-step{margin:4px 0;border:1px solid #3c3c3c;border-radius:4px;background:#1e1e2e}
.path-hdr{color:#c586c0;cursor:pointer;font-weight:bold;padding:5px 10px;background:#2a1e2e;border-radius:3px;user-select:none;font-size:12px}
.path-hdr:hover{background:#3a2e3e}
.path-body{padding:4px 10px 8px 10px;border-top:1px solid #2e2e3e}
.path-state-label{color:#6a9955;font-size:11px;font-style:italic;display:block;margin-bottom:2px}
.path-state{color:#d4d4d4;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:break-word;font-family:inherit;margin:0;padding:2px 0 2px 12px;border-left:2px solid #3c3c5c}

/* CEX pairs */
.cex-pairs{margin:4px 0}
.cex-section{margin:4px 0;border:1px solid #3c3c3c;border-radius:4px;background:#1a1a1a}
.cex-hdr{cursor:pointer;font-weight:bold;padding:5px 10px;border-radius:3px;user-select:none;font-size:12px}
.cex-hdr.path-color{color:#ce9178;background:#2a1e1e}
.cex-hdr.path-color:hover{background:#3a2e2e}
.cex-hdr.cycle-color{color:#f44747;background:#2a1a1a}
.cex-hdr.cycle-color:hover{background:#3a2a2a}
.cex-pair{padding:2px 10px 2px 14px;color:#d4d4d4;font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:break-word}
.cex-state{color:#569cd6}
.cex-rule{color:#c586c0}

/* Trace steps */
.trace-step{margin:4px 0;border:1px solid #2e3e2e;border-radius:4px;background:#1a221a}
.trace-summary{color:#6a9955;cursor:pointer;font-weight:bold;padding:4px 10px;background:#1e2a1e;border-radius:3px;user-select:none;font-size:12px}
.trace-summary:hover{background:#2a3a2a}
.trace-detail{padding:4px 10px 6px 14px;border-top:1px solid #2e3e2e;white-space:pre-wrap;overflow-wrap:break-word}
.trace-hdr-line{color:#6a9955;font-size:11px;font-style:italic;padding:1px 0}
.trace-arrow{color:#569cd6;font-size:11px;padding:1px 0}
.trace-line{color:#d4d4d4;font-size:12px;padding:1px 0 1px 8px}
.trace-blank{height:4px}
`;

const LIGHT = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Consolas','Courier New',monospace;font-size:13px;line-height:1.6;background:#fff;color:#333;padding:0;overflow-x:hidden}
.output{padding:12px 16px;user-select:text;cursor:text;white-space:pre-wrap;overflow-wrap:break-word}
.cmd{color:#005cc5;font-weight:bold;padding:4px 8px;margin:8px 0 4px 0;background:#e8f0fe;border-radius:3px;border-left:3px solid #005cc5;white-space:pre-wrap;overflow-wrap:break-word}
.res{color:#007f5f;background:#e6f5ee;padding:6px 10px;margin:6px 0;border-radius:3px;border-left:3px solid #007f5f;font-weight:bold;white-space:pre-wrap;overflow-wrap:break-word}
.sol{margin:6px 0;border:1px solid #e0e0e0;border-radius:4px;background:#fafafa}
.sol-hdr{color:#005cc5;cursor:pointer;font-weight:bold;padding:6px 10px;background:#e8f0fe;border-radius:3px;user-select:none}
.sol-hdr:hover{background:#d0e0f0}
.sol-line{padding:2px 10px 2px 24px;color:#333;white-space:pre-wrap;overflow-wrap:break-word}
.sol-line.meta{color:#2e7d32;font-style:italic;padding-left:24px}
.sol-line.binding{color:#7b1fa2;padding-left:24px}
.warn{color:#9c6b00;background:#fff8e6;padding:4px 8px;margin:4px 0;border-left:3px solid #d7ba7d;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.adv{color:#007f5f;background:#e6f5ee;padding:4px 8px;margin:4px 0;border-left:3px solid #007f5f;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.err{color:#d32f2f;background:#fdecea;padding:4px 8px;margin:4px 0;border-left:3px solid #d32f2f;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.meta{color:#2e7d32;font-style:italic;padding:2px 8px;white-space:pre-wrap;overflow-wrap:break-word}
.info{color:#005cc5;font-style:italic;padding:4px 8px;margin:4px 0;border-left:3px solid #005cc5;border-radius:2px;white-space:pre-wrap;overflow-wrap:break-word}
.plain{color:#333;padding:2px 8px;white-space:pre-wrap;overflow-wrap:break-word}
.empty{height:6px}

/* Path accordion */
.path-container{margin:6px 0}
.path-step{margin:4px 0;border:1px solid #e0e0e0;border-radius:4px;background:#f5f0ff}
.path-hdr{color:#7b1fa2;cursor:pointer;font-weight:bold;padding:5px 10px;background:#ede0f5;border-radius:3px;user-select:none;font-size:12px}
.path-hdr:hover{background:#ddd0e5}
.path-body{padding:4px 10px 8px 10px;border-top:1px solid #e0e0f0}
.path-state-label{color:#2e7d32;font-size:11px;font-style:italic;display:block;margin-bottom:2px}
.path-state{color:#333;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:break-word;font-family:inherit;margin:0;padding:2px 0 2px 12px;border-left:2px solid #c0c0e0}

/* CEX pairs */
.cex-pairs{margin:4px 0}
.cex-section{margin:4px 0;border:1px solid #e0e0e0;border-radius:4px;background:#fafafa}
.cex-hdr{cursor:pointer;font-weight:bold;padding:5px 10px;border-radius:3px;user-select:none;font-size:12px}
.cex-hdr.path-color{color:#9c6b00;background:#fff8e6}
.cex-hdr.path-color:hover{background:#f0e8d6}
.cex-hdr.cycle-color{color:#d32f2f;background:#fdecea}
.cex-hdr.cycle-color:hover{background:#f0dcdc}
.cex-pair{padding:2px 10px 2px 14px;color:#333;font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:break-word}
.cex-state{color:#005cc5}
.cex-rule{color:#7b1fa2}

/* Trace steps */
.trace-step{margin:4px 0;border:1px solid #c8e6c9;border-radius:4px;background:#f1f8e9}
.trace-summary{color:#2e7d32;cursor:pointer;font-weight:bold;padding:4px 10px;background:#e8f5e9;border-radius:3px;user-select:none;font-size:12px}
.trace-summary:hover{background:#d0e8d1}
.trace-detail{padding:4px 10px 6px 14px;border-top:1px solid #c8e6c9;white-space:pre-wrap;overflow-wrap:break-word}
.trace-hdr-line{color:#2e7d32;font-size:11px;font-style:italic;padding:1px 0}
.trace-arrow{color:#005cc5;font-size:11px;padding:1px 0}
.trace-line{color:#333;font-size:12px;padding:1px 0 1px 8px}
.trace-blank{height:4px}
`;
