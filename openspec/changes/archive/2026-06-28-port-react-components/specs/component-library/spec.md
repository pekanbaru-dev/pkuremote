## ADDED Requirements

### Requirement: Component library lives under `src/lib/components/ui/`

The project SHALL organize all reusable UI components under `src/lib/components/ui/<name>/`. Each component folder SHALL contain at minimum a `<name>.svelte` file and an `index.ts` re-export. A top-level `src/lib/components/ui/index.ts` barrel SHALL re-export the public component surface so consumers can `import { Button, StatCard } from '$lib/components/ui'`. Components SHALL be importable from `$lib/components/ui/<name>` (folder) or `$lib/components/ui` (barrel).

#### Scenario: New component lives at the canonical path

- **WHEN** a new component is added to the library
- **THEN** its source is `src/lib/components/ui/<name>/<name>.svelte` and its `index.ts` re-exports the default component, its `Props` type, and any named subcomponents.

#### Scenario: Consumer imports from the barrel

- **WHEN** a route or page imports from `$lib/components/ui`
- **THEN** SvelteKit resolves the barrel and tree-shakes unused exports so only the imported components are bundled.

### Requirement: Variants are authored with `tailwind-variants`

Every component with a variant prop surface SHALL define its variants with a `tv({ base, variants, compoundVariants, defaultVariants })` call. The TV config SHALL live in a `<script lang="ts" module>` block at the top of the `<name>.svelte` file, with the resulting variant function exported as a named const (`<name>Variants`). The component SHALL type its variant props with `VariantProps<typeof <name>Variants>` and SHALL NOT use `class-variance-authority`, custom variant objects, or hand-rolled conditional class strings for variant logic.

#### Scenario: A reader finds the variant config in one place

- **WHEN** a reader opens a component file to learn its variants
- **THEN** the first `<script module>` block in the file contains the entire `tv({...})` call, and the variant keys map 1:1 to the component's exported type.

#### Scenario: A composite reuses a primitive's variant base

- **WHEN** a composite component (e.g., `route-card`) needs to reuse a primitive's variant base (e.g., `cardVariants`)
- **THEN** it uses `tv({ extend: cardVariants, ... })`, with the extend depth limited to one level (no `extend` of `extend`).

### Requirement: Components are rebrand to brand tokens

Components SHALL use the existing OKLCH brand tokens defined in `src/routes/layout.css` (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-primary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-hairline`, plus shadcn-mapped names like `--color-background`, `--color-foreground`, `--color-border`, `--color-destructive`, `--color-ring`). Components SHALL NOT introduce new shade-scale tokens (`primary-50..900`, `success-*`, `danger-*`, `gray-*`) into `@theme` and SHALL NOT use raw Tailwind palette utilities (`bg-emerald-500`, `text-red-600`, `text-gray-900`) in their TV configs.

#### Scenario: A reader audits a component for token compliance

- **WHEN** a component is reviewed for brand consistency
- **THEN** every color class in the TV config is either a Tailwind utility that maps to an `@theme` token (e.g., `bg-primary`, `text-ink`, `border-hairline`, `text-destructive`) or a kept-as-is non-color utility (e.g., spacing, radius, typography utilities, transition utilities).

#### Scenario: No new shade-scale tokens leak into the theme

- **WHEN** the project is audited for `@theme` token growth after this change
- **THEN** the `@theme` block in `src/routes/layout.css` contains the same OKLCH tokens it contained before this change, plus any tokens added by separate, unrelated changes.

### Requirement: Success, warning, and info intents collapse to the brand accent

Intent-based variants in the React source (e.g., button `intent: success | warning | info`) SHALL be collapsed to the brand ochre accent in the Svelte target, per the Quiet Bulletin One Voice Rule. Only `destructive` retains a distinct visual treatment via the `--color-destructive` token.

#### Scenario: A success button uses the brand ochre

- **WHEN** a button with a "success" semantic is rendered
- **THEN** it uses `bg-primary` (ochre) and `text-primary-foreground`, indistinguishable from a "primary" intent button.

#### Scenario: A destructive button retains its distinct treatment

- **WHEN** a button with a "destructive" semantic is rendered
- **THEN** it uses `bg-destructive` and `text-destructive` (or the existing destructive styling from `button.svelte`), visually distinct from the primary ochre.

### Requirement: Icons come from `@lucide/svelte`

Components SHALL import icons from `@lucide/svelte` only. Imports from `lucide-react`, `lucide`, or any other icon library SHALL NOT be present in `src/lib/components/ui/`. Icon components SHALL receive a `class` prop to set their size, matching the existing `button.svelte` pattern (`[&_svg:not([class*='size-'])]:size-4`).

#### Scenario: An icon inside a button has a sane default size

- **WHEN** a button contains an icon and no explicit size class is passed
- **THEN** the icon renders at the button's default icon size (typically `size-4`) via the button's slot selector.

### Requirement: Headless behavior comes from `bits-ui`

Components that delegate behavior to a headless primitive (Dialog, Dropdown, Select, Tabs, Popover, etc.) SHALL use `bits-ui` for the underlying primitive. Imports from `@radix-ui/react-*` SHALL NOT be present. Where `bits-ui` does not have a feature-parity primitive (e.g., a custom autocomplete), the component SHALL be built from lower-level `bits-ui` primitives (Popover + Command) or flagged in `design.md` and deferred.

#### Scenario: Dialog uses bits-ui

- **WHEN** the `dialog` component is rendered
- **THEN** all subcomponents (`Dialog.Content`, `Dialog.Trigger`, `Dialog.Overlay`, etc.) wrap the corresponding `bits-ui` primitive, and focus trap, escape-to-close, scroll lock, and portal behavior work as documented by `bits-ui`.

#### Scenario: A primitive with no bits-ui equivalent is flagged

- **WHEN** a component being converted has no direct `bits-ui` equivalent (e.g., the React source's `autocomplete`)
- **THEN** the conversion is either built from lower-level `bits-ui` primitives or the component is explicitly deferred to a follow-up change with a note in the change's `design.md` Open Questions section.

### Requirement: Svelte 5 reactivity patterns only

Components SHALL use Svelte 5 runes: `$props()` for props, `$state` for local state, `$derived` for computed values, `$bindable()` for two-way-bound refs, `{@render children?.()}` for default slots, and named snippets (`{#snippet name(arg)}...{/snippet}`) for icon/content slots. Components SHALL NOT use legacy `export let` declarations, the `$:` reactive label syntax, `<slot />` elements, or `createEventDispatcher`. Components SHALL expose a `Props` type as a named `export type`.

#### Scenario: A component file contains no legacy syntax

- **WHEN** a component file is reviewed
- **THEN** it contains `$props()` in the second `<script>` block, no `export let`, no `$:` labels, no `<slot />`, and no `createEventDispatcher`.

#### Scenario: An icon slot uses the snippet form

- **WHEN** a component exposes an `icon` or `iconEnd` slot
- **THEN** the slot is rendered via `{@render icon?.()}` (or named equivalent) declared as a snippet property on the `$props()` destructure, not as a separate `<slot name="icon" />` element.

### Requirement: Compound components are split into per-subcomponent files

A component that exposes multiple subcomponents (e.g., `Dialog.Root`, `Dialog.Content`, `Dialog.Title`, `Dialog.Footer`) SHALL have each subcomponent in its own file: `<name>/<name>-<sub>.svelte`. The component folder's `index.ts` SHALL re-export them grouped under a single `<Name>` object literal so consumers can write `<Dialog.Content>`. Subcomponents that are not used standalone (e.g., a layout wrapper only meaningful inside the parent) MAY be co-located in the parent's `.svelte` file with a comment.

#### Scenario: Dialog is importable as both flat and grouped

- **WHEN** a consumer imports `Dialog`
- **THEN** `import { Dialog } from '$lib/components/ui/dialog'` provides `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Header`, `Dialog.Footer`, `Dialog.Title`, `Dialog.Description`, `Dialog.Overlay`, `Dialog.Close`, and `Dialog.Portal` as named members of the `Dialog` object.

### Requirement: Interactive components ship with Vitest tests

Components with non-trivial interactive behavior (focus traps, escape handling, click-outside dismissal, controlled/uncontrolled state, keyboard navigation) SHALL have a co-located `*.test.ts` file using `@vitest/browser-playwright` and `vitest-browser-svelte`. Pure presentational components (Card, Badge, Separator, Skeleton, AspectRatio) SHALL have a smoke render test only.

#### Scenario: Dialog's escape-to-close is tested

- **WHEN** a Dialog is open and the user presses Escape
- **THEN** the test asserts that `Dialog.Content` is no longer in the document and the open state is `false`.

#### Scenario: A presentational component has a smoke test

- **WHEN** `card.svelte` is rendered with a title prop
- **THEN** the test asserts the title text is present in the DOM and the snapshot matches the previous render.

### Requirement: The `tmp/components/` reference is deleted after conversion

After each phase's components land in `src/lib/components/ui/`, the corresponding directories under `tmp/components/` SHALL be deleted. After the final phase, the `tmp/components/` directory SHALL be empty and SHALL be removed. No React source from `tmp/components/` SHALL remain in the repo after this change is archived.

#### Scenario: Phase 1 cleanup

- **WHEN** phase 1 (button, badge, empty-state) lands
- **THEN** `tmp/components/button/`, `tmp/components/badge/`, and `tmp/components/empty-state/` are removed from the working tree.

#### Scenario: Final cleanup

- **WHEN** the final phase lands and `pnpm check && pnpm lint && pnpm test:unit -- --run && pnpm test:e2e` are green
- **THEN** `tmp/components/` is removed; `tmp/` itself is removed if no other content remains.

### Requirement: Conversion preserves the React source's public contract

For every component converted, the Svelte target SHALL expose the same logical props as the React source, modulo Svelte-idiomatic naming (e.g., `leftIcon` may become an `icon` snippet, `onClick` stays `onclick`). Any prop whose React name implies a JSX-style usage SHALL be re-expressed in the Svelte-idiomatic form. The conversion SHALL NOT remove a prop unless the underlying behavior is provably unused across the React source and the call sites in `src/routes/+page.svelte`.

#### Scenario: A composite's API matches the React source

- **WHEN** the `empty-state` component is converted
- **THEN** it exposes a `title` prop (string, required), a `description` prop (string, optional), an `icon` prop (Snippet or component, optional), and an `action` slot (or equivalent named snippet) for the CTA button.

### Requirement: Phase boundaries are reviewable

The conversion SHALL be split into three phases: phase 1 (pilot, 3 components), phase 2 (primitives, ~14 components), phase 3 (composites and utilities, ~20 components). Each phase SHALL land in one or more commits, SHALL leave `pnpm check && pnpm lint && pnpm test:unit -- --run` green, and SHALL be independently revertible. A phase SHALL NOT be merged if its cleanup of `tmp/components/<phase-dir>/` has not happened.

#### Scenario: Phase 1 commits as a unit

- **WHEN** phase 1 is complete
- **THEN** the working tree contains: a rebrand of `button.svelte` and `badge.svelte`, a new `empty-state/` folder, a top-level `src/lib/components/ui/index.ts` barrel, no `tmp/components/{button,badge,empty-state}/` directories, and a green `pnpm check && pnpm lint && pnpm test:unit -- --run`.

#### Scenario: Phase rollback

- **WHEN** a phase's commits are reverted
- **THEN** the project's `pnpm check && pnpm lint && pnpm test:unit -- --run` remain green, and the `tmp/components/<phase-dir>/` directories return (assuming the source was already deleted, the revert restores them from the previous commit).
