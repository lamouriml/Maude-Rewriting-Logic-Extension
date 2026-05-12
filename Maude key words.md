
## Maude key words
### 1. Module Declarations

These keywords define the boundaries and types of modules, which are the fundamental building blocks containing sorts, operations, and rules in Maude.

- **`fmod` ... `is` ... `endfm`**: Declares a **Functional Module**. These modules define an equational-style functional program containing sorts, elements, and functions (equations) that act upon those sorts to simplify expressions to their canonical forms.
- **`mod` ... `is` ... `endm`**: Declares a **System Module**. These modules are declarative-style concurrent programs that include rewrite rules (`rl`) to define state transitions, in addition to equations.
- **`omod` ... `is` ... `endom`**: Declares an **Object-Oriented Module**. Available only in Full Maude (and requiring parentheses around the module), these modules encapsulate data into classes and objects, and use messages to transition between states.

### 2. Module Importation

Maude allows importing definitions from one module into another. The keyword used dictates the strictness of the importation.

- **`protecting` (or `pr`)**: Imports a module strictly. It ensures that no "junk" (new ground terms/constructors added to the imported sorts) and no "confusion" (new equations that alter how imported terms are reduced) are added to the imported semantics.
- **`extending` (or `ex`)**: Imports a module allowing "junk" (you can add new elements to the imported sorts) but ruling out "confusion" (you cannot redefine or alter the existing reduction rules).
- **`including` (or `inc`)**: The most general form of module importation. It allows both "junk" and "confusion," completely changing or expanding the sense of the imported module's definitions.

### 3. Data Types and Variables

These keywords define the taxonomy of the data manipulated in the program.

- **`sort` / `sorts`**: Declares a category for values, essentially defining a data type (e.g., `sort Nat .`).
- **`subsort` / `subsorts`**: Organizes sorts into a hierarchy. For instance, `subsorts Positive Negative < Integer` establishes that Positive and Negative are specific groups belonging to the same encompassing Integer sort.
- **`var` / `vars`**: Declares variables. In Maude, variables act purely as placeholders for pattern matching in equations and rules, rather than storing state as in imperative languages.

### 4. Operations and Logic

These keywords map out the relationships, properties, and transition logic within the algebra.

- **`op` / `ops`**: Declares an operation, acting as a pathway between sorts. Operations can be defined in prefix notation (e.g., `op f : X -> Y .`) or mixfix notation (e.g., `op _+_ : X X -> X .`).
- **`eq`**: Declares an unconditional equation used to simplify expressions mathematically.
- **`ceq`**: Declares a conditional equation that only executes a reduction if a specified Boolean statement or pattern match holds true.
- **`rl`**: Declares an unconditional rewrite law. Unlike equations which simplify, rewrite laws map irreversible transitions from one state to another (using the `=>` symbol).
- **`crl`**: Declares a conditional rewrite law, executing a state transition only if a specific condition (which can even be another rewrite law) is met.
- **`if`**: Used to initiate the condition at the end of a `ceq`, `cmb`, or `crl` statement.
- **`mb`**: Declares a membership axiom, explicitly stating that a specific term is a member of a certain sort.
- **`cmb`**: Declares a conditional membership axiom, assigning a term to a sort only if specific preconditions are fulfilled.

### 5. Operator and Statement Attributes (Flags)

Attributes are flags enclosed in brackets `[]` that provide the Maude interpreter with specific rules on how to handle an operation or equation.

- **`ctor`**: Designates an operation as a constructor, which is a fundamental building block of an algebra that cannot be simplified further.
- **`assoc`**: Declares the operation as associative (e.g., `(A B) C = A (B C)`).
- **`comm`**: Declares the operation as commutative, meaning the order of arguments does not matter.
- **`id:`**: Defines the identity element for a binary operator (e.g., `id: 0` for addition). Variations include **`left id:`** and **`right id:`**.
- **`idem`**: Declares idempotency, meaning repeated identical elements are discarded (used primarily for sets).
- **`iter`**: Allows an unary operator to be iterated mathematically as a power (e.g., writing `s_^5(0)` instead of `s(s(s(s(s(0)))))`).
- **`memo`**: Instructs Maude to memorize the reduced form of an expression using this operator to drastically speed up highly recursive algorithms.
- **`prec`**: Assigns an integer precedence to the operator to resolve ambiguity. Lower numbers mean higher precedence.
- **`gather`**: Specifies a gathering pattern (`e`, `E`, or `&`) to resolve ambiguity in parsing non-associative operators by dictating the precedence of nested arguments.
- **`owise` / `otherwise`**: Attached to an equation or rule, it acts as a fallback that executes only if the preceding conditional equations fail.
- **`metadata`**: Allows the programmer to attach a string comment or label to a rule or equation, which is highly useful for internal strategies at the meta-level.

### 6. Full Maude: Object-Oriented Keywords

These keywords are specific to Full Maude's object-oriented capabilities (`omod`).

- **`class`**: Declares a class, serving as a blueprint for objects. It is followed by the class name, the `|` symbol, and a comma-separated list of attributes with their sorts (e.g., `class TABLE | occupied : Bool`).
- **`subclass`**: Establishes inheritance between classes, allowing a subclass to inherit the attributes of its parent class.
- **`msg` / `msgs`**: Declares a message, which is analogous to an operation but specifically designed to interact with objects and trigger state transitions.
- **`Msg`**: A built-in sort provided by Full Maude representing the state of a message.
- **`Oid`**: Short for "Object Identifier," this is a built-in sort used to name and target specific object instances within messages.

### 7. Full Maude: Parameterization Keywords

Parameterization allows you to write generic, reusable modules (like a generic List) that can be instantiated with specific sorts (like a List of Integers).

- **`fth` ... `is` ... `endfth`**: Declares a **Functional Theory**. A theory acts as a schematic or set of rules that a parameter must fulfill to be accepted into a parameterized module.
- **`view` ... `from` ... `to` ... `is` ... `endv`**: Declares a view. A view acts as the bridge mapping the generic requirements of a theory to the specific sorts and operations of a target module.
- **`to`**: Used inside a view to directly map a theory's sort or operation to a target module's sort or operation (e.g., `sort Node to Letter`).
- **`to term`**: Used inside a view to map an operator in the theory to a more complex expression in the target module (e.g., `op s X to term X + 3`).

### 8. Environment and Execution Commands

These keywords are used directly in the Maude prompt to execute code, test modules, and debug.

- **`load`**: Loads a file containing modules into the Maude environment.
- **`select`**: Changes the currently active module, directing Maude on where to look for rules during subsequent commands.
- **`reduce` (or `red`)**: Evaluates and simplifies a specified term to its canonical form using the equations and membership axioms.
- **`rewrite` (or `rew`)**: Applies rewrite laws to map transitions from one state to another using the default Maude strategy. It can be bounded by a number in brackets (e.g., `rew`).
- **`frewrite` (or `frew`)**: Executes a "fair rewrite" strategy that cycles through available rewrite laws ensuring no valid rule is ignored, preventing the system from getting stuck in trivial loops.
- **`continue`**: Resumes a paused or bounded `rewrite` or `frewrite` for a specified number of additional steps.
- **`search`**: Performs a breadth-first search of the state space. It looks for a sequence of rewrite laws connecting a start state to a final state pattern. It uses symbols like `=>+` (one or more steps) or `=>!` (terminal state).
- **`show path`**: Used after a `search` command to explicitly print the exact sequence of states and rules applied to reach a specific solution state.
- **`set trace on` / `set trace off`**: Toggles a debugging mode that outputs every equation and variable substitution applied during a reduction step-by-step.
- **`loop`**: Initializes a user-interactive sub-environment (via the `LOOP-MODE` module), allowing Maude to accept quoted inputs, process them, and output a programmed response to the screen.