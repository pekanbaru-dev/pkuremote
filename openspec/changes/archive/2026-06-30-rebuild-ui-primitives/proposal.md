## Why

The reusable component layer needs rebuilding. `src/lib/components/ui/` was scaffolded empty, and the React reference in `temp/components/` predates the project's Material-3 token system — it uses a hex/shade-scale vocabulary (`bg-primary-500`, `focus:bg-primary-50`) that no longer exists in `@theme`, and carries three structural problems: it builds variants with `class-variance-authority` (not installed; `tailwind-variants` is), treats `disabled` as a style _variant_ rather than a native HTML attribute, and ships zero accessibility. The `extend-color-intents` change already laid the M3 status-color token families (`danger`/`success`/`warning`/`info` + `on-*`/`*-container`/`on-*-container`) and explicitly deferred the component-API restructuring to this follow-up (its design.md line 23: "Adopting the temp button's `intent + bordered + textOnly` axis-terpisah API — that's a button-structure change, not a color change"; Open Question 3 defers the `clean` intent). This change rebuilds the _simple_ primitives as hand-rolled Svelte 5 components in a new `primitives/` folder, leaving `ui/` for shadcn-svelte components that need `bits-ui` plumbing (dropdown, dialog, navigation-menu, …).

## What Changes

- New home `src/lib/components/primitives/` for hand-rolled simple components; `src/lib/components/ui/` stays the shadcn-svelte folder. `AGENTS.md` updated to document the split (shadcn for complex/headless, hand-rolled for simple).
- Rebuild 7 components as Svelte 5 + `tailwind-variants` (`tv`) + `cn`: `button`, `input`, `radio`, `radio-group`, `avatar`, `badge`, `checkbox`. `checkbox` has no `temp/` pattern and is built fresh; the rest follow their `temp/` patterns.
- Migrate variant tooling `cva` → `tv` (`class-variance-authority` is NOT installed and SHALL NOT be added; `tailwind-variants` ^3.2.2 is). `cn` composes at the call site: `cn(buttonVariants({...}), className)`.
- `disabled` is a **native HTML attribute** + Tailwind `disabled:` pseudo-classes in the `base` string. It is **removed from every variant config** — it is not an intent.
- New `variant` axis (`solid | outline | text`) subsumes the temp `bordered` + `textOnly` bools and maps 1:1 to the M3 role pattern (filled = `bg-X`/`text-on-X`; outline = `border-X`/`text-X`/transparent; text = `text-X`).
- Canonical 6-axis variant contract: `intent` (primary|secondary|danger|success|warning|info|clean), `variant` (solid|outline|text), `size` (tiny|small|medium|large|giant), `uppercase` (bool), `rounded` (none|tiny|small|medium|large|full), `fullWidth` (bool). Per-component extensions are additive (input: `hasError`/`hasLeftIcon`/`hasRightIcon`; radio-group: `position`; etc.) — captured in design.md.
- a11y baseline per component: `aria-busy` (loading) / `aria-disabled` (disabled link) / `focus-visible:ring` (button); `aria-invalid` + `aria-describedby` + label `for`/`id` (input); `role="radiogroup"` + arrow-key nav + `aria-checked` (radio-group); `aria-checked` + indeterminate (checkbox); `alt` + `role="img"` (avatar); `aria-hidden` for decorative badge.
- Functional features kept: `loading` (shows spinner, forces `disabled`), `href` (renders `<a>` when set, with disabled-link a11y), `leftIcon`/`rightIcon` as Svelte 5 snippets (`{@render leftIcon?.()}`).
- File structure per component: `<name>.svelte` (markup + `$props()`) + `<name>.style.ts` (`tv()` + types) + `index.ts` (re-exports) + a `primitives/index.ts` barrel.
- Cleanup: remove the 7 empty scaffolded subdirs currently in `src/lib/components/ui/` (`avatar`/`badge`/`button`/`checkbox`/`input`/`radio`/`radio-group`) and reset `ui/index.ts`; those components now live in `primitives/`.

## Capabilities

### New Capabilities

<!-- None. The variant contract, a11y baseline, and folder split belong to the existing component-library capability. -->

(none)

### Modified Capabilities

- `component-library`: (a) relax the "all components live under `src/lib/components/ui/`" requirement to permit a `src/lib/components/primitives/` folder for hand-rolled simple components, with `ui/` reserved for shadcn-svelte / `bits-ui`-based components; (b) relax the "TV config lives in a `<script module>` block inside `<name>.svelte`" requirement to permit a co-located `<name>.style.ts` file; (c) add the canonical 6-axis variant contract, the `disabled`-is-not-a-variant rule, and the per-component a11y baseline as requirements.

## Impact

- `src/lib/components/primitives/` — new folder: 7 component subfolders (`button`, `input`, `radio`, `radio-group`, `avatar`, `badge`, `checkbox`), each with `<name>.svelte` + `<name>.style.ts` + `index.ts`, plus a `primitives/index.ts` barrel.
- `src/lib/components/ui/` — remove the 7 empty scaffolded subdirs; reset `index.ts` (shadcn components populate this folder separately via `components.json`).
- `AGENTS.md` — update the shadcn-svelte section + tool-selection order to document the `primitives/` (hand-rolled) vs `ui/` (shadcn) split.
- `openspec/specs/component-library/spec.md` — delta modifies the location + TV-config-location requirements and adds the variant-contract + a11y requirements.
- No new dependencies (`tailwind-variants`, `clsx`, `tailwind-merge`, `@lucide/svelte` already installed). `class-variance-authority` is NOT installed and SHALL NOT be added.
- Depends on `extend-color-intents` (token foundation + status-intent permission already in `@theme`); this change consumes those tokens.
- `src/lib/components/ui-cp/` (the backup) is untouched — kept as reference; a future change may remove it once consumers migrate.
