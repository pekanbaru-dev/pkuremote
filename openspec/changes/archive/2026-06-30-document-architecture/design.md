## Context

The repo has a deliberate architecture that exists in code but not in prose:

```
src/lib/
├── components/          HORIZONTAL — shared UI vocabulary (no domain knowledge)
│   ├── primitives/      hand-rolled (button, input, badge, checkbox, radio, avatar)
│   └── ui/              shadcn-svelte / bits-ui (card, dialog, dropdown, …)
├── features/            VERTICAL — domain slices
│   └── events/
│       ├── components/  feature-specific UI (EventCard, EventDetailHero, …)
│       ├── services/    data + logic (dummy-events, json-ld)
│       ├── types.ts
│       └── index.ts     PUBLIC BARREL — the only legal import surface
├── server/              server-only infra (auth/, db/, supabase/)
├── supabase/            client
├── assets/  utils.ts    misc shared
```

Consumers (`src/routes/`) compose features + components. The events barrel docstring already states the invariant: _"Consumers SHALL import only from `$lib/features/events`, never from nested files."_ The `events` capability spec documents the slice — but only for events. There is no general, project-wide architecture doc or spec.

Existing doc ecosystem (10 root `.md`): `AGENTS.md` (143 lines, agent guide), `DESIGN.md` (visual system), `PRODUCT.md` (who/why), `CONTRIBUTING.md` (workflow), `README.md`, etc. The established convention is **one dedicated doc per major concern, referenced from AGENTS.md**.

eslint enforcement (relevant constraint): `no-restricted-imports` + `no-restricted-html-elements` enforce component-VOCABULARY (use `<Button>` from `ui`, not a raw `<button>` or a deep button import). They do **NOT** enforce the feature-barrel contract — nothing currently blocks `import { EventCard } from "$lib/features/events/components/event-card.svelte"`. The barrel rule is honor-system.

## Goals / Non-Goals

**Goals:**

- Document the architecture as a first-class, discoverable artifact (the layering, dependency rules, feature-slice anatomy, barrel contract, new-feature recipe).
- Decide and record the home: `ARCHITECTURE.md` vs an AGENTS.md section.
- Capture the project-wide structural convention as a reusable `architecture` capability spec (generalizing what the `events` spec shows for one feature).
- Keep AGENTS.md lean; wire discovery via short pointers.

**Non-Goals:**

- Changing any source code or folder layout — this is documentation + spec only.
- Adding a lint rule to enforce the barrel contract — documented as a future change, not done here.
- Re-specifying the events feature — the `events` spec stays as the concrete exemplar.
- Documenting the OpenSpec workflow, design system, or product (already covered by their own docs; ARCHITECTURE.md cross-links, doesn't duplicate).

## Decisions

### Decision 1: ARCHITECTURE.md (dedicated doc), not an AGENTS.md section

**Choice:** Create a root `ARCHITECTURE.md`. AGENTS.md keeps its terse "Component folders" + feature-barrel lines and gains "see ARCHITECTURE.md" pointers. README gains a one-line link.

**Rationale:**

- **Matches the existing convention.** Every major concern already has its own doc (DESIGN = visual, PRODUCT = who/why, CONTRIBUTING = workflow). Architecture is a peer; folding it into AGENTS.md would make it the lone exception.
- **Keeps AGENTS.md lean.** It's already 143 lines / 14KB. A proper architecture section (layering + rules + recipe) would push it toward 250+ and dilute its job as the agent operating guide.
- **Dual audience.** ARCHITECTURE.md serves humans (the repo has CONTRIBUTING.md + CODE_OF_CONDUCT.md → onboarding matters) AND agents. A named file is more discoverable for humans than a buried AGENTS.md heading.
- **Single source of truth.** AGENTS.md _references_ rather than _duplicates_, so there's one place to update (no drift).

**Alternatives considered:**

- _AGENTS.md section only_ — rejected: bloats the agent guide, breaks the per-concern-doc convention, less discoverable for human contributors. (Would win only if the architecture were trivial — it isn't: 3 layers, enforced dependency direction, barrel contract.)
- _Both (duplicate content)_ — rejected: drift risk; two places to maintain.

### Decision 2: A new `architecture` capability spec, separate from `events`

**Choice:** Add `openspec/specs/architecture/spec.md` (via this change's delta) capturing the GENERAL pattern. Leave the `events` spec's "All event-specific code lives in `features/events/`" requirement as the concrete instance.

**Rationale:**

- The `events` spec already specifies the slice for ONE feature. The architectural _pattern_ (every feature follows this shape; these dependency rules hold project-wide) is a distinct, reusable requirement set that shouldn't be buried in a single feature's spec.
- A future second feature should be able to point at the `architecture` spec, not copy the events spec.

**Alternatives considered:**

- _Modify the events spec to add general rules_ — rejected: scopes a project-wide convention inside one feature's capability; wrong home.
- _No spec, just the doc_ — rejected: the project specs its conventions (component-library, eslint-component-rules already exist as capability specs); architecture deserves the same rigor and gives the doc a testable backbone.

### Decision 3: Document the barrel-enforcement gap honestly, don't fix it here

**Choice:** ARCHITECTURE.md + the spec state the barrel-only import rule AND note that it is currently enforced by convention (docstring) only, not by lint. A lint rule (extending the existing `no-restricted-imports` patterns to block `**/features/*/components/**` deep imports from outside the feature) is flagged as a future change.

**Rationale:**

- Honesty: documenting a rule as "enforced" when it isn't would mislead. The eslint config demonstrably enforces component vocabulary but not feature-barrel depth.
- Scope: adding + testing a lint rule is implementation with its own risk (false positives on the feature's own internal imports); it belongs in its own change.

### Decision 4: ARCHITECTURE.md content outline

```
ARCHITECTURE.md
├── Overview            one-paragraph: SvelteKit + feature-sliced lib
├── The two axes        horizontal (shared) vs vertical (features) + ASCII map
├── src/lib/components/ primitives vs ui (link to component-library spec + AGENTS)
├── src/lib/features/   slice anatomy: components/ services/ types.ts index.ts
│                       the barrel = the only public surface
├── Dependency rules    features → components  ✓
│                       routes → features (barrel) + components  ✓
│                       components → features   ✗ FORBIDDEN
│                       feature → other feature ✗ FORBIDDEN
│                       (enforcement: vocabulary = lint; barrel-depth = convention)
├── src/lib/server/     server-only boundary (auth/db/supabase); never imported by client
├── Routes              how src/routes/ composes features + components
├── Adding a feature    the recipe: mkdir features/<name>/{components,services},
│                       types.ts, index.ts barrel; export only the public surface;
│                       consume components from $lib/components; add a capability spec
└── See also            DESIGN.md, PRODUCT.md, AGENTS.md, component-library + events specs
```

**Rationale:** mirrors the actual tree; leads with the mental model (two axes) before details; ends with an actionable recipe so the doc is generative, not just descriptive.

## Risks / Trade-offs

- **[Risk: doc drifts from code as features are added]** — a static map goes stale.
  → **Mitigation:** keep the map structural (folder roles + rules), not an exhaustive file listing; the rules change rarely. The new-feature recipe reinforces the pattern so additions conform rather than diverge.
- **[Risk: documenting an unenforced rule invites violation]** — stating "barrel-only" without lint backing.
  → **Mitigation:** Decision 3 — state the gap explicitly + flag the future lint change, so readers know it's convention-backed today.
- **[Trade-off: another root .md in an already doc-heavy repo]** — 10 → 11 root docs.
  → **Mitigation:** it fills a genuine gap (no structural doc exists) and matches the per-concern convention; cross-links prevent duplication.

## Open Questions

1. **Server boundary depth** — how much should ARCHITECTURE.md say about `src/lib/server/` (auth/db/supabase) vs deferring to the `drizzle-integration` / `user-auth` specs? _Current proposal: a short boundary statement (server-only, never client-imported) + links to those specs._
2. **Barrel lint rule** — file the future enforcement change now (as a follow-up stub) or just mention it in the doc? _Current proposal: mention in doc + design; don't create the stub here._
3. **Routes documentation** — enumerate the current routes (`events/[slug]`, `api/events`, `auth/callback`, `login`, `myprofile`, `sitemap.xml`, `robots.txt`) or just describe the composition pattern? _Current proposal: describe the pattern (routes are thin; they compose features via barrels + components); don't enumerate (drifts)._
