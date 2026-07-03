## Context

The SvelteKit app at `/Users/baimwong/Me/Program/BinaryDev/pkuremote` is a fresh init. The only UI primitives that exist today are the seven that ship with shadcn-svelte (`button`, `card`, `badge`, `separator`, `skeleton`, `aspect-ratio`, `navigation-menu`), all under `src/lib/components/ui/`. The landing page in `src/routes/+page.svelte` is built almost entirely from hand-rolled CSS classes (`container-page`, `measure-prose`, `label-meta`, `link-quiet`) declared in `src/routes/layout.css`. The shadcn `Button` is the only primitive that gets consumed on the page; the rest of the layout is bespoke.

Meanwhile, under `tmp/components/`, there is a 37-component React + shadcn/ui-style reference set the user built during the initial SvelteKit exploration. Each component has the shape `name.tsx` + `name.style.ts` (CVA) + `index.ts`, using `lucide-react` icons, `@radix-ui/react-*` for headless behavior, and a generic `bg-primary-500` / `text-gray-900` Tailwind palette. The whole `tmp/` tree is marked as sandbox and will be deleted once the conversion is done. None of the React components are imported by the Svelte app.

The user has already decided (in the explore-mode conversation preceding this change):

- Variants library: **`tailwind-variants` (TV)**, not CVA. TV is already a `package.json` dependency and is the convention used in the existing `button.svelte`.
- Folder scheme: **all components under `src/lib/components/ui/<name>/`**, including reusable composites. The "feature-based" organization the user mentioned is a future plan; right now everything is base/reusable.
- Style approach: **rebrand to existing brand tokens** (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-hairline`, etc.). No new shade-scale palette is introduced to `@theme`.
- Execution: **phased**. A 2-3-component pilot validates the pattern, then primitives, then composites.

## Goals / Non-Goals

**Goals:**

- Convert every React component in `tmp/components/` to a Svelte 5 component under `src/lib/components/ui/<name>/`, with TV variants and brand-token styling.
- Delete `tmp/components/` once the converted set is complete (intermediate deletions per phase are allowed but not required).
- Provide a per-folder `index.ts` re-export and a top-level `src/lib/components/ui/index.ts` barrel so consumers can import from a single root.
- Keep `pnpm check`, `pnpm lint`, and `pnpm test:unit` green at the end of every phase.
- Keep the `DESIGN.md` "Quiet Bulletin" rules intact: ochre accent usage bounded by the One Voice Rule, no new shade-scale tokens, no SaaS-gradient hero, no eyebrow text.

**Non-Goals:**

- Adding `class-variance-authority` or any other variants library. TV is the only one.
- Introducing a new shade-scale palette (`primary-50..900`, `success-*`, `danger-*`, `gray-*`) into `@theme`.
- Refactoring the landing page to use every new component. The landing page is only updated where an atomic equivalent exists and the call site is mechanical (e.g., swapping a hand-rolled `.label-meta` for `<Badge>`).
- Splitting components into a `composite/` subfolder. The user explicitly chose flat `ui/`.
- Building a `package.json` publishable design system. Components stay app-internal.
- Wiring interactive components to real backend state. Components are presentational; their state is local or props-driven.

## Decisions

### D1. Variants library: tailwind-variants (TV), not CVA

The React sources all use CVA (`class-variance-authority`). The Svelte target uses TV (`tailwind-variants`).

**Rationale**: TV is already a `package.json` dependency and is the convention used in the existing `src/lib/components/ui/button/button.svelte`. TV is a strict superset of CVA at the variants level (`base`, `variants`, `compoundVariants`, `defaultVariants`, `VariantProps<>` type) and adds `slots`, `extend`, responsive variants, and overridable defaults — features that will be needed by the composites (e.g., `route-card` extending `cardVariants`). Mixing CVA in `composite/` and TV in `ui/` would create a dual paradigm in a single component tree.

**Mapping per file** is mechanical:

- `cva("base", { variants, compoundVariants, defaultVariants })` → `tv({ base, variants, compoundVariants, defaultVariants })`
- `VariantProps<typeof button>` → `VariantProps<typeof buttonVariants>`

The button source in `tmp/components/button/button.style.ts` (172 lines, 7 variants, 19 compound variants) maps 1:1 to a TV config of the same shape.

**Alternatives considered**:

- _Use CVA throughout_: rejected — adds a dependency, diverges from existing shadcn-svelte pattern, no upside over TV.
- _Hybrid (CVA for composites, TV for primitives)_: rejected — cognitive overhead for every new contributor; same goal achievable with TV alone.

### D2. Folder scheme: flat under `src/lib/components/ui/`

**Rationale**: the user explicitly chose this scheme in the explore-mode conversation. Reusable composites (`stat-card`, `route-card`, `currency-display`, etc.) sit alongside primitives (`button`, `input`, `dialog`) under the same `ui/` root. A future "feature-based" reorg can move composites into `src/lib/features/<name>/components/` without touching their internals.

**Per-component folder shape**:

```
src/lib/components/ui/<name>/
├── <name>.svelte       ← component + (optionally) tv() config in <script module>
└── index.ts            ← re-exports Root as the default, plus types and named subcomponents
```

For compound components (Dialog, DropdownMenu, Tabs, Table, etc.), each subcomponent gets its own file:

```
src/lib/components/ui/dialog/
├── index.ts
├── dialog.svelte               ← re-export group; root only
├── dialog-content.svelte
├── dialog-header.svelte
├── dialog-footer.svelte
├── dialog-title.svelte
├── dialog-description.svelte
├── dialog-overlay.svelte
├── dialog-close.svelte
└── dialog-portal.svelte        ← only if needed
```

The reason: Svelte 5 has no first-class compound-component API (no `Dialog.Content = Dialog.something`), and splitting files keeps each `.svelte` small and individually importable. The `index.ts` re-exports a `Dialog` object literal grouping the subcomponents so consumers can write `<Dialog.Content>` ergonomically.

**Alternatives considered**:

- _Split `ui/` and `composite/`_: rejected per user choice. The threshold rule ("would this still be useful in a different vertical?") was deemed too soft to enforce consistently.
- _Flat `src/lib/components/` with no `ui/`_: rejected — breaks the existing shadcn-svelte convention and forces renames of the seven primitives.

### D3. Style rebrand: translate React class names to brand tokens

The React source uses a generic shadcn-style palette: `bg-primary-500`, `text-white`, `bg-success-50`, `text-danger-600`, `text-gray-900`, `ring-gray-300`. The Svelte project has a brand palette defined in `src/routes/layout.css` as OKLCH tokens (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-primary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-hairline`, plus shadcn-mapped names like `--color-background`, `--color-foreground`, `--color-border`, `--color-ring`).

**Translation rules** (applied per component, audited at PR time):

| React source class                                               | Svelte target token                                        | Notes                                                         |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| `bg-primary-500`, `bg-primary-600` (filled intent)               | `bg-primary`                                               | Solid ochre; hover via `hover:bg-primary/90`                  |
| `text-white` on filled intent                                    | `text-primary-foreground`                                  |                                                               |
| `text-primary-500` (text-only intent)                            | `text-primary`                                             |                                                               |
| `bg-secondary-500`                                               | `bg-secondary`                                             | If `--color-secondary` exists; otherwise `bg-muted`           |
| `bg-danger-500`, `text-danger-500/600`, `bg-danger-50`           | `bg-destructive` / `text-destructive`                      | shadcn name already wired                                     |
| `bg-success-500`, `text-success-600`, `bg-success-50`            | `bg-primary` (semantic success → ochre per Quiet Bulletin) | One Voice Rule: ochre is the accent, including success state  |
| `bg-warning-500`, `text-warning-500`                             | `bg-primary` or `text-primary`                             | Same                                                          |
| `bg-info-500`, `text-info-500`                                   | `bg-muted` / `text-muted-foreground`                       |                                                               |
| `text-gray-900`, `text-gray-700` (primary text)                  | `text-ink`                                                 |                                                               |
| `text-gray-500`, `text-gray-400` (secondary text)                | `text-muted-foreground`                                    |                                                               |
| `text-gray-300` (icon muted)                                     | `text-muted-foreground`                                    |                                                               |
| `bg-white` (card surface)                                        | `bg-canvas`                                                |                                                               |
| `bg-gray-50`, `bg-gray-100` (subtle fill)                        | `bg-muted`                                                 |                                                               |
| `ring-gray-300`, `border-gray-200`                               | `border-hairline` / `ring-hairline`                        |                                                               |
| `border-gray-200` (subtle border)                                | `border-hairline`                                          |                                                               |
| `shadow-sm`, `shadow-md`, `shadow-lg`                            | kept (Tailwind built-in)                                   | No brand token for elevation; OKLCH-shadow via `@theme` later |
| `ring-[1px] ring-inset` (bordered)                               | `ring-1 ring-inset ring-primary`                           | Ochre ring on bordered variants                               |
| `rounded`/`rounded-sm`/`rounded-md`/`rounded-lg`/`rounded-full`  | kept                                                       |                                                               |
| `text-xs`/`text-sm`/`text-lg`/`text-xl`                          | kept                                                       |                                                               |
| `py-1 px-2`, `py-1.5 px-3`, etc. (size padding)                  | kept                                                       |                                                               |
| `transition-colors`, `transition-all`, `duration-200`            | kept                                                       |                                                               |
| `active:scale-95` (button press feedback)                        | `active:translate-y-px`                                    | Matches existing button.svelte pattern                        |
| `data-[state=open]:animate-in`, `data-[state=closed]:fade-out-0` | dropped                                                    | Animations deferred — static states only in this change       |

**Why a translation table rather than auto-mapping**: an LLM-friendly table keeps the visual decision auditable. A reviewer can scan a TV config and verify each class either matches a token or is a kept-as-is Tailwind utility. The success/warning/info intents collapse to the brand ochre on purpose — the Quiet Bulletin spec defines one accent.

**Alternatives considered**:

- _Inject a full shade-scale palette into `@theme`_: rejected per user choice. Adds tokens that nobody will use outside the React reference set.
- _Use raw Tailwind colors (`emerald-500`, `red-500`)_: rejected — out of band with `@theme`, breaks the design system ban list in `DESIGN.md`.
- _Keep success/warning/info as distinct colors_: rejected — violates the One Voice Rule.

### D4. Icon migration: `@lucide/svelte`

`tmp/components/*` import from `lucide-react`. The Svelte project has `@lucide/svelte` installed. Each `import { X } from "lucide-react"` becomes `import { X } from "@lucide/svelte"`. Same icon names, same prop API (`class="..."` / `size="..."`).

### D5. Headless behavior: `bits-ui`

`tmp/components/dialog`, `dropdown`, `dropdown-menu`, `select`, `autocomplete`, `radio-group`, `tabs`, `menubar`, `popover` (where present) use `@radix-ui/react-*`. The Svelte project's equivalent is `bits-ui`, already in `package.json` and already used by the existing `separator.svelte` (which imports `Separator as SeparatorPrimitive } from "bits-ui"`).

Each Radix import maps to a `bits-ui` import. Where the API differs (e.g., `DialogPrimitive.Trigger` vs `Dialog.Trigger`, `React.forwardRef` vs Svelte 5 `bind:this` + `ref={$bindable(null)}`), the existing `button.svelte` and `separator.svelte` are the templates. The `context7` MCP server is the source of truth for `bits-ui` API details when a component needs them.

### D6. Variants authoring: same file as the component

The existing `button.svelte` defines `buttonVariants` inside a `<script lang="ts" module>` block at the top of the file. New components follow the same pattern, with the TV config co-located with the Svelte template. The `.style.ts` files from the React source are **not** preserved as separate files — TV's `tv({...})` call sits inside the `<script module>` block.

**Rationale**: co-locating the variant config with the template keeps each component's contract in one file. It matches the existing project convention (`button.svelte` line 1-42). It avoids the indirection of an import from `<name>.style.ts` to `<name>.svelte` and back.

**Exception**: if a composite's TV config is large enough to be unreadable in a `<script module>` (e.g., `tabs` with 4-5 subcomponents, each with their own variant sets), the config can be split into `<name>.variants.ts` next to the `.svelte` file. This is the only situation where a separate variants file is allowed.

### D7. Props and typing

Every component exposes a `Props` type as `export type`, matching the existing `ButtonProps` convention:

```ts
export type <Name>Props = ...;
```

Props are spread with Svelte 5's `$props()` rune. Component-internal state uses `$state`. Computed values use `$derived`. Bindable refs use `$bindable(null)` and `bind:this={ref}`. Slots (children) use the `{@render children?.()}` snippet form, not the legacy `<slot />` element. Icon and trailing-content slots that the React source expresses as separate props (`leftIcon`, `rightIcon`) become named snippets: `icon`, `iconEnd`, `title`, `description`, etc.

### D8. Tests

Every component with interactive behavior (focus traps, escape-to-close, click-outside, keyboard nav, controlled/uncontrolled state) gets a Vitest component test using `@vitest/browser-playwright` and `vitest-browser-svelte`. Pure presentational components (Card, Badge, Separator, Skeleton, AspectRatio) get a smoke render test only.

Test files: `src/lib/components/ui/<name>/<name>.test.ts` co-located with the source.

### D9. Phasing

The 37 components are split into 3 phases to bound the blast radius of any pattern mistake:

- **Phase 1 (Pilot, 3 components)**: `button` (rebrand existing), `badge` (rebrand existing), `empty-state` (composite that consumes `button`). Validates the React→Svelte translation, TV config pattern, brand-token mapping, and folder/index.ts shape.
- **Phase 2 (Primitives, ~14 components)**: `input`, `textarea`, `select`, `autocomplete`, `file`, `radio`, `radio-group`, `dialog`, `drawer`, `dropdown-menu`, `menubar`, `table`, `tabs`, `breadcrumb`, `pagination`, `stepper`, `avatar`. Compounds (`dialog`, `dropdown-menu`, `tabs`, `table`, `menubar`) are split into subcomponent files per D2.
- **Phase 3 (Composites + utilities, ~18 components)**: `stat-card`, `route-card`, `panel-card`, `panel-context`, `status-badge`, `currency-display`, `currency-input`, `currency-select`, `datepicker`, `map`, `text-editor`, `user-menu`, `actions-dropdown`, `search-toolbar`, `display-with-skeleton`, `loading-overlay`, `loading-spinner`, `content-loading`, `content-title`, `map`. Many of these are large; the phase is split into 3a (small composites), 3b (high-effort: datepicker, map, text-editor), 3c (loading utilities).

After each phase: `tmp/components/<phase-dir>/` is deleted. After phase 3: `tmp/` itself is deleted if empty.

## Risks / Trade-offs

- **Risk**: The translation table in D3 is a manual judgment call per class. Two translators (an LLM and a human reviewer) may produce different rebadged outputs for the same React source. → **Mitigation**: the table is the source of truth; a checklist is added to the PR template; the landing-page call sites are the visual baseline for the rebrand (they already use brand tokens).
- **Risk**: The success/warning/info intents collapsing to ochre changes the semantic of those states. A "danger" button is no longer red — it's ochre with destructive text. → **Mitigation**: destructive still uses `--color-destructive` (already wired in `@theme`). Success/warning/info use ochre, which the Quiet Bulletin design defines as the single accent. The landing page and any other consumer must accept this constraint.
- **Risk**: 37 components is a lot for a single change archive. Review fatigue is real. → **Mitigation**: phasing per D9. Each phase lands in its own commit and is reviewable independently. The `tasks.md` enumerates every component as a separate task so progress is trackable.
- **Risk**: TV's `extend` (used in some composites) creates implicit coupling. A change to `cardVariants` could break `route-card` that `extend`s it. → **Mitigation**: `extend` is allowed only at one level of depth, and only with explicit comment in the consumer file. No `extend` of `extend`.
- **Risk**: `bits-ui` API drift — the `bits-ui` version in `package.json` (2.18.1) may not have feature parity with `@radix-ui/react-*` for every primitive (e.g., `autocomplete` is not a Radix primitive; the React source builds it from `cmdk` or similar). → **Mitigation**: a spike task in phase 2 lists every component that has no direct `bits-ui` equivalent and decides case-by-case (build bespoke with `popover` + list, or use `melt-ui`/`@melt-ui/svelte` if `bits-ui` lacks it, or skip for this change and document).
- **Risk**: Existing call sites in `src/routes/+page.svelte` may break when a new component is consumed. → **Mitigation**: each phase ends with a full `pnpm check && pnpm lint && pnpm test:unit` pass and a manual page load at `http://localhost:5173`. Visual regression is checked against the current landing page; a `pnpm test:e2e` screenshot test is added if any landing-page section is rewritten.
- **Risk**: The new top-level `src/lib/components/ui/index.ts` barrel bloats bundle size if every component is eagerly imported. → **Mitigation**: the barrel re-exports only types and the named component imports; Svelte/Vite tree-shakes unused components. Confirmed at phase 2 by inspecting the production build output.
- **Trade-off**: The `tmp/components/*` React sources are lost as reference once deleted. → **Mitigation**: each phase's commit message includes the source file path that was converted, and a `MIGRATION.md` (or this design's `Migration Plan` section) records the React→Svelte mapping for the most ambiguous conversions.

## Migration Plan

1. **Phase 1 (Pilot)** — `button` + `badge` + `empty-state`
   - Convert three components to Svelte 5 + TV + brand tokens.
   - Add per-folder `index.ts` and a top-level `src/lib/components/ui/index.ts` barrel.
   - Run `pnpm check && pnpm lint && pnpm test:unit -- --run`. Page must render.
   - Delete `tmp/components/button/`, `tmp/components/badge/`, `tmp/components/empty-state/`.
   - **Rollback**: revert the phase commit. The pilot only rebrand touches the existing `button.svelte`; rollback is one `git revert`.

2. **Phase 2 (Primitives)** — 14 components
   - Per component: write `<name>.svelte`, write `index.ts`, write `<name>.test.ts` (interactive ones only), import into the top-level barrel, run `pnpm check && pnpm lint && pnpm test:unit -- --run`.
   - Compounds (`dialog`, `dropdown-menu`, `tabs`, `table`, `menubar`) are split per D2.
   - Update landing page to consume any atomic equivalents (e.g., `Badge` for `.label-meta`, `Separator` for `border-t border-hairline`).
   - Delete `tmp/components/<each phase-2 dir>/` after each component lands.
   - **Rollback**: per-component revert; the new primitives are not yet referenced by any other component, so revert is one file at a time.

3. **Phase 3 (Composites + utilities)** — ~20 components
   - Per component: same flow as phase 2, with TV `extend` allowed for the ones that reuse a primitive base.
   - High-effort items (`datepicker`, `map`, `text-editor`) are deferred to a follow-up change if they exceed a half-day of work; this change ships the rest.
   - Update landing page to consume any equivalents.
   - Delete `tmp/components/<each phase-3 dir>/` and, if empty, `tmp/`.
   - **Rollback**: same as phase 2.

4. **Final**
   - `pnpm check && pnpm lint && pnpm test:unit -- --run && pnpm test:e2e` all green.
   - `tmp/` directory removed from the working tree.
   - Landing page is visually unchanged from its current state (or improved by using `Badge`/`Separator`/`Card`).
   - OpenSpec change is archived; the `component-library` spec becomes canonical under `openspec/specs/component-library/spec.md`.

## Open Questions

- **bits-ui feature parity**: which of `autocomplete`, `datepicker`, `map`, `text-editor` have no `bits-ui` equivalent and need a custom build or external dep? Resolved at the start of phase 2 by a spike.
- **Should the top-level barrel `src/lib/components/ui/index.ts` exist**? It makes ergonomic imports (`import { Button, Card, StatCard } from '$lib/components/ui'`) but bloats the type surface. Decision deferred to phase 2 once the full set of components is in.
- **Should `PanelContext` be a real context provider** (Svelte 5 `setContext`/`getContext`) or a layout component with named slots? React source uses the latter pattern. Resolved at conversion time.
- **Test framework for interactive components**: `vitest-browser-playwright` is installed; is it the right tool for focus-trap/escape-key tests, or is Playwright component testing (separate `@playwright/experimental-ct`) needed? Resolved at the first interactive test write.
