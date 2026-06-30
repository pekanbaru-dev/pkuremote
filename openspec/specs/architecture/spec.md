### Requirement: Shared code and domain features are separated into horizontal and vertical layers

`src/lib/` SHALL be organized into two kinds of code: **horizontal shared layers** that carry no domain knowledge — `src/lib/components/` (reusable UI), `src/lib/server/` (server-only infrastructure), and shared helpers (`src/lib/utils.ts`, `src/lib/assets/`) — and **vertical domain slices** under `src/lib/features/<feature>/`. Routes under `src/routes/` SHALL compose features and shared components; routes SHALL remain thin (no domain logic that belongs in a feature service). The architecture SHALL be documented in a root `ARCHITECTURE.md`.

#### Scenario: A contributor locates where new code belongs

- **WHEN** a contributor needs to add domain-specific logic or UI for a new domain area
- **THEN** `ARCHITECTURE.md` directs them to create a vertical slice under `src/lib/features/<feature>/`, and to place only domain-agnostic, reusable UI under `src/lib/components/`.

#### Scenario: A reader understands the layering from the doc

- **WHEN** a reader opens `ARCHITECTURE.md`
- **THEN** it describes the horizontal shared layers (`components/`, `server/`, shared helpers) and the vertical `features/<name>/` slices, with a structural map of `src/lib/`.

### Requirement: A feature is a self-contained slice exposed through a public barrel

Each feature under `src/lib/features/<feature>/` SHALL bundle its own `components/` (feature-specific UI), `services/` (data access and domain logic), `types.ts` (the feature's types), and an `index.ts` that is the feature's **public barrel**. Consumers (routes or other modules) SHALL import a feature ONLY through its barrel (`$lib/features/<feature>`), never through nested paths (`$lib/features/<feature>/components/...`, `.../services/...`, or `.../types`). The barrel SHALL export only the feature's intended public surface.

#### Scenario: A consumer imports a feature through its barrel

- **WHEN** a route or module needs a feature's component, service, or type
- **THEN** it imports from `$lib/features/<feature>` (the barrel), and the import resolves to a name the barrel explicitly re-exports.

#### Scenario: A reviewer checks for deep imports into a feature

- **WHEN** a reviewer greps the codebase for imports matching `$lib/features/<feature>/components/` or `.../services/` from outside that feature
- **THEN** no matches appear — all external consumers go through the barrel.

#### Scenario: Barrel-contract enforcement status is documented

- **WHEN** a contributor reads `ARCHITECTURE.md` about the barrel-only import rule
- **THEN** the doc states that this rule is currently enforced by convention (the barrel docstring) and not yet by a lint rule, and notes a future change to add lint enforcement.

### Requirement: Dependencies flow in one direction across layers

The architecture SHALL enforce a one-directional dependency flow: features MAY import from `src/lib/components/` and shared helpers; routes MAY import from features (via barrels) and from `src/lib/components/`. Shared components under `src/lib/components/` SHALL NOT import from any `src/lib/features/<feature>/`. A feature SHALL NOT import from another feature. `src/lib/server/` SHALL be server-only and SHALL NOT be imported by client-side code. These rules SHALL be documented in `ARCHITECTURE.md`.

#### Scenario: A shared component is kept domain-agnostic

- **WHEN** a developer is tempted to import a feature type or service into a `src/lib/components/` primitive
- **THEN** `ARCHITECTURE.md` identifies this as a forbidden reverse dependency, and the component is instead kept generic (the domain concern moves to a feature).

#### Scenario: Cross-feature coupling is avoided

- **WHEN** feature A needs behavior owned by feature B
- **THEN** the dependency is recognized as forbidden cross-feature coupling, resolved by promoting the shared concern to `src/lib/components/` (if UI) or a shared service, rather than importing B into A.

#### Scenario: Server-only code is not pulled into the client bundle

- **WHEN** client-side code (a component or route `+page.svelte`) attempts to import from `src/lib/server/`
- **THEN** the architecture identifies this as a boundary violation; server-only access happens in server load functions / endpoints, not client code.

### Requirement: Adding a feature follows a documented recipe

`ARCHITECTURE.md` SHALL include a step-by-step recipe for adding a new feature: create `src/lib/features/<name>/` with `components/` and `services/` subfolders, a `types.ts`, and an `index.ts` barrel; export only the public surface from the barrel; consume shared UI from `$lib/components/`; avoid cross-feature and reverse imports; and add a corresponding OpenSpec capability spec for the feature's behavior.

#### Scenario: A contributor adds a second feature

- **WHEN** a contributor follows the `ARCHITECTURE.md` recipe to add a new feature
- **THEN** the resulting slice matches the established shape (the same structure as `src/lib/features/events/`), exposes a barrel, consumes shared components, and has no cross-feature or reverse-direction imports.

### Requirement: AGENTS.md and README point to ARCHITECTURE.md

`AGENTS.md` SHALL reference `ARCHITECTURE.md` from its component-folders and feature-related guidance rather than duplicating the architectural map, and `README.md` SHALL link to `ARCHITECTURE.md` from a project-structure context. ARCHITECTURE.md SHALL remain the single source of truth for structural conventions; other docs reference it.

#### Scenario: An agent reading AGENTS.md finds the architecture

- **WHEN** an agent reads the component-folders or feature guidance in `AGENTS.md`
- **THEN** it finds a pointer to `ARCHITECTURE.md` for the full structural map and dependency rules, with no conflicting duplicate map in `AGENTS.md`.

#### Scenario: A new contributor finds the architecture from the README

- **WHEN** a new contributor reads `README.md`
- **THEN** they find a link to `ARCHITECTURE.md` for the project's structural conventions.
