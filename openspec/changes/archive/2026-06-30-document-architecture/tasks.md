## 1. Write `ARCHITECTURE.md`

- [x] 1.1 Create `ARCHITECTURE.md` at the repo root with the following sections (Decision 4 outline):
  - **Overview** — one paragraph: SvelteKit + feature-sliced `src/lib/`.
  - **The two axes** — horizontal (shared) vs vertical (features), with an ASCII map of `src/lib/` covering `components/` (primitives + ui), `features/<name>/`, `server/`, `supabase/`, `assets/`, `utils.ts`.
  - **src/lib/components/** — brief: primitives (hand-rolled, canonical 6-axis contract) vs ui (shadcn/bits-ui). Point to `component-library` spec + AGENTS.md "Component folders (primitives vs ui)" section for the full contract.
  - **src/lib/features/** — the slice anatomy (`components/` + `services/` + `types.ts` + `index.ts` barrel); the rule that the barrel is the ONLY legal import surface for external consumers; the `events` capability as the concrete exemplar.
  - **Dependency rules** — direction table: features → components ✓; routes → features (barrel) + components ✓; components → features ✗ FORBIDDEN; feature → other feature ✗ FORBIDDEN; `server/` → client ✗ FORBIDDEN. State that **feature-vocabulary imports are enforced by eslint (`no-restricted-imports`)**, but the **barrel-depth rule is enforced by convention (docstring) today**; a future change will add lint rules blocking `**/features/*/components/**` deep imports from outside the feature.
  - **src/lib/server/** — one short section: server-only boundary (auth/db/supabase), never imported by client (routes go through `+page.server.ts` load functions / `+server.ts` endpoints). Point to `drizzle-integration` + `user-auth` specs for the actual server capabilities.
  - **Routes** — how `src/routes/` composes: routes are thin, they compose features (via barrels) + components; no domain logic in the route itself.
  - **Adding a feature** — step-by-step recipe: mkdir `src/lib/features/<name>/{components,services}`; create `types.ts` (the Event-like domain types for this feature); create `index.ts` barrel exporting only the public surface; consume `$lib/components/` primitives/ui for shared UI inside feature components; avoid cross-feature and reverse imports; add a capability spec under `openspec/specs/<name>/spec.md`.
  - **See also** — DESIGN.md, PRODUCT.md, CONTRIBUTING.md, AGENTS.md; `openspec/specs/{component-library,events}/spec.md`; the `architecture` capability spec (this change's delta).
- [x] 1.2 Format + lint the new doc: `pnpm exec prettier --write ARCHITECTURE.md` + `pnpm exec eslint ARCHITECTURE.md`.
- [x] 1.3 Add a note inside the file (and to the tasks.md completion note) that barrel enforcement via lint is a future change, not done here.

## 2. Update `AGENTS.md` pointers

- [x] 2.1 Find the "Component folders (primitives vs ui)" section and append: _"See ARCHITECTURE.md for the full layering, dependency rules, and new-feature recipe."_
- [x] 2.2 Find any feature-barrel mention (currently embedded in the events-barrel docstring discussion) and add a pointer: _"See ARCHITECTURE.md for the barrel-only import contract + enforcement status."_
- [x] 2.3 Format + lint: `pnpm exec prettier --write AGENTS.md` + `pnpm exec eslint AGENTS.md`.
- [x] 2.4 Verify the pointers make AGENTS.md a _reference entry_ to architecture, not a duplicate — no architectural map text lives in AGENTS.md, only the "see ARCHITECTURE.md" line.

## 3. Update `README.md` pointer

- [x] 3.1 Find a suitable location (a "Project structure" section or a "Developer docs" list), and add a one-line link: _"Architecture — how `src/lib/` is organized (components vs features vs server)"_.
- [x] 3.2 Format + lint: `pnpm exec prettier --write README.md` + `pnpm exec eslint README.md`.

## 4. Verify

- [x] 4.1 Run `pnpm lint` scoped to the 3 touched files → clean.
- [x] 4.2 Skim the new ARCHITECTURE.md — confirm it does NOT duplicate the DESIGN.md visual content, the PRODUCT.md who/why, or the events spec's concrete slice, only generalizes the pattern.
- [x] 4.3 Run `rtk openspec status --change "document-architecture"` → all tasks complete. (The `architecture` capability spec delta is archived into `openspec/specs/architecture/spec.md` post-apply via `/opsx-archive`; that flow is separate.)
