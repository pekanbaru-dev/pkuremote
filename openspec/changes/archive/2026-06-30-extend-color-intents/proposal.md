## Why

The project's color system has no canonical tokens for `success`, `warning`, `info`, or `danger` as full Material-3 role families. The existing `--color-destructive` is a shadcn alias for a single base color — it lacks the companion `on-*`, `*-container`, and `on-*-container` roles that `primary`/`secondary`/`tertiary` already have. Components that need to convey functional status feedback (Button, Input, Alert, Badge, Toast) therefore have no shared, intent-based color contract; each component invents an ad-hoc treatment that drifts over time. This change introduces four new OKLCH color families following the existing M3 role pattern so that `intent="danger"` on a Button and `intent="danger"` on an Input resolve to the same token — and so `success`/`warning`/`info` have a canonical home.

## What Changes

- Add 4 new color families to `@theme` in `src/routes/layout.css`, each with 4 OKLCH tokens following the existing Material-3 role pattern (`base` + `on-base` + `container` + `on-container`):
  - `danger` — completes the existing `destructive` family; `--color-danger` and `--color-destructive` share the same literal (alias-duplication pattern already used elsewhere in `@theme`).
  - `success` — harmonized green
  - `warning` — harmonized orange-amber
  - `info` — harmonized blue
- All new tokens are OKLCH (no hex), literal values (no `var()` deduplication), per the `@theme` convention documented in AGENTS.md.
- **BREAKING (spec-level)**: Modifies the `component-library` spec to permit these four status-color families using the M3 4-token role pattern, as a scoped exception to (a) the "no new shade-scale tokens" rule and (b) the Quiet Bulletin One Voice Rule. The exception is scoped to **functional status feedback** (form validation, action outcomes, alerts) — not decorative accents. The 50–900 ramp pattern (`primary-50..900`, `success-50..900`, etc.) remains forbidden.
- Scope: **color tokens only**. Component API changes (Button/Input/Alert/Badge variant extensions) are explicitly out of scope and will be a follow-up change.

## Capabilities

### New Capabilities

<!-- No new capabilities. The color token contract belongs to the existing component-library capability. -->

(none)

### Modified Capabilities

- `component-library`: Relax the "no new shade-scale tokens" rule to permit four status-color families (`danger`, `success`, `warning`, `info`) using the Material-3 4-token role pattern (base, on-base, container, on-container). Carve out a scoped exception to the One Voice Rule for functional status feedback colors. The 50–900 ramp pattern remains forbidden; raw Tailwind palette utilities (`bg-emerald-500`, `text-red-600`, etc.) remain forbidden.

## Impact

- `src/routes/layout.css`: 16 new `--color-*` tokens added to the `@theme` block (4 families × 4 roles). No existing tokens modified or removed.
- `openspec/specs/component-library/spec.md`: requirements relaxed per above; delta spec provided.
- `DESIGN.md`: no edits required — the One Voice Rule is preserved for decorative accents; the new exception is scoped to functional status feedback, which is a separate concern. (Reviewer may disagree and want a DESIGN.md amendment; flagged here for visibility.)
- No runtime code changes in this change (no Button/Input/Alert/Badge modifications). Components will consume the new tokens in follow-up changes.
- No new dependencies. Tailwind v4 `@theme` accepts the tokens natively; no `tailwind.config.js` introduced (per AGENTS.md).
- WCAG AA: all 4 new base colors meet ≥4.4:1 contrast against white text; container colors meet AA against their `on-*-container` text.
