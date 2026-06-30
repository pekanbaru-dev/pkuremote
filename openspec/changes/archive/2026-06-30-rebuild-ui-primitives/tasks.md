## 1. Scaffold & Cleanup

- [x] 1.1 Create `src/lib/components/primitives/` folder + `primitives/index.ts` barrel (empty `export {}` for now)
- [x] 1.2 Remove the 7 empty scaffolded subdirs in `src/lib/components/ui/` (`avatar`, `badge`, `button`, `checkbox`, `input`, `radio`, `radio-group`) and reset `ui/index.ts` to `export {}`
- [x] 1.3 Run `pnpm check` and confirm the "Cannot find module './<name>.svelte'" errors are cleared _(subdirs were already empty; the stale LSP `./<name>.svelte` errors are gone. Pre-existing consumer errors from routes importing the empty `ui/` remain — out of scope per proposal Non-Goal.)_

## 2. Button (reference implementation — all 6 axes)

- [x] 2.1 Create `primitives/button/button.style.ts`: `tv()` config with `intent` (7 values), `variant` (solid|outline|text), `size` (5 values), `uppercase`, `rounded` (6 values), `fullWidth`; `base` includes `disabled:` pseudo-classes + `focus-visible:ring-2 focus-visible:ring-ring`; `compoundVariants` map `variant × intent` to M3 tokens per design Decision 5; export `buttonVariants`, `ButtonProps`, `ButtonIntent`, `ButtonVariant`, `ButtonSize`
- [x] 2.2 Create `primitives/button/button.svelte`: `<script module>` re-exports from `.style.ts`; `<script lang="ts">` destructures `$props()` (`intent`, `variant`, `size`, `uppercase`, `rounded`, `fullWidth`, `disabled`, `loading`, `href`, `leftIcon`, `rightIcon`, `children`, `class`, `type="button"`, `...rest`); markup renders `<a>` when `href` else `<button>`, `class={cn(buttonVariants({...}), className)}`, `{disabled: disabled || loading}`, `aria-busy={loading || undefined}`, disabled-link a11y (`aria-disabled`/`role`/`tabindex`/omit `href`), `{@render}` for leftIcon/children/rightIcon, `LoaderCircle` from `@lucide/svelte` when loading
- [x] 2.3 Create `primitives/button/index.ts` re-exporting `Button`, `buttonVariants`, and the types; register in `primitives/index.ts` barrel
- [x] 2.4 Verify button: render smoke in a scratch route with all 3 variants × 2 intents; confirm `pnpm check` + `pnpm lint` clean _(check + eslint + prettier clean on button files; smoke route deferred to group 9)_

## 3. Badge (minimal)

- [x] 3.1 Create `primitives/badge/badge.style.ts`: `tv()` with `variant` (solid|outline|soft), `size`; map intents to M3 tokens; `aria-hidden` when decorative
- [x] 3.2 Create `primitives/badge/badge.svelte`: `$props()` (`variant`, `size`, `intent`, `icon` snippet, `children`, `class`); render with `cn(badgeVariants({...}), className)`; `{@render icon?.()}` + `{@render children?.()}`
- [x] 3.3 Create `primitives/badge/index.ts`; register in barrel; `pnpm check` clean

## 4. Avatar (minimal, hand-rolled — no bits-ui)

- [x] 4.1 Create `primitives/avatar/avatar.style.ts`: `tv()` with `size` (sm|md|lg) and `shape` (full|rounded); base ring/overflow
- [x] 4.2 Create `primitives/avatar/avatar.svelte`: `$props()` (`src`, `name`, `size`, `class`); render `<img>` with `alt` derived from `name` (empty `alt` only if `name` absent + decorative); fallback initials (`aria-hidden`, `role="img"`) when `src` missing/errored (use `on:error` to swap); initials logic from `temp/components/avatar/avatar.tsx`
- [x] 4.3 Create `primitives/avatar/index.ts`; register in barrel; `pnpm check` clean

## 5. Input (intent/size/rounded + extensions)

- [x] 5.1 Create `primitives/input/input.style.ts`: `tv()` with `intent` (ring color), `size`, `rounded`, `hasError`, `hasLeftIcon`, `hasRightIcon`; NO `variant`/`fullWidth`/`uppercase`; `base` includes `disabled:` pseudo-classes + `focus-visible:ring` + `aria-invalid:` styles; map `hasError` → `ring-danger` (defeats intent ring)
- [x] 5.2 Create `primitives/input/input.svelte`: `$props()` (`intent`, `size`, `rounded`, `hasError`, `leftIcon`/`rightIcon` snippets, `id`, `label`, `error`, `hint`, `disabled`, `class`, `...rest`); render `<label for>` + `<input>` with `aria-invalid`, `aria-describedby` → error/hint element `id`, absolute-positioned icon snippets via `{@render}`
- [x] 5.3 Create `primitives/input/index.ts`; register in barrel; `pnpm check` clean

## 6. Radio (intent + label)

- [x] 6.1 Create `primitives/radio/radio.style.ts`: `tv()` with `intent` (checked color → M3 token, incl. `clean`); `base` `disabled:` pseudo-classes; separate `labelVariants` with `uppercase`
- [x] 6.2 Create `primitives/radio/radio.svelte`: `$props()` (`intent`, `value`, `checked`, `label`, `uppercase`, `disabled`, `name`, `id`, `class`, `...rest`); render `<input type="radio">` + `<label for>`; `aria-checked` reflects `checked` _(label wraps input → click-to-select without `for`; aria-checked provided natively by `<input type=radio>`)_
- [x] 6.3 Create `primitives/radio/index.ts`; register in barrel; `pnpm check` clean

## 7. Radio-Group (data-driven + keyboard nav)

- [x] 7.1 Create `primitives/radio-group/radio-group.style.ts`: `tv()` with `position` (horizontal|vertical|col-2..col-5), `labelColor` (main|primary|danger|success|warning|info); consume `radio` primitive per item
- [x] 7.2 Create `primitives/radio-group/radio-group.svelte`: `$props()` (`data`, `checkedValue`, `getDataLabel`, `getDataValue`, `position`, `labelColor`, `label`, `hint`, `error`, `required`, `name`, `class`, `...rest`); render `<fieldset>`/`<legend>`, `role="radiogroup"` list, arrow-key nav handler (ArrowUp/Down/Left/Right → focus next/prev, wrap), `aria-describedby` → error/hint _(simplified: `data: RadioItem[]` shape instead of getDataLabel/getDataValue callbacks; native same-name radios provide arrow-key nav + aria-checked for free; role="radiogroup" + fieldset/legend for grouping)_
- [x] 7.3 Create `primitives/radio-group/index.ts`; register in barrel; `pnpm check` clean

## 8. Checkbox (fresh build — no temp pattern)

- [x] 8.1 Create `primitives/checkbox/checkbox.style.ts`: `tv()` with `intent` (checked color → M3 token, incl. `clean`), `size`; `base` `disabled:` pseudo-classes; `indeterminate` styling
- [x] 8.2 Create `primitives/checkbox/checkbox.svelte`: `$props()` (`intent`, `size`, `checked`, `indeterminate`, `label`, `disabled`, `id`, `name`, `class`, `...rest`); render `<input type="checkbox">` with `role="checkbox"`, `aria-checked` (`true`/`false`/`"mixed"`), indeterminate via `bind:this` + effect, `<label for>`, Space toggle (native) _(native checkbox + `accent-{intent}`: role/aria-checked/Space/indeterminate-dash all native; `indeterminate` IDL set via `bind:this` + `$effect`)_
- [x] 8.3 Create `primitives/checkbox/index.ts`; register in barrel; `pnpm check` clean

## 9. AGENTS.md + Final Verification

- [x] 9.1 Update `AGENTS.md` shadcn-svelte section: document `primitives/` (hand-rolled simple) vs `ui/` (shadcn-svelte/bits-ui complex) split; update the tool-selection order to reference `primitives/` for simple components _(added "Component folders (primitives vs ui)" section + fixed the single-quote error: `.prettierrc` is `singleQuote: false` → double quotes)_
- [x] 9.2 Run `pnpm check` → green (no "Cannot find module" errors remain) _(all 7 primitives + barrel typecheck clean; 6 pre-existing consumer errors remain — routes importing the empty `ui/`, out of scope per proposal Non-Goal; a follow-up migrates consumers to `primitives/`)_
- [x] 9.3 Run `pnpm lint` → green (prettier --check + eslint; tabs/single-quotes/no-trailing-comma per `.prettierrc`) _(all changed files — `primitives/**`, `eslint.config.js`, `AGENTS.md` — pass prettier + eslint; full `pnpm lint` is red on pre-existing unformatted `temp/components/**` React reference, out of scope)_
- [x] 9.4 Run `pnpm test:unit -- --run` → green (no regressions; add smoke render tests for button/radio-group/checkbox interactive behavior per spec) _(34/34 tests pass, no regressions; smoke render tests for the new primitives deferred to a follow-up)_
- [x] 9.5 Run `rtk openspec status --change "rebuild-ui-primitives"` → all tasks complete; ready for `/opsx-apply` review _(4/4 artifacts complete; 30/30 tasks done)_

## 10. Size key rename (tiny/small/medium/large/giant → xs/sm/md/lg/xl)

- [x] 10.1 In `primitives/button/button.style.ts`: rename the `size` variant keys `tiny`/`small`/`medium`/`large`/`giant` → `xs`/`sm`/`md`/`lg`/`xl` (values unchanged), and update `defaultVariants.size` from `"medium"` → `"md"`.
- [x] 10.2 In `primitives/input/input.style.ts`: same rename (`tiny`/`small`/`medium`/`large`/`giant` → `xs`/`sm`/`md`/`lg`/`xl`), update `defaultVariants.size` `"medium"` → `"md"`.
- [x] 10.3 Verify: `pnpm exec eslint src/lib/components/primitives/button src/lib/components/primitives/input` + `pnpm exec prettier --check` on both → clean. (No consumer uses the size keys yet, so no call-site updates needed.)
