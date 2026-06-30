## Why

The project has a real, deliberate architecture — a horizontal layer of shared code (`src/lib/components/` for UI, `src/lib/server/` for infra, `src/lib/utils.ts`) plus vertical domain slices (`src/lib/features/<feature>/` bundling `components/` + `services/` + `types.ts` behind a public `index.ts` barrel) — but it is **not documented anywhere as a project-wide convention**. The events feature's barrel even encodes an invariant in a docstring ("Consumers SHALL import only from `$lib/features/events`, never from nested files"), and the `events` capability spec documents the slice structure, but **only for events specifically**. A new contributor (or agent) adding a second feature has no general guide for: the layering, the dependency direction (features may use components; components must not know features), the barrel-only import contract, where `server/` fits, or how routes compose features. AGENTS.md hints at "Component folders" and the feature barrel in passing but carries no architectural map. This change captures the architecture as a first-class document.

## What Changes

- Add a root `ARCHITECTURE.md` documenting: the horizontal/vertical split; the `components/` (primitives vs ui) layer; the `features/<name>/` slice anatomy (`components/`, `services/`, `types.ts`, `index.ts` barrel); the dependency rules (features → components OK; components → features FORBIDDEN; feature → feature FORBIDDEN); the `server/` boundary; how routes compose features; and a "how to add a new feature" recipe.
- Add a new `architecture` capability spec (`openspec/specs/architecture/spec.md`) capturing the general, project-wide structural requirements (the events spec stays the concrete per-capability exemplar; the new spec generalizes the pattern to ALL features).
- Add short pointers from `AGENTS.md` (its existing "Component folders" + feature-barrel mentions gain a "see ARCHITECTURE.md" reference) and `README.md` (a one-line link in a project-structure section) so both agents and humans discover it.
- Flag (but do not fix here) that the **feature barrel contract is currently honor-system** — eslint enforces component-vocabulary imports (use `<Button>` from ui) but does NOT block deep imports into `features/<name>/components/...`. ARCHITECTURE.md documents the rule; a lint rule to enforce it is noted as a future change.

## Capabilities

### New Capabilities

- `architecture`: the project-wide structural convention — the layering of `src/lib/` (shared `components/`/`server/`/`utils` vs vertical `features/<name>/` slices), the dependency-direction rules, the feature-slice anatomy + barrel-only import contract, and the "adding a new feature" recipe. Distinct from the `events` capability (which specifies one concrete feature); this capability specifies the _pattern_ every feature follows.

### Modified Capabilities

<!-- None. The events spec already documents the events-specific slice; this change generalizes the pattern in a NEW capability rather than modifying the events spec. AGENTS.md/README edits are doc pointers, not spec'd capabilities. -->

(none)

## Impact

- `ARCHITECTURE.md` — new root doc (the architectural map + rules + new-feature recipe).
- `openspec/specs/architecture/spec.md` — new capability spec (created on archive via the delta in `openspec/changes/document-architecture/specs/architecture/spec.md`).
- `AGENTS.md` — small edits: the "Component folders (primitives vs ui)" section + the feature-barrel mention each gain a "see ARCHITECTURE.md" pointer.
- `README.md` — a one-line project-structure pointer to ARCHITECTURE.md.
- No source code changes (this is documentation + spec only). The honor-system barrel-enforcement gap is documented, not fixed.
- Fits the existing root-doc convention (DESIGN.md = visual, PRODUCT.md = who/why, CONTRIBUTING.md = workflow, ARCHITECTURE.md = structure), keeping AGENTS.md lean rather than bloating it past its current ~143 lines.
