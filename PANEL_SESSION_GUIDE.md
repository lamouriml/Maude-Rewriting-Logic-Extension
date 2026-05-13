# Maude-RL: Panel Session — New Structured Formatters

This guide documents the **new panel/session features** added to the Maude-RL extension.
These features are for the developer to test and iterate on.
Regular users should use the classic terminal-based workflow via `README.md`.

---

## 1. How to Open the Panel

- `Ctrl+Shift+P` → `Maude: Open Visualization`
- A side panel opens with:
  - **Output area** (top) — formatted Maude output
  - **Toolbar** — Start / Clear / Stop / Zoom buttons
  - **Input field** (bottom) — type Maude commands, Enter to submit, Shift+Enter for newline

---

## 2. Structured Formatters (New)

Three Maude output types are now parsed into **collapsible accordion** UI instead of raw text.

### 2.1 `show path` → Path Accordion

**Trigger:** Command `show path in <MODULE> : <term> .`

**Parser:** Detects `state 0, <Sort>:` → enters path mode.
Extracts state headers (`state N, SortName:`), transitions (`===[[ rl RuleName [label Label] ]===>`), and state content.
Accumulated until a non-path line (`Maude>`, `Warning:`, empty line, etc.).

**Output:** Each step rendered as a collapsible `<details>`:

```
▸ State 0 ➔ [fire-T0] ➔ State 1
▸ State 1 ➔ [fire-T1] ➔ State 2
⋮
```

**Body (expanded):** State configuration with line breaks before each `<` object and each `enable(`-like identifier.

**CSS classes:** `.path-container`, `.path-step`, `.path-hdr`, `.path-body`, `.path-state-label`, `.path-state`

**Edge cases handled:**
- Single state with no transitions → `renderSingleState()`
- Warnings/Advisories inside path → flush path, fall through to normal rendering
- State numbers can be arbitrary after state 0 (Petri nets, block world, etc.)

**Limitations:**
- Warnings/Advisories inside path content terminate path mode (remaining path lost as structured)
- Only enters on `state 0,` to avoid collision with `show solution` output

### 2.2 `counterexample(...)` → Path / Cycle Split

**Trigger:** `modelCheck` failure → Maude outputs `counterexample({...}, {...})`.

**Parser:** Collects all lines until parentheses balance, then extracts `{<State>, 'Rule}` pairs via regex.

**Cycle detection:**
1. Scan for a repeated `{state, rule}` pair → split at the repetition point
2. Fallback: if even number of pairs, split in half
3. Otherwise: render all pairs in a single list

**Output:**
```
▸ ✕ Path
    1. ⟨State0⟩ → 'Rule1
    2. ⟨State1⟩ → 'Rule2
    3. ⟨State2⟩ → 'Rule3
▸ ⟳ Cycle (red)
    4. ⟨State2⟩ → 'Rule3
    5. ⟨State3⟩ → 'Rule4
```

**CSS classes:** `.cex-pairs`, `.cex-section`, `.cex-hdr.path-color` (amber), `.cex-hdr.cycle-color` (red), `.cex-pair`, `.cex-state`, `.cex-rule`

**Limitations:**
- Cycle detection is heuristic; may mis-split on irregular counterexamples
- Rule names with special characters (spaces, dots) may not parse correctly (`[^'}\s]+` capture)

### 2.3 `set trace on .` → Trace Step Grouping

**Trigger:** `set trace on .` then `rew` or `search` — Maude outputs `******* rule/equation` blocks.

**Parser:**
- All trace lines (`*******`, `--->`, substitution lines, result lines) accumulate into ONE group per command
- Group is flushed at the `Maude>` prompt boundary (via `closeAll()`)
- Empty lines inside trace are preserved as spacers, NOT group terminators

**Output:** Single collapsible per command. Title = the first `***********` line (literal).
```
▸ *********** rule
    *********** rule
    rl [req2] : M : N => ...
    M --> 1
    N --> 0
    --->
    M : N + 1
    *********** rule
    rl [test] : ...
    --->
    result
```

**CSS classes:** `.trace-step`, `.trace-summary`, `.trace-hdr-line`, `.trace-arrow`, `.trace-line`, `.trace-blank`

**Limitations:**
- All trace output for a `rew`/`search` command is in ONE collapsible — large traces may have long bodies
- `---` lines alone (without `>`) may enter trace mode but won't show meaningful content

---

## 3. Things to Test

### 3.1 Show Path

| Test | Expected |
|------|----------|
| `show path in PETRI-NET : init .` | Collapsible steps: State 0 → [fire-T0] → State 1, etc. |
| Path with 1 state only | Single collapsible "State 0" |
| Path with no transitions | Single state rendered |
| Path containing Warning line | Path rendered up to Warning, Warning shown normally, remaining path as plain text |
| `show path` after `search` | Works correctly (path from solution state) |
| `show solution 1 .` | NOT treated as path (state N>0) — should render normally |

### 3.2 Counterexample

| Test | Expected |
|------|----------|
| `modelCheck(init, formula)` that fails | Collapsible Path + Cycle sections |
| Trivial `red modelCheck(...)` | Parsed pairs, may be single list if no cycle found |
| Counterexample with special rule names (dots, hyphens) | Pairs extracted correctly (regex: `[^'}\s]+`) |
| No counterexample (formula holds) | Normal `result Bool: true` output, not affected |

### 3.3 Trace Output

| Test | Expected |
|------|----------|
| `set trace on .` then `rew init .` | ONE collapsible for the entire `rew` output, title = first `*******` line |
| Multiple consecutive rules | All in same collapsible body |
| `---> result ...` lines | Inside the collapsible body |
| Empty lines in trace output | Preserved as 4px spacers, group stays intact |
| `set trace off .` | Trace stops, output returns to normal |

### 3.4 General Panel

| Test | Expected |
|------|----------|
| Multi-line input (Shift+Enter) | Newlines in textarea, Enter submits |
| Stop button during long `search` | SIGINT sent, process stays alive |
| Clear button | Output cleared, process keeps running |
| Start button | Kill + respawn Maude |
| Zoom in/out (+/- buttons, Ctrl+= / Ctrl+-) | Font size changes |
| Scroll stays at bottom | After every update (sentinel scrollIntoView) |
| Copy text from output | `user-select: text` works |
| `.toggle` on collapsibles | Path/Solution/CEX/Trace details open and close |

---

## 4. Key Files

| File | Purpose |
|------|---------|
| `src/outputProcessor.ts` | State-machine parser + HTML generation (all formatters) |
| `src/visualizationPanel.ts` | WebviewPanel, toolbar, input, postMessage update loop |
| `src/extension.ts` | Spawn/kill Maude process, wire events |

### New CSS classes in `outputProcessor.ts` (both dark + light themes)

```
/* Path */
.path-container  .path-step  .path-hdr  .path-body
.path-state-label  .path-state

/* CEX */
.cex-pairs  .cex-section  .cex-hdr.path-color  .cex-hdr.cycle-color
.cex-pair  .cex-state  .cex-rule

/* Trace */
.trace-step  .trace-summary  .trace-detail
.trace-hdr-line  .trace-arrow  .trace-line
```

---

## 5. Known Issues

1. **`show path` with inline warnings:** Warning/Advisory lines inside path output terminate path mode. Remaining states appear as plain text.
2. **`show module` display:** Each token appears on its own line — this is a raw formatting issue in the generic output, not handled by structured formatters.
3. **Counterexample cycle boundary:** Heuristic detection (repeat matching + even-split fallback) may mis-identify the path/cycle split on complex counterexamples.
4. **Trace large output:** All trace steps for a single command accumulate into ONE collapsible. Long traces may have a very large body under one collapsible.
5. **Rule names with unusual characters:** Counterexample parser `[^'}\s]+` and path transition parser `\S+` may capture incomplete rule names if they contain special characters.
6. **`rew` results with `state 0,` format:** If a rewrite result line coincidentally starts with `state 0,`, it would incorrectly enter path mode. Unlikely in practice.
