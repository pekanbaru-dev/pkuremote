# component-library Specification

## Purpose

TBD - created by archiving change port-react-components. Update Purpose after archive.

## Requirements

### Requirement: Component library lives under `src/lib/components/ui/`

The project SHALL organize reusable UI components across two folders by complexity. **Simple, hand-rolled primitives** (`button`, `input`, `radio`, `radio-group`, `avatar`, `badge`, `checkbox`, and future components that do not require headless behavior) SHALL live under `src/lib/components/primitives/<name>/`. **Headless/complex components** that delegate to `bits-ui` (dropdown, dialog, navigation-menu, sheet, select, tabs, popover, etc.) SHALL live under `src/lib/components/ui/<name>/` and are managed by shadcn-svelte (`components.json` aliases shadcn to `$lib/components/ui`).

Each component folder SHALL contain at minimum a `<name>.svelte` file and an `index.ts` re-export. A top-level barrel SHALL re-export the public surface of each folder: `src/lib/components/primitives/index.ts` for primitives, `src/lib/components/ui/index.ts` for shadcn components. Consumers SHALL import primitives from `$lib/components/primitives` (barrel) or `$lib/components/primitives/<name>` (folder), and shadcn components from `$lib/components/ui` or `$lib/components/ui/<name>`.

#### Scenario: A simple primitive lives at the primitives path

- **WHEN** a new hand-rolled primitive (e.g., `checkbox`) is added to the library
- **THEN** its source is `src/lib/components/primitives/checkbox/checkbox.svelte` and its `index.ts` re-exports the component, its `Props` type, and any named subcomponents.

#### Scenario: A shadcn component lives at the ui path

- **WHEN** a headless/complex component (e.g., `dropdown`) is added via shadcn-svelte
- **THEN** its source is `src/lib/components/ui/dropdown/` and it is registered in `src/lib/components/ui/index.ts`.

#### Scenario: Consumer imports a primitive from the barrel

- **WHEN** a route or page imports from `$lib/components/primitives`
- **THEN** SvelteKit resolves the barrel and tree-shakes unused exports so only the imported primitives are bundled.

#### Scenario: Consumer imports a shadcn component from the barrel

- **WHEN** a route or page imports from `$lib/components/ui`
- **THEN** SvelteKit resolves the barrel and tree-shakes unused exports so only the imported shadcn components are bundled.

### Requirement: Variants are authored with `tailwind-variants`

Every component with a variant prop surface SHALL define its variants with a `tv({ base, variants, compoundVariants, defaultVariants })` call. The TV config SHALL live in a co-located `<name>.style.ts` file (preferred) OR in a `<script lang="ts" module>` block at the top of the `<name>.svelte` file. The resulting variant function SHALL be exported as a named const (`<name>Variants`) from the `.style.ts` (or the `<script module>`), and the `<name>.svelte` file SHALL import it. The component SHALL type its variant props with `VariantProps<typeof <name>Variants>` and SHALL NOT use `class-variance-authority` (not installed; SHALL NOT be added), custom variant objects, or hand-rolled conditional class strings for variant logic. The `cn` helper from `$lib/utils.js` SHALL compose the variant output with the consumer's `class` prop at the call site: `class={cn(buttonVariants({ intent, size, ... }), className)}`.

#### Scenario: A reader finds the variant config in the style file

- **WHEN** a reader opens a component folder to learn its variants
- **THEN** `<name>.style.ts` contains the entire `tv({...})` call and the exported `VariantProps`-derived types, and the variant keys map 1:1 to the component's exported prop types.

#### Scenario: The svelte file imports the variant function

- **WHEN** a reader opens `<name>.svelte`
- **THEN** its `<script module>` block re-exports the variant function and types from `<name>.style.ts`, and the markup calls `cn(<name>Variants({...}), className)`.

#### Scenario: A composite reuses a primitive's variant base

- **WHEN** a composite component (e.g., `route-card`) needs to reuse a primitive's variant base (e.g., `cardVariants`)
- **THEN** it uses `tv({ extend: cardVariants, ... })`, with the extend depth limited to one level (no `extend` of `extend`).

### Requirement: Components are rebrand to brand tokens

Components SHALL use the existing OKLCH brand tokens defined in `src/routes/layout.css` (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-primary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-hairline`, plus shadcn-mapped names like `--color-background`, `--color-foreground`, `--color-border`, `--color-destructive`, `--color-ring`). Components SHALL ALSO use the status-color tokens defined in `@theme` for functional status feedback: `--color-danger`, `--color-success`, `--color-warning`, `--color-info`, plus their `on-*`, `*-container`, and `on-*-container` role companions. These four status-color families SHALL follow the Material-3 role pattern (exactly 4 tokens per family: base, on-base, container, on-container) and SHALL be expressed in OKLCH. Components SHALL NOT introduce 50–900 shade-scale tokens (`primary-50..900`, `success-50..900`, `danger-50..900`, `gray-50..900`) into `@theme`. Raw Tailwind palette utilities (`bg-emerald-500`, `text-red-600`, `text-gray-900`) SHALL NOT be used in TV configs.

#### Scenario: A reader audits a component for token compliance

- **WHEN** a component is reviewed for brand consistency
- **THEN** every color class in the TV config is either a Tailwind utility that maps to an `@theme` token (e.g., `bg-primary`, `text-ink`, `border-hairline`, `text-destructive`, `bg-success`, `text-on-danger-container`) or a kept-as-is non-color utility (e.g., spacing, radius, typography, transition utilities).

#### Scenario: Status-color families follow the M3 role pattern

- **WHEN** the `@theme` block is audited for the four status-color families
- **THEN** each of `danger`, `success`, `warning`, `info` has exactly 4 tokens: `--color-<family>`, `--color-on-<family>`, `--color-<family>-container`, `--color-on-<family>-container`, all expressed in OKLCH.

#### Scenario: No 50–900 ramp tokens leak into the theme

- **WHEN** the project is audited for `@theme` token growth after this change
- **THEN** no token matching the pattern `--color-<family>-<number>` (e.g., `--color-primary-500`, `--color-success-100`, `--color-danger-900`) exists in `src/routes/layout.css`.

#### Scenario: Status colors are scoped to functional feedback

- **WHEN** a component uses a status color (`bg-danger`, `bg-success`, `bg-warning`, `bg-info`) in its TV config or inline class list
- **THEN** the component's purpose is functional status feedback (form validation, action outcomes, alerts, toasts), not decorative accent.

#### Scenario: Danger and destructive alias share the same literal

- **WHEN** the `@theme` block is audited for the `danger` and `destructive` tokens
- **THEN** `--color-danger` and `--color-destructive` carry the same literal OKLCH value (literal duplication, no `var()` reference), and `--color-on-danger` and `--color-destructive-foreground` also share the same literal.

### Requirement: Success, warning, and info intents collapse to the brand accent

The One Voice Rule (DESIGN.md) preserves ochre as the sole decorative accent. Functional status feedback colors (`danger`, `success`, `warning`, `info`) are an explicit, scoped exception: components that convey status (form validation, action outcomes, alerts, toasts) SHALL retain distinct visual treatments using the corresponding `@theme` status-color tokens. Decorative use of status colors (e.g., as accent fills on landing-page hero sections, non-functional splashes of color) remains governed by the One Voice Rule and SHALL collapse to the brand ochre (`bg-primary`).

#### Scenario: A success button uses the success color

- **WHEN** a button with a "success" semantic is rendered (e.g., a "Save" confirmation)
- **THEN** it uses `bg-success` and `text-on-success`, visually distinct from a "primary" intent button.

#### Scenario: A destructive button retains its distinct treatment

- **WHEN** a button with a "destructive" semantic is rendered
- **THEN** it uses `bg-danger` (or the alias `bg-destructive`) and `text-on-danger` (or `text-destructive-foreground`), visually distinct from the primary ochre.

#### Scenario: A decorative accent collapses to ochre

- **WHEN** a status color is used as a decorative accent (e.g., a hero-section fill, a non-functional splash of green or blue)
- **THEN** the One Voice Rule applies and the accent SHALL use `bg-primary` (ochre), not `bg-success` or any other status color.

#### Scenario: Status feedback on a form input uses the status token

- **WHEN** an input is rendered with `aria-invalid="true"` (functional error feedback)
- **THEN** the input's border and ring use `border-danger` / `ring-danger`, not the brand ochre.

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

### Requirement: DatePicker component is part of the component library

The component library SHALL include a `DatePicker` component at `src/lib/components/ui/datepicker/`, registered in the top-level barrel (`src/lib/components/ui/index.ts`) and exposing a `DatePicker` named export, a `DatePickerProps` type, and a `datePickerVariants` `tv({...})` config. The component SHALL be usable in single-date mode, accept `DateValue` from `@internationalized/date`, and SHALL NOT introduce any new third-party dependency (it builds on `bits-ui` `DatePicker` + `Calendar` which are already in `package.json`).

#### Scenario: DatePicker is importable from the barrel

- **WHEN** a route imports `DatePicker` from `$lib/components/ui`
- **THEN** the import resolves and the component is bundled in the route's chunk.

#### Scenario: DatePicker is brand-token compliant

- **WHEN** the `DatePicker` is reviewed for brand consistency
- **THEN** every color class in its TV config and inline class lists maps to an `@theme` token (e.g., `bg-canvas`, `text-ink`, `border-hairline`, `text-destructive`); no raw Tailwind palette utilities (e.g., `bg-blue-500`) are used.

### Requirement: Primitives follow the canonical 6-axis variant contract

Hand-rolled primitives in `src/lib/components/primitives/` SHALL share a canonical variant vocabulary of up to 6 axes: `intent` (`primary` | `secondary` | `danger` | `success` | `warning` | `info` | `clean`), `variant` (`solid` | `outline` | `text`), `size` (`xs` | `sm` | `md` | `lg` | `xl`), `uppercase` (boolean), `rounded` (`none` | `tiny` | `small` | `medium` | `large` | `full`), and `fullWidth` (boolean). Each component SHALL adopt only the axes meaningful to its domain (e.g., `input` drops `variant`/`fullWidth`/`uppercase`; `radio-group` adds `position`) plus additive component-specific extensions. `button` is the reference implementation exposing all 6 axes. The `variant` axis (`solid` | `outline` | `text`) SHALL replace the legacy `bordered` and `textOnly` boolean axes and SHALL map to the Material-3 role pattern: `solid` → `bg-X` + `text-on-X`; `outline` → `border-X` + `text-X` + transparent bg; `text` → `text-X`. The `size` axis SHALL use the `xs`/`sm`/`md`/`lg`/`xl` naming (aligned with shadcn-svelte/Tailwind convention) — NOT `tiny`/`small`/`medium`/`large`/`giant`.

#### Scenario: Button exposes all six canonical axes

- **WHEN** the `button` primitive is authored
- **THEN** its `tv()` config defines `intent`, `variant`, `size`, `uppercase`, `rounded`, and `fullWidth` variant keys with the canonical value sets above.

#### Scenario: A component omits non-meaningful axes

- **WHEN** the `input` primitive is authored
- **THEN** its `tv()` config defines `intent`, `size`, and `rounded` but omits `variant`, `uppercase`, and `fullWidth` (not meaningful for a text field), and adds `hasError`/`hasLeftIcon`/`hasRightIcon` extensions.

#### Scenario: The variant axis maps to M3 roles

- **WHEN** a button is rendered with `intent="primary"` and `variant="outline"`
- **THEN** its classes include `border-primary text-primary` and a transparent background, per the M3 border-only role.

### Requirement: `disabled` is a native attribute, not a variant

Primitives SHALL treat `disabled` as a native HTML attribute, not a `tv()` variant. Disabled styling SHALL live in the `base` string as Tailwind `disabled:` pseudo-classes (e.g., `disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed`). The component SHALL pass `disabled` straight to the underlying element (`<button {disabled}>`, `<input {disabled}>`). The `tv()` config SHALL NOT define a `disabled` variant. When a component has a `loading` state, `loading` SHALL force `disabled: disabled || loading` on the element and set `aria-busy="true"`.

#### Scenario: A disabled button uses native disabled styling

- **WHEN** a button is rendered with `disabled={true}`
- **THEN** the `<button>` element carries the native `disabled` attribute, the `tv()` config has no `disabled` variant, and the visual disabled state comes from `disabled:` pseudo-classes in the `base` string.

#### Scenario: Loading forces disabled and aria-busy

- **WHEN** a button is rendered with `loading={true}`
- **THEN** the `<button>` element has `disabled` set, `aria-busy="true"`, and renders the loading spinner instead of the icon/children snippets.

### Requirement: Primitives ship an accessibility baseline

Every primitive in `src/lib/components/primitives/` SHALL ship a minimum accessibility surface. `button` SHALL set `type="button"` by default, expose `aria-busy` while loading, and when rendering a disabled link (`href` + `disabled`) SHALL set `aria-disabled`, `role="link"`, `tabindex={-1}`, and omit the `href`; the `base` string SHALL include `focus-visible:ring-2 focus-visible:ring-ring`. `input` SHALL set `aria-invalid` when `hasError`, associate its `<label>` via `for`/`id`, and wire `aria-describedby` to the error/hint element. `radio-group` SHALL use `<fieldset>`/`<legend>`, set `role="radiogroup"` on the list, support arrow-key navigation, and set `aria-checked` on each radio. `checkbox` SHALL set `role="checkbox"`, reflect `aria-checked` (`true`/`false`/`"mixed"` for indeterminate), associate its label, and toggle on Space. `avatar` SHALL set a meaningful `alt` on the `<img>` (derived from `name`) and `role="img"` on the fallback. `badge` SHALL set `aria-hidden` when decorative.

#### Scenario: A disabled link is not focusable

- **WHEN** a button is rendered with `href` and `disabled={true}`
- **THEN** the rendered `<a>` has `aria-disabled="true"`, `role="link"`, `tabindex={-1}`, and no `href` attribute.

#### Scenario: An invalid input exposes its error to assistive tech

- **WHEN** an input is rendered with `hasError={true}` and an error message
- **THEN** the `<input>` has `aria-invalid="true"`, an `id`, and `aria-describedby` referencing the error element's `id`, and the `<label>` has `for` matching the input `id`.

#### Scenario: A radio group supports keyboard navigation

- **WHEN** focus is on a radio inside a radio-group and the user presses ArrowDown
- **THEN** focus moves to the next radio (wrapping at the end), and the newly-focused radio's `aria-checked` reflects the selection.

### Requirement: Primitives preserve functional features idiomatically

Primitives SHALL preserve the functional (non-variant) features of their `temp/components/` React source, re-expressed in Svelte 5 idioms. `button` SHALL support `loading` (boolean; renders a `@lucide/svelte` spinner and forces `disabled`), `href` (renders `<a>` instead of `<button>` when set), and `leftIcon`/`rightIcon` as Svelte 5 snippets rendered via `{@render leftIcon?.()}`. `input` SHALL support `hasLeftIcon`/`hasRightIcon` as snippets positioned absolutely. Icon imports SHALL come from `@lucide/svelte` only.

#### Scenario: A button renders an anchor when href is set

- **WHEN** a button is rendered with `href="/login"`
- **THEN** the rendered element is `<a href="/login">` (not `<button>`), styled by the same `buttonVariants` call.

#### Scenario: A button renders a left-icon snippet

- **WHEN** a button is rendered with a `leftIcon` snippet
- **THEN** the snippet renders before the children via `{@render leftIcon?.()}`, and the icon is a `@lucide/svelte` component.

### Requirement: Primitive file structure is split into style and markup

Each primitive folder under `src/lib/components/primitives/<name>/` SHALL contain `<name>.svelte` (markup + `$props()` + `<script module>` re-exports), `<name>.style.ts` (the `tv()` config + `VariantProps`-derived type exports), and `index.ts` (re-exports the component, its types, and the variant function). A top-level `src/lib/components/primitives/index.ts` barrel SHALL re-export all primitives.

#### Scenario: A primitive folder has the three files

- **WHEN** the `button` primitive is added
- **THEN** `src/lib/components/primitives/button/` contains `button.svelte`, `button.style.ts`, and `index.ts`, and `src/lib/components/primitives/index.ts` exports `Button`, `buttonVariants`, and `ButtonProps`.

#### Scenario: The barrel re-exports all primitives

- **WHEN** a consumer imports from `$lib/components/primitives`
- **THEN** `Button`, `Input`, `Radio`, `RadioGroup`, `Avatar`, `Badge`, and `Checkbox` are all resolvable named exports.
