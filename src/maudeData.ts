export interface MaudeDocEntry {
  label: string;
  detail: string;
  documentation: string;
  kind: 'keyword' | 'command' | 'attribute' | 'moduleDecl' | 'importation' | 'dataType' | 'operation' | 'logic' | 'oo' | 'parameterization' | 'meta' | 'environment' | 'builtin';
  snippet?: string;
}

export class MaudeData {
  static keywords: MaudeDocEntry[] = [
    // Module Declarations
    {
      label: 'fmod',
      detail: 'Functional Module',
      documentation: `## fmod ... endfm
Declares a **Functional Module**. These modules define an equational-style functional program containing sorts, elements, and functions (equations) that act upon those sorts to simplify expressions to their canonical forms.

**Syntax:**
\`\`\`maude
fmod MODULE-NAME is
  ...
endfm
\`\`\`

**Example:**
\`\`\`maude
fmod NATURAL is
  sort Nat .
  op 0 : -> Nat .
  op s : Nat -> Nat .
endfm
\`\`\``,
      kind: 'moduleDecl',
    },
    {
      label: 'mod',
      detail: 'System Module',
      documentation: `## mod ... endm
Declares a **System Module**. These modules are declarative-style concurrent programs that include rewrite rules (\`rl\`) to define state transitions, in addition to equations.

**Syntax:**
\`\`\`maude
mod MODULE-NAME is
  ...
endm
\`\`\`

**Example:**
\`\`\`maude
mod PERSON is
  sorts Person State .
  op john : -> Person .
  rl [grow] : child => adult .
endm
\`\`\``,
      kind: 'moduleDecl',
    },
    {
      label: 'omod',
      detail: 'Object-Oriented Module (Full Maude)',
      documentation: `## omod ... endom
Declares an **Object-Oriented Module**. Available only in Full Maude (and requiring parentheses around the module), these modules encapsulate data into classes and objects, and use messages to transition between states.

**Syntax:**
\`\`\`maude
omod MODULE-NAME is
  ...
endom
\`\`\`

**Example:**
\`\`\`maude
(omod BANK-ACCOUNT is
  class Account | balance : Int .
  msg deposit : Oid Int -> Msg .
endom)
\`\`\``,
      kind: 'oo',
    },
    {
      label: 'is',
      detail: 'Module body separator',
      documentation: `## is
Separates the module name from its body in module declarations (\`mod ... is ... endm\`).

**Syntax:**
\`\`\`maude
mod MODULE-NAME is
  -- declarations
endm
\`\`\``,
      kind: 'moduleDecl',
    },
    {
      label: 'endfm',
      detail: 'End Functional Module',
      documentation: `## endfm
Closes a \`fmod\` (Functional Module) declaration.`,
      kind: 'moduleDecl',
    },
    {
      label: 'endm',
      detail: 'End System Module',
      documentation: `## endm
Closes a \`mod\` (System Module) declaration.`,
      kind: 'moduleDecl',
    },
    {
      label: 'endom',
      detail: 'End Object-Oriented Module',
      documentation: `## endom
Closes an \`omod\` (Object-Oriented Module) declaration.`,
      kind: 'oo',
    },
    // Module Importation
    {
      label: 'protecting',
      detail: 'Strict module import',
      documentation: `## protecting (pr)
Imports a module strictly. Ensures no "junk" (new ground terms/constructors added to the imported sorts) and no "confusion" (new equations that alter how imported terms are reduced) are added to the imported semantics.

**Syntax:**
\`\`\`maude
protecting MODULE-NAME .
\`\`\`

**Alias:** \`pr\``,
      kind: 'importation',
    },
    {
      label: 'pr',
      detail: 'Strict module import (alias)',
      documentation: `## pr
Alias for \`protecting\`. Imports a module strictly, ensuring no junk or confusion.`,
      kind: 'importation',
    },
    {
      label: 'extending',
      detail: 'Permissive module import',
      documentation: `## extending (ex)
Imports a module allowing "junk" (you can add new elements to the imported sorts) but ruling out "confusion" (you cannot redefine or alter the existing reduction rules).

**Syntax:**
\`\`\`maude
extending MODULE-NAME .
\`\`\`

**Alias:** \`ex\``,
      kind: 'importation',
    },
    {
      label: 'ex',
      detail: 'Permissive module import (alias)',
      documentation: `## ex
Alias for \`extending\`. Imports a module allowing junk but no confusion.`,
      kind: 'importation',
    },
    {
      label: 'including',
      detail: 'General module import',
      documentation: `## including (inc)
The most general form of module importation. It allows both "junk" and "confusion," completely changing or expanding the sense of the imported module's definitions.

**Syntax:**
\`\`\`maude
including MODULE-NAME .
\`\`\`

**Alias:** \`inc\``,
      kind: 'importation',
    },
    {
      label: 'inc',
      detail: 'General module import (alias)',
      documentation: `## inc
Alias for \`including\`. The most general form of module importation.`,
      kind: 'importation',
    },
    // Data Types and Variables
    {
      label: 'sort',
      detail: 'Declare a sort (data type)',
      documentation: `## sort
Declares a category for values, essentially defining a data type.

**Syntax:**
\`\`\`maude
sort SortName .
\`\`\`

**Example:**
\`\`\`maude
sort Nat .
sort Bool .
\`\`\``,
      kind: 'dataType',
    },
    {
      label: 'sorts',
      detail: 'Declare multiple sorts',
      documentation: `## sorts
Declares multiple sorts at once.

**Syntax:**
\`\`\`maude
sorts Sort1 Sort2 ... SortN .
\`\`\`

**Example:**
\`\`\`maude
sorts Nat Bool Int .
\`\`\``,
      kind: 'dataType',
    },
    {
      label: 'subsort',
      detail: 'Declare subsort relation',
      documentation: `## subsort
Organizes sorts into a hierarchy, establishing that one sort is a subset of another.

**Syntax:**
\`\`\`maude
subsort ChildSort < ParentSort .
\`\`\`

**Example:**
\`\`\`maude
subsort Positive < Integer .
\`\`\``,
      kind: 'dataType',
    },
    {
      label: 'subsorts',
      detail: 'Declare multiple subsort relations',
      documentation: `## subsorts
Declares multiple subsort relations at once.

**Syntax:**
\`\`\`maude
subsorts ChildSort1 ChildSort2 < ParentSort .
\`\`\`

**Example:**
\`\`\`maude
subsorts Positive Negative < Integer .
\`\`\``,
      kind: 'dataType',
    },
    {
      label: 'var',
      detail: 'Declare a variable',
      documentation: `## var
Declares a variable. In Maude, variables act purely as placeholders for pattern matching in equations and rules, rather than storing state as in imperative languages.

**Syntax:**
\`\`\`maude
var VAR-NAME : Sort .
\`\`\`

**Example:**
\`\`\`maude
var N : Nat .
\`\`\``,
      kind: 'dataType',
    },
    {
      label: 'vars',
      detail: 'Declare multiple variables',
      documentation: `## vars
Declares multiple variables of the same sort at once.

**Syntax:**
\`\`\`maude
vars VAR1 VAR2 ... VARN : Sort .
\`\`\`

**Example:**
\`\`\`maude
vars M N : Nat .
\`\`\``,
      kind: 'dataType',
    },
    // Operations and Logic
    {
      label: 'op',
      detail: 'Declare an operation',
      documentation: `## op
Declares an operation, acting as a pathway between sorts. Operations can be defined in prefix notation or mixfix notation (using underscores for argument positions).

**Syntax:**
\`\`\`maude
op OP-NAME : INPUT-SORTS -> OUTPUT-SORT [ATTRIBUTES] .
\`\`\`

**Examples:**
\`\`\`maude
op 0 : -> Nat .
op s_ : Nat -> Nat .
op _+_ : Nat Nat -> Nat [comm assoc] .
\`\`\``,
      kind: 'operation',
      snippet: 'op ${1:name} : ${2:inputs} -> ${3:output} .',
    },
    {
      label: 'ops',
      detail: 'Declare multiple operations',
      documentation: `## ops
Declares multiple operations of the same signature at once.

**Syntax:**
\`\`\`maude
ops OP1 OP2 ... OPN : INPUT-SORTS -> OUTPUT-SORT [ATTRIBUTES] .
\`\`\`

**Example:**
\`\`\`maude
ops _+_ _-_ : Nat Nat -> Nat [assoc comm] .
\`\`\``,
      kind: 'operation',
    },
    {
      label: 'eq',
      detail: 'Declare an unconditional equation',
      documentation: `## eq
Declares an unconditional equation used to simplify expressions mathematically.

**Syntax:**
\`\`\`maude
eq LHS = RHS [ATTRIBUTES] .
\`\`\`

**Example:**
\`\`\`maude
eq 0 + N = N .
\`\`\``,
      kind: 'logic',
    },
    {
      label: 'ceq',
      detail: 'Declare a conditional equation',
      documentation: `## ceq
Declares a conditional equation that only executes a reduction if a specified Boolean statement or pattern match holds true.

**Syntax:**
\`\`\`maude
ceq LHS = RHS if CONDITION .
\`\`\`

**Example:**
\`\`\`maude
ceq N - N = 0 if N > 0 .
\`\`\``,
      kind: 'logic',
    },
    {
      label: 'rl',
      detail: 'Declare an unconditional rewrite rule',
      documentation: `## rl
Declares an unconditional rewrite law. Unlike equations which simplify, rewrite laws map irreversible transitions from one state to another.

**Syntax:**
\`\`\`maude
rl [LABEL] : LHS => RHS [ATTRIBUTES] .
\`\`\`

**Example:**
\`\`\`maude
rl [transition] : a => b .
\`\`\``,
      kind: 'logic',
    },
    {
      label: 'crl',
      detail: 'Declare a conditional rewrite rule',
      documentation: `## crl
Declares a conditional rewrite law, executing a state transition only if a specific condition is met.

**Syntax:**
\`\`\`maude
crl [LABEL] : LHS => RHS if CONDITION .
\`\`\`

**Example:**
\`\`\`maude
crl [pay] : Account(B) => Account(B - Amount) if B >= Amount .
\`\`\``,
      kind: 'logic',
    },
    {
      label: 'if',
      detail: 'Condition separator',
      documentation: `## if
Used to initiate the condition at the end of a \`ceq\`, \`cmb\`, or \`crl\` statement.

**Example:**
\`\`\`maude
ceq X = Y if condition .
\`\`\``,
      kind: 'logic',
    },
    {
      label: 'mb',
      detail: 'Membership axiom',
      documentation: `## mb
Declares a membership axiom, explicitly stating that a specific term is a member of a certain sort.

**Syntax:**
\`\`\`maude
mb TERM : SORT .
\`\`\`

**Example:**
\`\`\`maude
mb 0 : Nat .
\`\`\``,
      kind: 'logic',
    },
    {
      label: 'cmb',
      detail: 'Conditional membership axiom',
      documentation: `## cmb
Declares a conditional membership axiom, assigning a term to a sort only if specific preconditions are fulfilled.

**Syntax:**
\`\`\`maude
cmb TERM : SORT if CONDITION .
\`\`\`

**Example:**
\`\`\`maude
cmb N : Even if N % 2 == 0 .
\`\`\``,
      kind: 'logic',
    },
    // Operator Attributes
    {
      label: 'ctor',
      detail: 'Constructor attribute',
      documentation: `## ctor
Designates an operation as a constructor, which is a fundamental building block of an algebra that cannot be simplified further.

**Usage:** \`[ctor]\``,
      kind: 'attribute',
    },
    {
      label: 'assoc',
      detail: 'Associativity attribute',
      documentation: `## assoc
Declares the operation as associative: \`(A * B) * C = A * (B * C)\`.

**Usage:** \`[assoc]\``,
      kind: 'attribute',
    },
    {
      label: 'comm',
      detail: 'Commutativity attribute',
      documentation: `## comm
Declares the operation as commutative, meaning the order of arguments does not matter: \`A * B = B * A\`.

**Usage:** \`[comm]\``,
      kind: 'attribute',
    },
    {
      label: 'id:',
      detail: 'Identity element attribute',
      documentation: `## id:
Defines the identity element for a binary operator (e.g., \`id: 0\` for addition). Variations include \`left id:\` and \`right id:\`.

**Usage:** \`[id: 0]\``,
      kind: 'attribute',
    },
    {
      label: 'left id:',
      detail: 'Left identity element attribute',
      documentation: `## left id:
Defines the left identity element for a binary operator.

**Usage:** \`[left id: 0]\``,
      kind: 'attribute',
    },
    {
      label: 'right id:',
      detail: 'Right identity element attribute',
      documentation: `## right id:
Defines the right identity element for a binary operator.

**Usage:** \`[right id: 0]\``,
      kind: 'attribute',
    },
    {
      label: 'idem',
      detail: 'Idempotency attribute',
      documentation: `## idem
Declares idempotency, meaning repeated identical elements are discarded (used primarily for sets).

**Usage:** \`[idem]\``,
      kind: 'attribute',
    },
    {
      label: 'iter',
      detail: 'Iteration attribute',
      documentation: `## iter
Allows an unary operator to be iterated mathematically as a power (e.g., writing \`s^5(0)\` instead of \`s(s(s(s(s(0)))))\`).

**Usage:** \`[iter]\``,
      kind: 'attribute',
    },
    {
      label: 'memo',
      detail: 'Memoization attribute',
      documentation: `## memo
Instructs Maude to memorize the reduced form of an expression using this operator to drastically speed up highly recursive algorithms.

**Usage:** \`[memo]\``,
      kind: 'attribute',
    },
    {
      label: 'prec',
      detail: 'Precedence attribute',
      documentation: `## prec
Assigns an integer precedence to the operator to resolve ambiguity. Lower numbers mean higher precedence.

**Usage:** \`[prec 15]\``,
      kind: 'attribute',
    },
    {
      label: 'gather',
      detail: 'Gathering pattern attribute',
      documentation: `## gather
Specifies a gathering pattern (\`e\`, \`E\`, or \`&\`) to resolve ambiguity in parsing non-associative operators by dictating the precedence of nested arguments.

**Usage:** \`[gather (e E)]\``,
      kind: 'attribute',
    },
    {
      label: 'owise',
      detail: 'Otherwise attribute',
      documentation: `## owise (otherwise)
Attached to an equation or rule, it acts as a fallback that executes only if the preceding conditional equations fail.

**Usage:** \`[owise]\``,
      kind: 'attribute',
    },
    {
      label: 'otherwise',
      detail: 'Otherwise attribute (full form)',
      documentation: `## otherwise
Full form of \`owise\`. Acts as a fallback that executes only if preceding conditional equations fail.

**Usage:** \`[otherwise]\``,
      kind: 'attribute',
    },
    {
      label: 'metadata',
      detail: 'Metadata attribute',
      documentation: `## metadata
Allows the programmer to attach a string comment or label to a rule or equation, which is highly useful for internal strategies at the meta-level.

**Usage:** \`[metadata "some info"]\``,
      kind: 'attribute',
    },
    // Full Maude OO Keywords
    {
      label: 'class',
      detail: 'Declare a class (Full Maude)',
      documentation: `## class
Declares a class, serving as a blueprint for objects. It is followed by the class name, the \`|\` symbol, and a comma-separated list of attributes with their sorts.

**Syntax:**
\`\`\`maude
class CLASS-NAME | attr1 : Sort1, attr2 : Sort2 .
\`\`\`

**Example:**
\`\`\`maude
class Account | balance : Int, owner : Oid .
\`\`\``,
      kind: 'oo',
    },
    {
      label: 'subclass',
      detail: 'Declare class inheritance (Full Maude)',
      documentation: `## subclass
Establishes inheritance between classes, allowing a subclass to inherit the attributes of its parent class.

**Syntax:**
\`\`\`maude
subclass CHILD < PARENT .
\`\`\`

**Example:**
\`\`\`maude
subclass SavingsAccount < Account .
\`\`\``,
      kind: 'oo',
    },
    {
      label: 'msg',
      detail: 'Declare a message (Full Maude)',
      documentation: `## msg
Declares a message, which is analogous to an operation but specifically designed to interact with objects and trigger state transitions.

**Syntax:**
\`\`\`maude
msg MSG-NAME : SORTS -> Msg .
\`\`\`

**Example:**
\`\`\`maude
msg deposit : Oid Int -> Msg .
\`\`\``,
      kind: 'oo',
    },
    {
      label: 'msgs',
      detail: 'Declare multiple messages (Full Maude)',
      documentation: `## msgs
Declares multiple messages with the same signature at once.

**Syntax:**
\`\`\`maude
msgs MSG1 MSG2 : SORTS -> Msg .
\`\`\``,
      kind: 'oo',
    },
    {
      label: 'Msg',
      detail: 'Built-in message sort (Full Maude)',
      documentation: `## Msg
A built-in sort provided by Full Maude representing the state of a message.`,
      kind: 'builtin',
    },
    {
      label: 'Oid',
      detail: 'Object Identifier sort (Full Maude)',
      documentation: `## Oid
Short for "Object Identifier." A built-in sort used to name and target specific object instances within messages.`,
      kind: 'builtin',
    },
    // Parameterization
    {
      label: 'fth',
      detail: 'Functional Theory',
      documentation: `## fth ... endfth
Declares a **Functional Theory**. A theory acts as a schematic or set of rules that a parameter must fulfill to be accepted into a parameterized module.

**Syntax:**
\`\`\`maude
fth THEORY-NAME is
  ...
endfth
\`\`\``,
      kind: 'parameterization',
    },
    {
      label: 'endfth',
      detail: 'End Functional Theory',
      documentation: `## endfth
Closes a \`fth\` (Functional Theory) declaration.`,
      kind: 'parameterization',
    },
    {
      label: 'view',
      detail: 'Declare a view',
      documentation: `## view ... from ... to ... endv
Declares a view. A view acts as the bridge mapping the generic requirements of a theory to the specific sorts and operations of a target module.

**Syntax:**
\`\`\`maude
view VIEW-NAME from THEORY-NAME to MODULE-NAME is
  ...
endv
\`\`\`

**Example:**
\`\`\`maude
view Nat from TRIV to NAT is
  sort Elt to Nat .
endv
\`\`\``,
      kind: 'parameterization',
    },
    {
      label: 'endv',
      detail: 'End view',
      documentation: `## endv
Closes a \`view\` declaration.`,
      kind: 'parameterization',
    },
    {
      label: 'from',
      detail: 'Source theory in view declaration',
      documentation: `## from
Used in view declarations to specify the source theory: \`view Name from THEORY to MODULE\`.`,
      kind: 'parameterization',
    },
    {
      label: 'to',
      detail: 'Target module in view / sort mapping',
      documentation: `## to
Used inside a view to directly map a theory's sort or operation to a target module's sort or operation.

**Example:**
\`\`\`maude
sort Elt to Nat .
\`\`\``,
      kind: 'parameterization',
    },
    {
      label: 'to term',
      detail: 'Map operator to complex expression',
      documentation: `## to term
Used inside a view to map an operator in the theory to a more complex expression in the target module.

**Example:**
\`\`\`maude
op s X to term X + 3 .
\`\`\``,
      kind: 'parameterization',
    },
    // Environment and Execution Commands
    {
      label: 'load',
      detail: 'Load a file into Maude',
      documentation: `## load
Loads a file containing modules from a file directory into the Maude environment.

**Syntax:**
\`\`\`maude
load MODULE-NAME
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'select',
      detail: 'Switch active module',
      documentation: `## select
Changes the currently active module, directing Maude on where to look for rules during subsequent commands.

**Syntax:**
\`\`\`maude
select MODULE-NAME .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'reduce',
      detail: 'Reduce term to canonical form',
      documentation: `## reduce (red)
Evaluates and simplifies a specified term to its canonical form using the equations and membership axioms defined in the current module.

**Syntax:**
\`\`\`maude
reduce in MODULE-NAME : expression .
\`\`\`

**Alias:** \`red\`

**Example:**
\`\`\`maude
red 1 + 2 .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'red',
      detail: 'Reduce term (alias)',
      documentation: `## red
Alias for \`reduce\`. Evaluates and simplifies a term to its canonical form.

**Example:**
\`\`\`maude
red 1 + 2 .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'rewrite',
      detail: 'Apply rewrite rules',
      documentation: `## rewrite (rew)
Applies rewrite laws to map transitions from one state to another using the default Maude strategy. Can be bounded by a number in brackets.

**Syntax:**
\`\`\`maude
rewrite [BOUND] expression .
\`\`\`

**Alias:** \`rew\`

**Example:**
\`\`\`maude
rew [100] myTerm .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'rew',
      detail: 'Rewrite (alias)',
      documentation: `## rew
Alias for \`rewrite\`. Applies rewrite laws for state transitions.

**Syntax:**
\`\`\`maude
rew expression .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'frewrite',
      detail: 'Fair rewrite',
      documentation: `## frewrite (frew)
Executes a "fair rewrite" strategy that cycles through available rewrite laws ensuring no valid rule is ignored, preventing the system from getting stuck in trivial loops.

**Syntax:**
\`\`\`maude
frewrite [BOUND] expression .
\`\`\`

**Alias:** \`frew\``,
      kind: 'environment',
    },
    {
      label: 'frew',
      detail: 'Fair rewrite (alias)',
      documentation: `## frew
Alias for \`frewrite\`. Fair rewrite strategy that cycles through rules.`,
      kind: 'environment',
    },
    {
      label: 'continue',
      detail: 'Continue rewrite/frewrite',
      documentation: `## continue
Resumes a paused or bounded \`rewrite\` or \`frewrite\` for a specified number of additional steps.

**Syntax:**
\`\`\`maude
continue X .
\`\`\`

Where X is the number of steps.`,
      kind: 'environment',
    },
    {
      label: 'search',
      detail: 'Breadth-first state space search',
      documentation: `## search
Performs a breadth-first search of the state space. It looks for a sequence of rewrite laws connecting a start state to a final state pattern.

**Syntax:**
\`\`\`maude
search [BOUND] START =>+ PATTERN .
\`\`\`

**Search conditions:**
- \`=>+\` - one or more steps
- \`=>!\` - terminal state (cannot be rewritten further)

**Example:**
\`\`\`maude
search init =>+ goal .
search init =>! terminal .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'show path',
      detail: 'Show rewrite path for search result',
      documentation: `## show path
Used after a \`search\` command to explicitly print the exact sequence of states and rules applied to reach a specific solution state.

**Syntax:**
\`\`\`maude
show path X .
\`\`\`

Where X is the state number from the search results.`,
      kind: 'environment',
    },
    {
      label: 'set trace on',
      detail: 'Enable tracing',
      documentation: `## set trace on
Toggles on a debugging mode that outputs every equation and variable substitution applied during a reduction step-by-step.

**To disable:**
\`\`\`maude
set trace off .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'set trace off',
      detail: 'Disable tracing',
      documentation: `## set trace off
Disables the step-by-step tracing output.`,
      kind: 'environment',
    },
    {
      label: 'trace select',
      detail: 'Filter trace to specific operators',
      documentation: `## trace select
Allows you to limit the tracing output to specific operators, filtering the trace so that you only see the steps relevant to the operator you are trying to debug.

**Syntax:**
\`\`\`maude
trace select (OP-NAME) .
\`\`\`

**Example:**
\`\`\`maude
trace select (_*_) .
\`\`\``,
      kind: 'environment',
    },
    {
      label: 'loop',
      detail: 'Initialize interactive sub-environment',
      documentation: `## loop
Initializes a user-interactive sub-environment (via the \`LOOP-MODE\` module), allowing Maude to accept quoted inputs, process them, and output a programmed response.

**Syntax:**
\`\`\`maude
loop INITIAL-STATE .
\`\`\`

**Example:**
\`\`\`maude
loop startsmiling .
loop [nil, none, nil] .
\`\`\``,
      kind: 'environment',
    },
    // Meta-level descent functions
    {
      label: 'metaReduce',
      detail: 'Meta-level reduce',
      documentation: `## metaReduce
Takes a meta-represented module and a meta-represented term, and returns the simplified term and its sort, relying purely on the equations of that meta-module.

Part of the \`META-LEVEL\` module.`,
      kind: 'meta',
    },
    {
      label: 'metaRewrite',
      detail: 'Meta-level rewrite',
      documentation: `## metaRewrite
The meta-level equivalent of \`rewrite\`. It takes a meta-module, a meta-term, and a bound (a number or \`unbounded\`), and applies rewrite laws to transition the state at the meta-level.

Part of the \`META-LEVEL\` module.`,
      kind: 'meta',
    },
    {
      label: 'metaApply',
      detail: 'Apply specific rewrite law',
      documentation: `## metaApply
Takes a module, a term, the name of a specific rewrite law, a set of variable substitutions, and a natural number. It rewrites the term by applying that *exact* specified law. The target term must exactly match the left-hand side of the specified rule.

Part of the \`META-LEVEL\` module.`,
      kind: 'meta',
    },
    {
      label: 'metaXapply',
      detail: 'Apply rewrite rule with extension',
      documentation: `## metaXapply
Works like \`metaApply\` but applies the rewrite rule with *extension*. This means it can search deeply inside nested operators within an expression to find a match for the left-hand side of the rewrite rule.

Part of the \`META-LEVEL\` module.`,
      kind: 'meta',
    },
    {
      label: 'up',
      detail: 'Up reflection (term to meta-representation)',
      documentation: `## up
Translates standard code into its meta-represented term format.

**Syntax:**
\`\`\`maude
up(MODULE, expression)
\`\`\``,
      kind: 'meta',
    },
    {
      label: 'down',
      detail: 'Down reflection (meta-representation to term)',
      documentation: `## down
Converts meta-represented code back into normal, readable Maude code.

**Syntax:**
\`\`\`maude
down MODULE : meta-expression
\`\`\``,
      kind: 'meta',
    },
  ];

  static get allLabels(): string[] {
    return this.keywords.map(k => k.label);
  }

  static getByLabel(label: string): MaudeDocEntry | undefined {
    return this.keywords.find(k => k.label === label);
  }

  static getByKind(kind: string): MaudeDocEntry[] {
    return this.keywords.filter(k => k.kind === kind);
  }

  static get completionLabels(): string[] {
    return this.keywords.map(k => k.label);
  }
}
