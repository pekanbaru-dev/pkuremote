## Context

The reusable component layer is in a broken intermediate state. `src/lib/components/ui/` was scaffolded with 7 empty subfolders (`avatar`/`badge`/`button`/`checkbox`/`input`/`radio`/`radio-group`) whose `index.ts` files reference `.svelte` files that do not exist — `pnpm check` reports "Cannot find module" errors for each. The React reference in `temp/components/` is the intended _pattern_ source but cannot be ported verbatim for three reasons:

1. It uses `class-variance-authority` (`cva`), which is **not installed**. The project standardized on `tailwind-variants` (`tv`) — `tailwind-variants` ^3.2.2 is in `dependencies`, and the canonical `component-library` spec (Requirement: "Variants are authored with `tailwind-variants`") already mandates `tv`. The old `ui-cp/button/button.svelte` backup is the proven `tv` reference.
2. It treats `disabled` as a **style variant** (`disabled: { false: undefined, true: "opacity-50 ..." }`) in `button.style.ts`, `input.style.ts`, and `radio.style.ts`. This conflates a native HTML state with the intent vocabulary.
3. It uses a **hex/shade-scale color vocabulary** (`bg-primary-500`, `focus:bg-primary-50`, `ring-danger-500`) that does not exist in `@theme`. The project uses the Material-3 role pattern (`base`/`on-base`/`container`/`on-container`). The `extend-color-intents` change already added the `danger`/`success`/`warning`/`info` families in this shape and explicitly deferred the component-API restructuring to this follow-up.

Separately, `AGENTS.md` currently documents `src/lib/components/ui/` as the single component folder (shadcn-svelte). The user decision is to split: hand-rolled simple primitives go in a new `primitives/` folder; `ui/` stays shadcn-svelte for headless/complex components (`bits-ui`-based: dropdown, dialog, navigation-menu, sheet, …).

## Goals / Non-Goals

**Goals:**

- Rebuild 7 simple primitives (`button`, `input`, `radio`, `radio-group`, `avatar`, `badge`, `checkbox`) as Svelte 5 runes-mode components in `src/lib/components/primitives/`.
- Establish a canonical 6-axis variant contract (`intent` / `variant` / `size` / `uppercase` / `rounded` / `fullWidth`) shared across components, with additive per-component extensions.
- Map the temp hex/shade-scale vocabulary onto the existing M3 OKLCH token system — no new tokens, no `class-variance-authority`, no `-500`/`-50` classes.
- Make `disabled` a native attribute everywhere; remove it from variant configs.
- Add an a11y baseline (ARIA + focus-visible + label association + keyboard nav) to every component.
- Document the `primitives/` vs `ui/` split in `AGENTS.md` and the `component-library` spec.

**Non-Goals:**

- Touching shadcn-svelte components in `ui/` (dropdown, dialog, navigation-menu, …). Those stay as-is.
- Migrating consumers (`src/routes/+page.svelte`, etc.) to the new primitives. That is a follow-up; this change ships the components + barrel only.
- Removing `src/lib/components/ui-cp/` (the backup). Kept as reference; a future change removes it once consumers migrate.
- Adding `class-variance-authority`. It is not installed and SHALL NOT be added.
- New color tokens. `extend-color-intents` already provides the `danger`/`success`/`warning`/`info` families; this change only consumes them.
- Building the ~30 other components in `temp/components/` (autocomplete, datepicker, table, …). Out of scope; this change covers the 7 simple primitives only.

## Decisions

### Decision 1: `primitives/` for hand-rolled, `ui/` stays shadcn

**Choice:** New hand-rolled components live at `src/lib/components/primitives/<name>/`. `src/lib/components/ui/` remains the shadcn-svelte folder (`components.json` still aliases shadcn to `$lib/components/ui`).

**Rationale:**

- `AGENTS.md` documents `ui/` as the shadcn folder and `components.json` points shadcn-svelte at `$lib/components/ui`. Co-locating hand-rolled components there would collide with shadcn's `add` command and blur the convention.
- `src/lib/components/primitives/` already exists (currently empty) — appears intentionally prepared for this.
- Simple primitives (button, input, radio, …) do not need `bits-ui` plumbing; hand-rolling them avoids the shadcn override dance documented in AGENTS.md (e.g., the NavigationMenu hover-bg conflict).
- Complex/headless components (dropdown, dialog, sheet) stay shadcn because `bits-ui` gives them focus-trap, escape, scroll-lock, popper positioning for free.

**Alternatives considered:**

- _Put everything in `ui/`, hand-rolled alongside shadcn_: rejected — collides with `components.json` alias and the documented shadcn convention.
- _Put hand-rolled in `ui/` and move shadcn elsewhere_: rejected — inverts the documented convention and breaks `components.json` aliases.

### Decision 2: Separate `<name>.style.ts` file

**Choice:** Each component folder has `<name>.svelte` (markup + `$props()`) + `<name>.style.ts` (`tv()` config + type exports) + `index.ts` (re-exports). The `.svelte` file's `<script module>` block re-exports from the `.style.ts`.

**Rationale:**

- Mirrors the `temp/` pattern (`button.tsx` + `button.style.ts` + `index.ts`), which the user confirmed ("pisahkan biar rapi, ada .style.ts").
- Separates variant logic (testable, pure) from markup.
- The canonical spec currently mandates the `tv()` call inside `<script module>`; this change relaxes that to permit the split (see specs delta).

**Alternatives considered:**

- _Inline `tv()` in `<script module>` (old shadcn backup pattern)_: rejected — user explicitly chose the split for tidiness.

### Decision 3: `disabled` is a native attribute, not a variant

**Choice:** `disabled` is removed from every `tv()` variant config. Disabled styling lives in the `base` string as Tailwind pseudo-classes: `disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed`. The component passes `disabled` straight to the element (`<button {disabled}>`). `loading` forces `disabled: disabled || loading` on the element and sets `aria-busy`.

**Rationale:**

- `disabled` is an HTML state, not a visual intent. Treating it as a `tv` variant couples it to the style system and makes `loading` overload the disabled _intent_ (the temp `button.tsx` passes `disabled: disabled || loading` into the variant fn — two concerns conflated).
- The old shadcn backup already does this correctly (`base: "disabled:pointer-events-none disabled:opacity-50"`, `<button {disabled}>`). This change generalizes that pattern to all primitives.
- Keeps the variant API focused on visual intent; the user's 6-axis list omits `disabled` by design.

**Alternatives considered:**

- _Keep `disabled` as a `tv` variant (temp pattern)_: rejected — user explicitly flagged it as wrong ("disabled jadi intent, ini salah").

### Decision 4: `variant` axis (`solid|outline|text`) subsumes `textOnly` + `bordered`

**Choice:** A single `variant` axis with values `solid` (default) / `outline` / `text` replaces the temp's two boolean axes `bordered` and `textOnly`. The three values map 1:1 to the M3 role pattern (Decision 5).

**Rationale:**

- The temp pattern has `bordered` (bool) and `textOnly` (bool) producing 3 looks: solid, outline (border + transparent + intent text), text (transparent + intent text). Two booleans for a 3-state space is awkward and admits a 4th nonsense state (`bordered:true, textOnly:true`).
- A single `variant` axis is cleaner, matches the old shadcn backup (`variant: default | outline | ghost | link`), and the user approved it ("boleh dibuat varian terpisah").
- `compoundVariants` simplify from 12 entries (temp) to 7 (one per intent × outline/text).

**Alternatives considered:**

- _Keep `textOnly` bool, add `bordered` bool (temp shape)_: rejected — user chose a separate variant axis.
- _Drop the outline look entirely_: rejected — outline is a legitimate, commonly-needed visual.

### Decision 5: Color mapping — M3 roles, no shade scale

**Choice:** Each `intent × variant` cell maps to M3 role tokens already in `@theme` (no new tokens, no `-500`/`-50`):

| intent    | solid (`bg-X` + `text-on-X`)             | outline (`border-X` + `text-X`)   | text (`text-X`)  |
| --------- | ---------------------------------------- | --------------------------------- | ---------------- |
| primary   | `bg-primary text-primary-foreground`     | `border-primary text-primary`     | `text-primary`   |
| secondary | `bg-secondary text-secondary-foreground` | `border-secondary text-secondary` | `text-secondary` |
| danger    | `bg-danger text-on-danger`               | `border-danger text-danger`       | `text-danger`    |
| success   | `bg-success text-on-success`             | `border-success text-success`     | `text-success`   |
| warning   | `bg-warning text-on-warning`             | `border-warning text-warning`     | `text-warning`   |
| info      | `bg-info text-on-info`                   | `border-info text-info`           | `text-info`      |
| clean     | `bg-muted text-muted-foreground`         | `border-outline-variant text-ink` | `text-ink`       |

This is the 4-role M3 pattern from `extend-color-intents` Decision 1: filled = `bg-X`/`text-on-X`; border-only = `border-X`/`text-X`; text-only = `text-X`. The `clean` intent (Open Question 3 of `extend-color-intents`: "shadcn `outline`/`ghost` covers the neutral territory") maps to `muted`/`ink`/`outline-variant` — no new token.

For subtle-focus fills (the temp `focus:bg-primary-50`), use `focus:bg-X-container` (the M3 container role) or `focus:ring-X`; per-component in the implementation.

**Rationale:**

- Grounded in `extend-color-intents` Decision 1, which already proved this mapping for the shadcn button (`variant: default` → `bg-primary text-primary-foreground`; `variant: destructive` → `bg-destructive/10 text-destructive`).
- `primary` uses the shadcn name `primary-foreground` because `@theme` defines `--color-primary-foreground` (not `--color-on-primary`); `danger`/`success`/`warning`/`info` use the M3 `on-X` names. Inconsistent but workable — both resolve to white (or dark for warning).

**Alternatives considered:**

- _Reintroduce a 50–900 shade scale_: rejected — `extend-color-intents` Decision 1 rejected this; `component-library` spec forbids it.
- _Use `bg-X/10` opacity for the "subtle" role instead of `*-container`_: viable for some cases; deferred to per-component tuning. `*-container` is the canonical M3 role and is preferred.

### Decision 6: Canonical 6-axis contract, applied per-component

**Choice:** The canonical variant vocabulary is 6 axes — `intent`, `variant`, `size`, `uppercase`, `rounded`, `fullWidth`. Each component adopts the axes that make sense for its domain plus additive extensions. Button is the reference implementation (all 6). The `size` axis uses the `xs`/`sm`/`md`/`lg`/`xl` naming (aligned with shadcn-svelte/Tailwind convention, and consistent with `badge`/`avatar`/`checkbox` which already use `sm`/`md`/`lg`) — NOT `tiny`/`small`/`medium`/`large`/`giant`. Per-component:

| component   | canonical axes used                                  | extensions                                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| button      | intent, variant, size, uppercase, rounded, fullWidth | `loading`, `href` (→`<a>`), `leftIcon`/`rightIcon` (snippets)                                                                                                                                                 |
| input       | intent, size, rounded                                | `hasError`, `hasLeftIcon`, `hasRightIcon` (drops variant/fullWidth/uppercase — not meaningful for a text field; `w-full` is default)                                                                          |
| radio       | intent                                               | label `uppercase` (on the label, not the input)                                                                                                                                                               |
| radio-group | —                                                    | `position` (horizontal\|vertical\|col-2\|col-3\|col-4\|col-5), `labelColor` (main\|primary\|danger\|success\|warning\|info), `data`/`checkedValue`/`getDataLabel`/`getDataValue`, `error`, `hint`, `required` |
| avatar      | size                                                 | `src`, `name` (generates initials fallback)                                                                                                                                                                   |
| badge       | variant, size                                        | `icon` (snippet) — minimal                                                                                                                                                                                    |
| checkbox    | intent, size                                         | `indeterminate`, label association (fresh build, no temp pattern)                                                                                                                                             |

**Rationale:**

- Not every axis applies to every component (e.g., `variant: solid|outline|text` is meaningless for a radio dot). Forcing a uniform 6-axis surface on all components would produce no-op props.
- The temp patterns already encode this domain specificity (`input.style.ts` has `hasError`/`hasLeftIcon`/`hasRightIcon`; `radio-group.style.ts` has `position`). This change preserves those, translated to `tv`.

**Alternatives considered:**

- _Force all 7 components to expose all 6 axes_: rejected — produces no-op props and lies about the component's real surface.

### Decision 7: a11y baseline

**Choice:** Every component ships a minimum a11y surface:

- **button**: `type="button"` default; `aria-busy="true"` while `loading`; when `href` + `disabled`, render `<a>` with `aria-disabled`, `role="link"`, `tabindex={-1}`, and `href={undefined}`; `focus-visible:ring-2 focus-visible:ring-ring` in base.
- **input**: `aria-invalid="true"` when `hasError`; `id` + label `for` association; `aria-describedby` pointing at the error/hint element id.
- **radio-group**: `<fieldset>`/`<legend>` (temp already uses these); `role="radiogroup"` on the list; arrow-key navigation between radios; `aria-checked` on each radio; `aria-describedby` for error/hint.
- **checkbox**: `role="checkbox"`; `aria-checked` reflecting `checked`/`"mixed"` for indeterminate; label `for`/`id` association; keyboard Space toggle.
- **avatar**: `<img>` `alt` derived from `name` (empty `alt` only when decorative); `role="img"` on the fallback; the fallback initials are `aria-hidden` (the `alt` carries the name).
- **badge**: if decorative, `aria-hidden`; if interactive (rare), `role="link"`/`role="button"` as appropriate.

**Rationale:**

- The temp patterns have zero ARIA. The old shadcn backup has partial a11y (disabled-link handling, focus-visible ring). This change makes a11y a first-class requirement, not an afterthought.
- Grounded in WCAG 2.1 AA + the WAI-ARIA Authoring Practices for radiogroup/checkbox.

**Alternatives considered:**

- _Defer a11y to a follow-up_: rejected — the user explicitly flagged "belum ada a11y" as a problem to fix now.

### Decision 8: Functional features kept, Svelte-idiomatic

**Choice:** `loading` (bool, shows a `@lucide/svelte` `LoaderCircle` spinner, forces `disabled`), `href` (renders `<a>` instead of `<button>` when set), and `leftIcon`/`rightIcon` (Svelte 5 snippets, `{@render leftIcon?.()}`) are preserved on `button`. Input keeps `hasLeftIcon`/`hasRightIcon` (rendered via snippets positioned absolutely).

**Rationale:**

- These are real features in the temp source, not style variants. Dropping them would regress functionality.
- Svelte 5 snippets are the idiomatic replacement for React `ReactNode` icon props (per the canonical spec's "Svelte 5 reactivity patterns only" requirement).

## Risks / Trade-offs

- **[Risk: `primary-foreground` vs `on-primary` naming inconsistency]** — `primary` uses the shadcn `primary-foreground` name while `danger`/`success`/`warning`/`info` use M3 `on-X`. Same values, two conventions.
  → **Mitigation:** Documented in Decision 5; a future change may add `--color-on-primary` as an alias. Not blocking.
- **[Risk: `checkbox` built without a temp pattern]** — no reference for its variant surface; risk of diverging from the 6-axis contract.
  → **Mitigation:** Decision 6 pins checkbox to `intent` + `size` + `indeterminate`; the implementer follows the button style.ts structure.
- **[Risk: consumers still import from `ui-cp` or the broken `ui/` subdirs]** — shipping new primitives does not migrate call sites.
  → **Mitigation:** Stated as a Non-Goal; a follow-up change migrates `src/routes/+page.svelte` etc. The `ui/` empty subdirs are removed in this change so their broken `index.ts` errors disappear.
- **[Trade-off: two component folders (`primitives/` + `ui/`)]** — consumers must learn which to import from.
  → **Mitigation:** `AGENTS.md` documents the rule: simple → `primitives/`; headless/complex → `ui/` (shadcn).
- **[Trade-off: `.style.ts` split deviates from the current spec's inline-`tv` rule]** — until the spec delta lands, the new files technically violate the canonical spec.
  → **Mitigation:** The specs delta in this change modifies the requirement; the delta lands in the same change.

## Migration Plan

This change is additive (new `primitives/` folder) + a cleanup (remove broken `ui/` subdirs). Steps:

1. Create `src/lib/components/primitives/` + barrel `primitives/index.ts`.
2. Build components in dependency order: `button` (reference) → `badge` → `avatar` → `input` → `radio` → `radio-group` → `checkbox`. Each lands as a folder (`<name>.svelte` + `<name>.style.ts` + `index.ts`).
3. Remove the 7 empty scaffolded subdirs in `src/lib/components/ui/` and reset `ui/index.ts` to `export {}`.
4. Update `AGENTS.md` shadcn-svelte + tool-selection sections for the `primitives/` vs `ui/` split.
5. Verify: `pnpm check` (the "Cannot find module" errors clear) → `pnpm lint` → `pnpm test:unit -- --run`.

**Rollback:** revert the commit; the broken `ui/` subdirs return (they were already broken, so rollback returns to the pre-existing broken state, not worse). No runtime code depends on `primitives/` yet.

## Open Questions

1. **Badge variant surface** — the temp `ui/badge.tsx` has no variants (just `children`/`icon`/`className`). Should badge adopt `variant: solid|soft|outline` + `size`, or stay variant-less? _Current proposal: minimal `variant` + `size` to match the contract; revisit if it bloats._
2. **Radio `clean` intent** — the temp `radio.style.ts` omits `clean` (only 6 intents). Should radio support `clean`? _Current proposal: yes, for contract uniformity (maps to `border-outline-variant`/`text-ink`)._
3. **Input focus style** — `focus:ring-X` vs `focus:bg-X-container` vs both. _Current proposal: `focus:ring-X` (M3 focus-ring convention); container-fill deferred unless visually needed._
4. **Avatar `bits-ui` vs hand-rolled** — the temp avatar uses `@radix-ui/react-avatar` (forbidden by spec). `bits-ui` has an Avatar primitive. Should avatar hand-roll a plain `<img>` + fallback, or use `bits-ui`? _Current proposal: hand-roll (simple enough; the user's "simple → primitives" rule applies)._
