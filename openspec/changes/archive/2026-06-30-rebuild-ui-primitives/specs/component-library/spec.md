## MODIFIED Requirements

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

## ADDED Requirements

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
