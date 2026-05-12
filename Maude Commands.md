
## Maude Commands

**Module and Environment Commands**

- **`load MODULE-NAME`**: This command is used to load a file containing modules from a file directory into the Maude environment so they can be accessed and used.
- **`select MODULE-NAME`**: Changes the currently active module in the environment. This tells Maude which module's definitions, equations, and rules should be referenced when executing subsequent commands.

**Execution and Evaluation Commands**

- **`reduce` (or `red`)**: This command causes a specified term to be reduced and simplified to its canonical (simplest) form using the equations and membership axioms defined in the current module. You can explicitly specify the module that contains the rules you want to apply by using the syntax `red in MODULE-NAME : expression .`. Every expression evaluated with this command must end with a period.

**Rewriting and State Transition Commands**

- **`rewrite` (or `rew`)**: This command applies rewrite laws to an expression to map transitions from one state to another using Maude's default strategy. It can be bounded by inserting a natural number in brackets (e.g., `rew expression .`), which tells Maude to apply a maximum of 100 rewrite laws. If the number is omitted, it becomes an unbounded rewrite, and Maude will continue applying laws until termination, which can cause infinite loops if the system is non-terminating.
- **`frewrite` (or `frew`)**: Stands for "fair rewrite". The default `rewrite` command can sometimes get stuck in an uncreative loop (such as endlessly stacking and unstacking the same two items), ignoring other valid rewrite rules. The `frewrite` command utilizes a strategy that ensures no rewrite law goes ignored, cycling through different possible transitions. Like `rewrite`, it can take an upper bound in brackets.
- **`continue`**: This command picks up where a previous `rewrite` or `frewrite` operation left off. By inputting `continue X .` (where X is a number), Maude will continue the current rewrite strategy for exactly X more steps.

**Search and Path Commands**

- **`search`**: This command performs a breadth-first search through the state space to find paths of rewrite laws that connect a starting state to a specific final state or pattern. You can use different symbols to specify the search condition: `=>+` searches for a solution involving at least one rewrite law, while `=>!` searches specifically for a terminal state that cannot be rewritten any further. When successful, this command returns a numbered list of states that match the search criteria.
- **`show path`**: Used in conjunction with the `search` command. Once a search returns a list of solution states, you can type `show path X .` (where X is the state number) to see the exact sequence of states and rewrite rules Maude applied to reach that specific end state.

**Debugging and Tracing Commands**

- **`set trace on` / `set trace off`**: Instructs the Maude interpreter to show you the reduction and rewriting process step-by-step. When trace is on, Maude will output every equation used and show how each variable was filled during the execution, making it an excellent tool for debugging tricky modules.
- **`trace select`**: Allows you to limit the tracing output to specific operators (e.g., `trace select (_*_) .`), filtering the trace so that you only see the steps relevant to the operator you are trying to debug.

**User Interface and Sub-Environment Commands**

- **`loop`**: Initializes a user-interactive sub-environment built using the `LOOP-MODE` module. You initialize the loop to a starting point defined in your module (e.g., `loop startsmiling .` or `loop [nil, none, nil] .`), after which Maude will accept customized user inputs enclosed in parentheses, process them as quoted identifiers, and print a programmed output to the screen.

**Meta-Programming Descent Functions (Used as Commands via `red`)**

While technically functions defined in the `META-LEVEL` module, these are executed as commands to manipulate other Maude modules at a higher level:

- **`metaReduce`**: Takes a meta-represented module and a meta-represented term, and returns the simplified term and its sort, relying purely on the equations of that meta-module.
- **`metaRewrite`**: The meta-level equivalent of `rewrite`. It takes a meta-module, a meta-term, and a bound (a number or `unbounded`), and applies rewrite laws to transition the state at the meta-level.
- **`metaApply`**: Takes a module, a term, the name of a specific rewrite law, a set of variable substitutions, and a natural number. It rewrites the term by applying that _exact_ specified law. The target term must exactly match the left-hand side of the specified rule.
- **`metaXapply`**: Works like `metaApply` but applies the rewrite rule with _extension_. This means it can search deeply inside nested operators within an expression to find a match for the left-hand side of the rewrite rule. It allows specifying upper and lower depth bounds for this internal search and returns a 4-tuple that includes the surrounding "context" of the term that was not modified.
- **`up` and `down`**: Cosmetic functions used to change reflection levels, making meta-programming significantly easier to type and read. `up(MODULE, expression)` translates standard code into its ugly meta-represented term format, while `down MODULE : meta-expression` converts it back into normal, readable Maude code.