## Context

The live landing page (`src/routes/+page.svelte`) is broken — it imports `Button`/`Card`/`Badge`/`Input` from `$lib/components/ui/...`, which is empty (the user's incomplete move of shadcn components to `ui-cp/` left `ui/` hollow). The good-design version is backed up at `src/routes/oage.bc.svelte` (452 lines), but it imports from the same broken paths. The new hand-rolled primitives (`button`/`badge`/`input`) now exist in `src/lib/components/primitives/` (from the archived `rebuild-ui-primitives` change), but:

- Their **default styling does not match the landing design**. The landing was designed against the `ui-cp` components, which carry landing-specific named variants (`hero-primary`, `bento`, `stats`, `pill`, etc.) that don't exist in the primitives' canonical 6-axis contract (`intent`/`variant`/`size`/`uppercase`/`rounded`/`fullWidth`).
- **`Card` is not in `primitives/`** (the archived change built 7 primitives but not Card).

So the landing page cannot be re-pointed at `primitives/` by swapping import paths — the visuals would change. This change rebuilds the landing page to consume the new primitives + a shadcn `Card` (in `ui/`), forcing the landing design onto the primitive defaults via call-site `class` overrides.

## Goals / Non-Goals

**Goals:**

- Restore the landing page to a working, on-brand state: `+page.svelte` renders the oage.bc.svelte design using `primitives/` (Button/Badge/Input) + `ui/card/` (shadcn Card).
- Add shadcn `Card` to `ui/` and restyle its base to M3 surface tokens (mirror the primitive token usage).
- Replicate every landing-specific visual via the `class` prop (Strategy A), with explicit defeats where the primitive base leaks.
- Clear the 6 pre-existing `Cannot find module '$lib/components/ui/...'` `pnpm check` errors caused by the landing page's broken imports.

**Non-Goals:**

- Migrating OTHER routes (`login/`, `myprofile/`) off the empty `ui/` — separate follow-up.
- Building a hand-rolled `Card` in `primitives/` — Card stays shadcn in `ui/` (user decision: composite/headless-delegating containers belong in `ui/`).
- Changing the landing page's DESIGN — the visuals are preserved exactly; only the component sources + how variants are applied change.
- Removing `ui-cp/` (the backup) — kept as reference; a future change removes it once all consumers migrate.
- Adding landing-specific variant keys to the primitive components — explicitly forbidden (Strategy A: visuals via `class`, not component-internal variants).

## Decisions

### Decision 1: Card via shadcn in `ui/`, restyled to M3 tokens

**Choice:** Add `Card` via `pnpm dlx shadcn-svelte@latest add card --yes --overwrite` into `src/lib/components/ui/card/` (card.svelte + card-header/title/description/content/footer/action + index.ts). Restyle the card root's base to M3 surface tokens: replace shadcn's `bg-card text-card-foreground` with `bg-surface-container-low text-ink`, and `rounded-xl` with `rounded-card`. Keep the shadcn composite structure (subcomponents) and the `group/card`/`data-slot` hooks.

**Rationale:**

- The user decided Card stays shadcn in `ui/` (composite structure for free; aligns with the `primitives/` = simple vs `ui/` = shadcn split in the canonical `component-library` spec).
- shadcn Card is presentational (no `bits-ui`), but it's a composite (7 subcomponents) — shadcn gives the composite API (`Card.Header`, `Card.Title`, ...) for free, which the landing page's bento layouts rely on.
- Restyling the base to M3 tokens mirrors the primitive token usage so the Card's DEFAULT look is on-brand, even though the landing's bento/stats visuals come via `class` (Strategy A).

**Alternatives considered:**

- _Hand-roll Card in `primitives/`_ — rejected by user (Card stays shadcn in `ui/`); also the earlier exploration concluded Card is a threshold case but the user chose shadcn for the composite structure.
- _Use raw `<div>` instead of a Card component_ — rejected: loses the composite subcomponent API the bento layouts use, and the call sites already use `<Card variant="bento">` structure.

### Decision 2: Strategy A — force style via `class`, tailwind-merge resolves

**Choice:** Every landing-specific visual is replicated by passing the exact `ui-cp` variant CSS as the `class` prop on the primitive (or shadcn Card). The primitive's `cn(<name>Variants({...}), className)` emits default classes first, `className` last; `tailwind-merge` resolves conflicts in favor of the call-site class. Where the primitive's base classes do not conflict but leak undesirably, the call-site `class` includes an explicit defeat.

**Rationale:**

- The primitive defaults (canonical 6-axis) genuinely don't match the landing design (which uses landing-specific named variants). Strategy A lets us preserve the exact landing visuals without polluting the primitive component definitions with landing-specific variants.
- `tailwind-merge` already handles bg/text/padding/font conflicts (className wins). The only residual is non-conflicting base classes that leak — a small, explicit defeat set.
- Keeps the primitive contract clean (canonical 6-axis, no landing baggage).

**Alternatives considered:**

- _Strategy B (pass neutral `intent`/`variant` to minimize primitive emission)_ — rejected: requires choosing a "most neutral" config per component, and the primitive still emits some base classes; Strategy A is more direct (the class string IS the design).
- _Strategy C (add a `variant="bare"`/unstyled mode to primitives)_ — rejected: scope creep into the primitive components (which are frozen by the archived `rebuild-ui-primitives` change); Strategy A needs no primitive changes.

### Decision 3: The class-override mapping (variant → exact CSS)

Extracted from the `ui-cp` component definitions (the design source-of-truth). These are the exact `class` strings to apply at each call site:

**Button** (from `ui-cp/button/button.svelte:53-99`) — 7 variants:

| variant           | class string                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `login`           | `h-auto text-base font-normal bg-primary text-white/75 px-lg py-sm rounded-full font-label-lg hover:opacity-90 transition-all active:scale-95`                                                        |
| `hero-primary`    | `h-auto text-base font-normal bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-headline-md shadow-sm hover:shadow-md transition-all active:scale-95`                        |
| `hero-outline`    | `h-auto text-base font-normal border-2 border-primary text-primary px-xl py-md rounded-lg font-headline-md hover:bg-primary/5 transition-all active:scale-95`                                         |
| `view-all`        | `h-auto text-base font-normal text-primary font-label-lg flex items-center gap-xs hover:underline`                                                                                                    |
| `become-partner`  | `h-auto text-base font-normal bg-on-primary-container text-white px-xl py-md rounded-full font-headline-md hover:opacity-90 transition-all active:scale-95`                                           |
| `sponsorship-kit` | `h-auto text-base font-normal bg-white/20 text-on-primary-container px-xl py-md rounded-full font-headline-md border border-on-primary-container/30 hover:bg-white/30 transition-all active:scale-95` |
| `join`            | `h-auto text-base font-normal bg-primary text-white/75 px-4 py-2 hover:opacity-90`                                                                                                                    |

**Badge** (from `ui-cp/badge/badge.svelte:31-36`) — 1 variant:

| variant | class string                                                                                                                                 |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pill`  | `h-auto text-base font-normal border-0 inline-block bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1` |

**Card** (from `ui-cp/card/card.svelte`) — 3 variants (applied to shadcn Card root; layout classes stay at call site as-is):

| variant         | class string (color/radius/shadow)                                                    |
| --------------- | ------------------------------------------------------------------------------------- |
| `bento`         | `bg-surface-container-lowest rounded-xl talam-shadow ring-0`                          |
| `bento-primary` | `bg-primary text-on-primary rounded-xl ring-0`                                        |
| `stats`         | `bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0` |

**Input** (bare — class strips default; from `oage.bc.svelte:84,439`) — 2 usages:

| usage  | class string                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| search | `border-none bg-transparent rounded-none p-0 h-auto w-40 text-label-md focus-visible:ring-0 focus-visible:border-transparent outline-none`             |
| email  | `border-none bg-transparent rounded-none p-0 h-auto w-full text-label-md px-4 py-2 focus-visible:ring-0 focus-visible:border-transparent outline-none` |

### Decision 4: The defeat points (leaked primitive base classes)

`tailwind-merge` resolves CONFLICTING classes (bg/text/px/py/font — className wins). But non-conflicting primitive base classes leak. The defeats to add:

| primitive base leak                                           | lands on                                                   | defeat to add to `class`                                                               |
| ------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Input` `ring-1 ring-inset` (the primitive's border-via-ring) | bare embedded inputs (search/email)                        | `ring-0` (the existing `border-none` does NOT defeat `ring-1`)                         |
| `Button` `focus-visible:ring-2 focus-visible:ring-ring`       | landing button variants (which had no focus ring in ui-cp) | `focus-visible:ring-0` — OR accept the ring for a11y (decide per-button at apply time) |
| `Button` `[&_svg]:size-4`                                     | view-all (has an icon child)                               | no defeat — beneficial (sizes the arrow icon)                                          |
| `Button` `active:scale-95`                                    | all variants                                               | no conflict — already in both                                                          |

**Note on the `h-auto text-base font-normal` prefix:** every ui-cp landing button/badge variant begins with this to defeat the stock shadcn `h-8`/`text-sm`/`font-medium`. The primitive Button base has `font-medium` (defeated by `font-normal`) and size `md` emits `text-sm py-2.5 px-4` (defeated by `text-base`/`px-xl`/`py-md`); the primitive has no fixed `h-*` (uses `py`), so `h-auto` is harmless. So the prefix still does its job against the primitive base.

### Decision 5: Target file — rewrite `+page.svelte`, remove `oage.bc.svelte`

**Choice:** Rewrite `src/routes/+page.svelte` (the LIVE page — currently broken) using `oage.bc.svelte` as the design reference. After the rebuild lands, delete `src/routes/oage.bc.svelte` (it was the backup/reference; superseded).

**Rationale:**

- `+page.svelte` is the served route (SvelteKit serves `+page.svelte`, not arbitrary `.svelte` files). Rebuilding `oage.bc.svelte` alone wouldn't fix the live site.
- `oage.bc.svelte` is the design source-of-truth; once `+page.svelte` replicates it with the new component sources, the backup is redundant.
- The user's "mau di oage.bc.svelte" is interpreted as "the design I want is the one at oage.bc.svelte" — the target is the live page, the reference is the backup.

**Alternatives considered:**

- _Rebuild oage.bc.svelte then `mv` to +page.svelte_ — equivalent outcome, extra step; simpler to write directly to `+page.svelte`.

## Ris / Trade-offs

- **[Risk: visual drift from tailwind-merge edge cases]** — `tailwind-merge` resolves most conflicts, but exotic utilities (e.g., `bg-clip-padding`, `has-data-[slot=...]` selectors in the shadcn base) may interact unexpectedly with the landing class strings.
  → **Mitigation:** Visual diff the rebuilt `+page.svelte` against the `ui-cp` rendering (run `pnpm dev`, compare) before clearing the change; add defeats only where a real leak is observed.
- **[Risk: shadcn Card restyle diverges from the bento/stats call-site classes]** — the Card base is restyled to `bg-surface-container-low`, but the `bento` call-site class sets `bg-surface-container-lowest` (different). tailwind-merge resolves (className wins), so the restyle is just the default-Card look; the bento/stats visuals come from the class.
  → **Mitigation:** Documented in Decision 3; the restyle only affects the Card's DEFAULT (no-variant) usage, which the landing page doesn't use.
- **[Trade-off: landing visuals live at the call site, not in components]** — Strategy A means the `hero-primary`/`bento`/`stats` styling is in `+page.svelte`, not in a reusable component. Reusing these visuals elsewhere requires copying the class string.
  → **Mitigation:** Acceptable for now (the landing page is the only consumer); a future change could extract landing-section components (e.g., `<HeroButton>`, `<BentoCard>`) if reuse grows.
- **[Risk: `focus-visible:ring-0` on buttons reduces a11y]** — defeating the focus ring hides the keyboard-focus indicator on landing buttons.
  → **Mitigation:** Decide per-button at apply time; prefer keeping the focus ring (it's accessible and barely visible on the busy landing) unless a specific button's design is broken by it.

## Migration Plan

1. **Phase 1 — Card:** `pnpm dlx shadcn-svelte@latest add card --yes --overwrite` → `ui/card/`. Restyle `card.svelte` base to M3 tokens (`bg-surface-container-low text-ink`, `rounded-card`). Verify `pnpm check` clean on `ui/card/`.
2. **Phase 2 — Rewrite `+page.svelte`:** copy `oage.bc.svelte`'s structure, swap imports (`Button`/`Badge`/`Input` from `primitives`, `Card` from `ui/card`), replace each `<Button variant="hero-primary">` with `<Button class="[hero-primary string]">` (etc. for all 7 buttons, 1 badge, 2 inputs, 3 cards), add defeats (`ring-0` on bare inputs, `focus-visible:ring-0` on buttons where needed).
3. **Phase 3 — Cleanup + verify:** delete `oage.bc.svelte`. Run `pnpm check` → the 6 landing `Cannot find module` errors clear. Run `pnpm dev` → visual diff against the `ui-cp` rendering. Run `pnpm lint` (scoped to `+page.svelte` + `ui/card/`).

**Rollback:** revert the commit; `+page.svelte` returns to its broken (pre-change) state, `oage.bc.svelte` returns as the backup. No runtime code depends on the new `+page.svelte` content beyond the route itself.

## Open Questions

1. **`focus-visible:ring-0` on buttons** — defeat universally (pixel-match ui-cp) or keep the ring for a11y (accept minor visual difference)? _Current proposal: keep the ring by default; defeat only where a specific button's design is broken._
2. **`view-all` button icon** — the `view-all` class has `flex items-center gap-xs` and the call site puts a `<span class="material-symbols-outlined">arrow_forward</span>` child. The primitive Button's `[&_svg]:size-4` won't size a `material-symbols` span (it's a font icon, not svg). Verify the icon renders correctly; may need an explicit size class on the span.
3. **`talam-shadow` utility** — confirm `talam-shadow` is defined (layout.css or a layer) and available as a utility; the `bento`/`stats` card classes depend on it.
