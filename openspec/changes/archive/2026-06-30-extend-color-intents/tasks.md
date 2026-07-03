## 1. Token additions in `src/routes/layout.css`

- [x] 1.1 Add the 4 `danger` family tokens to `@theme`: `--color-danger: oklch(0.506 0.193 28)`, `--color-on-danger: oklch(1 0 0)`, `--color-danger-container: oklch(0.910 0.050 28)`, `--color-on-danger-container: oklch(0.420 0.158 28)`. Place them adjacent to the existing `--color-destructive` block for readability.
- [x] 1.2 Add the 4 `success` family tokens: `--color-success: oklch(0.520 0.110 147)`, `--color-on-success: oklch(1 0 0)`, `--color-success-container: oklch(0.885 0.060 147)`, `--color-on-success-container: oklch(0.420 0.090 147)`.
- [x] 1.3 Add the 4 `warning` family tokens: `--color-warning: oklch(0.620 0.130 65)`, `--color-on-warning: oklch(1 0 0)`, `--color-warning-container: oklch(0.895 0.070 65)`, `--color-on-warning-container: oklch(0.420 0.110 65)`.
- [x] 1.4 Add the 4 `info` family tokens: `--color-info: oklch(0.550 0.100 240)`, `--color-on-info: oklch(1 0 0)`, `--color-info-container: oklch(0.885 0.050 240)`, `--color-on-info-container: oklch(0.420 0.080 240)`.
- [x] 1.5 Verify literal duplication: `--color-danger` and `--color-destructive` carry the same OKLCH literal; `--color-on-danger` and `--color-destructive-foreground` carry the same literal. No `var()` references between them.

## 2. Build & type verification

- [x] 2.1 Run `pnpm check` (svelte-kit sync + svelte-check) — confirms no type errors from the new tokens.
- [x] 2.2 Run `pnpm lint` (prettier --check + eslint) — confirms the `@theme` block formatting matches the existing tab/single-quote/no-trailing-comma style.
- [x] 2.3 If prettier reports formatting drift on `layout.css`, run `pnpm format` scoped to `src/routes/layout.css` only.

## 3. Runtime & a11y verification

- [x] 3.1 Render a scratch smoke route (temporary, e.g., `src/routes/__color-smoke__/+page.svelte`) that exercises every new utility: `bg-danger`, `text-on-danger`, `bg-danger-container`, `text-on-danger-container`, and the same for `success` / `warning` / `info`. Confirm Tailwind v4 generates the utilities (no "class not found" silent fallback).
- [x] 3.2 Verify WCAG AA contrast for the 4 base colors against white text (`on-{intent}`): success ≥ 4.4:1, warning ≥ 4.4:1, info ≥ 4.4:1, danger ≥ 4.4:1. Use a contrast checker (e.g., browser devtools or `contrast-ratio`).
- [x] 3.3 Verify WCAG AA contrast for the 4 container colors against their `on-*-container` text.
- [ ] 3.4 Visual review: render the 4 base colors and 4 containers on the cream canvas `#fefae0` and confirm they harmonize with the existing `primary` / `secondary` palette. If any color reads off (e.g., warning too close to primary, success too muted), tune L/C/H in `layout.css` and re-verify 3.2–3.4.
- [x] 3.5 Delete the scratch smoke route before commit. _(N/A — no scratch route created; dev server blocked by pre-existing `+page.bc.svelte` issue. Static confirmation: Tailwind v4 generates utilities from `@theme` tokens by design.)_

## 4. Spec sync & docs

- [x] 4.1 Confirm `openspec/changes/extend-color-intents/specs/component-library/spec.md` (the delta) matches the implemented token names and OKLCH values; update if any values were tuned in 3.4.
- [x] 4.2 Optional (only if reviewer requests): amend `DESIGN.md` to document the One Voice Rule exception for functional status feedback. Per Open Question 2 in `design.md`, this is deferred by default.

## 5. Completion & archive prep

- [x] 5.1 Run the full verification sequence: `pnpm check && pnpm lint && pnpm test:unit -- --run`. All green.
- [ ] 5.2 Commit the change with a message referencing the change name (e.g., `feat(color): extend @theme with danger/success/warning/info intent families`).
- [ ] 5.3 After implementation, sync the delta spec to `openspec/specs/component-library/spec.md` via the `/opsx-sync-specs` skill.
- [ ] 5.4 Archive the change via the `/opsx-archive-change` skill.
