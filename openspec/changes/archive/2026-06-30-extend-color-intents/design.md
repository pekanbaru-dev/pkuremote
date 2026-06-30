## Context

The project uses Tailwind v4 with `@theme` blocks in `src/routes/layout.css` for design tokens. The canonical palette is the Stitch Material-3 golden palette (cream canvas `#fefae0`, deep-amber primary `#765a05`). Existing color tokens follow the Material-3 role pattern: each color family has up to 4 roles — base (`--color-X`), on-base (`--color-on-X`), container (`--color-X-container`), on-container (`--color-on-X-container`). Currently `primary`, `secondary`, and `tertiary` have full or partial role sets; `error`/`destructive` has only the base + on-base (no container or on-container).

The existing `component-library` spec (port-react-components archive) forbids introducing new shade-scale tokens (`primary-50..900`, `success-*`, `danger-*`, `gray-*`) and requires success/warning/info intent variants to collapse to the brand ochre accent (the One Voice Rule). Both rules conflict with adding status-color families — this change modifies them.

The project uses `tailwind-variants` (`tv`) + `cn` for component variant definitions (see `button.svelte`, `badge.svelte`).

## Goals / Non-Goals

**Goals:**

- Add 4 status-color families (`danger`, `success`, `warning`, `info`) to `@theme`, each with the full M3 4-token role pattern, in OKLCH.
- Establish `danger` as the canonical intent name (matching the `temp/components/button` vocabulary); keep `destructive` as a shadcn alias via literal duplication.
- Harmonize the new colors with the existing Material-3 golden palette (similar chroma, perceptually monotonic lightness).
- Modify the `component-library` spec to permit the M3 role pattern for status colors, with a scoped exception to the One Voice Rule for functional status feedback.

**Non-Goals:**

- Component API changes (Button/Input/Alert/Badge variant extensions). Out of scope; follow-up change.
- 50–900 ramps. Forbidden by spec; not needed — the M3 role pattern covers filled/subtle/text/border use cases.
- Touching the existing `primary`/`secondary`/`tertiary` token values. They stay as-is.
- Adopting the temp button's `intent + bordered + textOnly` axis-terpisah API. That's a button-structure change, not a color change.
- Introducing a `tailwind.config.ts`. AGENTS.md forbids it; Tailwind v4 `@theme` accepts the tokens natively.

## Decisions

### Decision 1: M3 role pattern (4 tokens per family) over 50–900 ramp

**Choice:** Each status color gets exactly 4 tokens — `base`, `on-base`, `container`, `on-container` — matching the existing `primary`/`secondary` family shape.

**Rationale:**

- The 50–900 ramp pattern (from neo-kelaszaa) provides 10 shades per family but the temp button only ever uses the `-500` slot. The ramp is overkill for component variants.
- The M3 role pattern is already used by the existing palette; adopting it for status colors keeps the token vocabulary uniform.
- The 4 roles cover the 4 visual treatments components need: filled (`bg-X` + `text-on-X`), subtle background (`bg-X-container` + `text-on-X-container`), text-only (`text-X`), border-only (`border-X`).

**Alternatives considered:**

- _50–900 ramp per family (neo-kelaszaa style)_: rejected — overkill, 60+ tokens vs 16, and conflicts with the existing M3 role pattern.
- _Single-token per family (just `--color-X`)_: rejected — no container role, can't render subtle status backgrounds (e.g., success alert with pale green bg).

### Decision 2: Harmonized OKLCH values for success/warning/info

**Choice:** Anchor chroma at 0.097–0.130 (matching `primary` 0.097 and `secondary` 0.095) and pick conventional status hues:

| Family  | L     | C     | H   | Hex approx | Note                                                                                                |
| ------- | ----- | ----- | --- | ---------- | --------------------------------------------------------------------------------------------------- |
| success | 0.520 | 0.110 | 147 | #377a42    | green, white text, contrast 5.24:1                                                                  |
| warning | 0.620 | 0.130 | 65  | #bb731b    | orange-amber, DARK text `oklch(0.22 0.05 65)` (#2a1500), contrast 4.64:1; hue close to primary (87) |
| info    | 0.550 | 0.100 | 240 | #3179a6    | blue, white text, contrast 4.78:1                                                                   |
| danger  | 0.506 | 0.193 | 28  | #ba1a18    | existing `--color-destructive` value reused; white text, contrast 6.46:1                            |

Container tokens: L 0.885–0.910, chroma reduced to 0.05–0.07, same hue.
On-container tokens: L 0.420, chroma 0.08–0.16, same hue.
`on-{intent}` (text on base): `oklch(1 0 0)` (white) for danger/success/info; `oklch(0.22 0.05 65)` (dark warm brown, #2a1500) for warning — bright amber conventionally requires dark text for WCAG AA (white text on L 0.620 amber only achieves 3.76:1, AA-large only).

**Rationale:**

- Chroma matched to existing palette keeps the new colors feeling like one family.
- Warning hue (65) sits between error (28) and primary (87) — warm, but visually distinct from primary (L 0.483 vs warning L 0.620).
- WCAG AA verified by script (`wcag-check.mjs`, OKLCH→sRGB→relative-luminance): danger 6.46:1, success 5.24:1, warning 4.64:1 (dark text), info 4.78:1 — all pass AA. Warning uses dark text because bright amber (L 0.620) with white text only achieves 3.76:1 (AA-large only); dark warm text `oklch(0.22 0.05 65)` brings it to 4.64:1.
- Container L matches existing secondary-container (L 0.902).

**Alternatives considered:**

- _Pull from Radix Colors (12-step ramps, curated)_: rejected — introduces a non-M3 naming scheme and 12 tokens per family instead of 4.
- _Regenerate full M3 schemes with different seed hues (via materialcolors.xyz)_: viable, but the M3 generator produces tonal palettes with hue shifts across tones that don't match the project's existing M3 golden tones. Manual harmonization is more controllable.

### Decision 3: `danger` as canonical, `destructive` as shadcn alias

**Choice:** `--color-danger` is the canonical token name. `--color-destructive` continues to exist with the same literal OKLCH value (literal duplication, no `var()`).

**Rationale:**

- Matches the temp button vocabulary (`intent: primary | secondary | danger | success | warning | info | clean`) — the stated goal of "intent ikut yang dari temp".
- shadcn-svelte components reference `bg-destructive` / `text-destructive-foreground` in their default TV configs; removing those tokens would break the installed shadcn components. Keeping the alias via literal duplication (the documented `@theme` pattern) preserves compatibility.

**Alternatives considered:**

- _Keep `destructive` as canonical_: rejected — doesn't match the temp vocabulary and the user's explicit "rename to danger" decision.
- _Use `var(--color-danger)` for the alias_: rejected — AGENTS.md explicitly forbids `var()` in `@theme`; literal duplication is the documented pattern.

### Decision 4: Scoped One Voice Rule exception for functional status feedback

**Choice:** Modify the `component-library` spec to permit `danger`/`success`/`warning`/`info` as distinct visual treatments, scoped to **functional status feedback** (form validation, action outcomes, alerts, toasts). Decorative accents remain governed by the One Voice Rule (ochre ≤10% of any screen).

**Rationale:**

- The One Voice Rule (DESIGN.md) was written to prevent decorative accent overuse — too many colors competing for attention on a single screen. It was not written to forbid functional feedback colors that communicate state.
- Status colors on buttons/inputs/alerts occupy small screen real estate (well under 10% each), and their semantic meaning (success/danger/warning/info) requires perceptual distinctness — collapsing them to ochre (the previous spec rule) makes a "success" button indistinguishable from a "primary" button, which is bad UX.

**Alternatives considered:**

- _Drop the One Voice Rule entirely_: rejected — overcorrection; the rule is valuable for decorative restraint.
- _Keep the One Voice Rule strict, scope this change to only `danger` (which the existing spec already allows)_: rejected — doesn't satisfy the user's stated goal of having `success`/`warning`/`info` as distinct intent colors.
- _Move the exception to DESIGN.md instead of the spec_: viable; deferred. The spec change is sufficient for now; a DESIGN.md amendment can follow if reviewers prefer.

## Risks / Trade-offs

- **[Risk: Color drift over time]** as new status colors get used outside the "functional feedback" scope (e.g., as decorative accents on landing pages).
  → **Mitigation:** The spec's exception is explicitly scoped to functional status feedback. Future decorative use should be caught at review time against the One Voice Rule.
- **[Risk: Manual OKLCH values unverified on cream canvas]** — harmonized values are derived by chroma/lightness matching, not visually tuned.
  → **Mitigation:** After implementation, render a color swatch page (or temporary test route) showing all 4 base colors + containers on the cream canvas `#fefae0`; tune L/C/H if any color reads off.
- **[Risk: `--color-tertiary` (brown, hue 64, unused) and `--color-warning` (hue 65) are perceptually close]** — could confuse readers.
  → **Mitigation:** Leave `--color-tertiary` untouched (out of scope). Document that tertiary is retained for M3 source-of-truth fidelity but is currently unused; a future change may drop it.
- **[Trade-off: 16 new tokens grow `@theme` ~25%]**. Acceptable — tokens are documentation as much as runtime config.
- **[Trade-off: Literal duplication between `--color-danger`/`--color-destructive` (and their foregrounds)]** means a future value change must update both literals. Acceptable — AGENTS.md documents this as the intentional pattern; tooling could flag duplicates in the future.

## Migration Plan

This change is additive — no existing tokens are modified or removed. Steps:

1. Add 16 new `--color-*` tokens to `@theme` in `src/routes/layout.css`, grouped alongside existing role tokens (e.g., `--color-danger` next to `--color-destructive`).
2. Verify Tailwind v4 generates the corresponding utilities (`bg-danger`, `text-on-danger`, `bg-success-container`, etc.) by rendering a smoke test route.
3. Verify WCAG AA contrast for all 4 base colors against white text, and all 4 container colors against their on-container text.
4. No component changes — existing components continue to use the `destructive` alias; new status colors will be consumed in follow-up component changes.

**Rollback:** revert the commit; no runtime code depends on the new tokens yet.

## Open Questions

1. Should `--color-tertiary` (brown, hue 64, currently unused in `src/`) be dropped from `@theme` as part of this change, or left untouched? _Current proposal: leave untouched (out of scope)._
2. Should the One Voice Rule exception also be documented in `DESIGN.md`, or is the spec modification sufficient? _Current proposal: spec modification only; DESIGN.md amendment deferred._
3. Should `clean` (the 7th temp button intent, neutral) be added as a status color in a follow-up? _Current proposal: no — shadcn `outline`/`ghost` covers the neutral territory._
