## Why

The live landing page (`src/routes/+page.svelte`) is broken: it imports `Button`/`Card`/`Badge`/`Input` from `$lib/components/ui/...`, which is empty (the user's incomplete move of shadcn components to `ui-cp/` left `ui/` hollow). The good-design version is backed up at `src/routes/oage.bc.svelte`, but it imports from the same broken paths. The new hand-rolled primitives (`button`/`badge`/`input`) now exist in `src/lib/components/primitives/` (from the archived `rebuild-ui-primitives` change), but their default styling does not match the landing page's design — and `Card` is not in `primitives/`. This change rebuilds the landing page to consume the new primitives + a shadcn `Card` (in `ui/`), forcing the landing design onto the primitive defaults via call-site `class` overrides.

## What Changes

- Add shadcn `Card` to `src/lib/components/ui/card/` via `pnpm dlx shadcn-svelte@latest add card --yes --overwrite`, then restyle its base to M3 surface tokens (`bg-surface-container-low text-ink`, `rounded-card`) to mirror the primitive token usage. shadcn stays in `ui/` (per the `primitives/` vs `ui/` split).
- Rewrite `src/routes/+page.svelte` (the live page) using `oage.bc.svelte` as the design reference, importing `Button`/`Badge`/`Input` from `$lib/components/primitives` and `Card` from `$lib/components/ui/card`.
- Apply **Strategy A** (force style via `class`): each landing-specific visual is replicated by passing the exact `ui-cp` variant CSS as the `class` prop, relying on `tailwind-merge` (className wins over primitive defaults) plus manual defeats where the primitive base leaks:
  - 7 button variants → `login` / `hero-primary` / `hero-outline` / `view-all` / `become-partner` / `sponsorship-kit` / `join` class strings
  - 1 badge variant → `pill` class string
  - 2 bare inputs → class strings + `ring-0` (defeat the primitive's `ring-1 ring-inset`)
  - 3 card variants → `bento` / `bento-primary` / `stats` class strings (+ existing layout classes)
  - `focus-visible:ring-0` added to button overrides (defeat the primitive's focus ring) — or accept it for a11y, per-component at apply time
- Remove the backup `src/routes/oage.bc.svelte` after the rebuild lands in `+page.svelte` (it was the design reference; no longer needed once promoted).
- The 6 pre-existing `Cannot find module '$lib/components/ui/...'` `pnpm check` errors clear (the landing page no longer imports from the empty `ui/` barrel — it imports `Button`/`Badge`/`Input` from `primitives/` and `Card` from `ui/card/`).

## Capabilities

### New Capabilities

<!-- None. This is a pure implementation refactor — the landing page's behavior (hero, events, bento, CTA, footer) is unchanged. -->

(none)

### Modified Capabilities

<!-- The landing-page spec gains one new requirement: the component-sourcing + Strategy-A convention (how the landing page consumes primitives vs shadcn, and how landing-specific visuals are applied). The existing behavioral requirements (hero, lists, footer) are unchanged. -->

- `landing-page`: add a requirement that the landing page sources simple interactive components (`Button`/`Badge`/`Input`) from `primitives/` and composite containers (`Card`) from `ui/` (shadcn), applying landing-specific visuals via the `class` prop (Strategy A) rather than component-internal variants.

## Impact

- `src/lib/components/ui/card/` — new shadcn `Card` (card.svelte + card-header/title/description/content/footer/action + index.ts), base restyled to M3 tokens.
- `src/routes/+page.svelte` — rewritten end-to-end to consume `primitives` + `ui/card`, with call-site `class` overrides (Strategy A).
- `src/routes/oage.bc.svelte` — removed (was the design reference; superseded by the rebuilt `+page.svelte`).
- No new dependencies: `shadcn-svelte` is already configured (`components.json`); the primitives are already built (archived `rebuild-ui-primitives`).
- Depends on the archived `rebuild-ui-primitives` change (provides `Button`/`Badge`/`Input` in `primitives/` + the canonical `component-library` spec with the `primitives/` vs `ui/` split).
- `ui-cp/` (the old shadcn backup) remains untouched as reference; a future change may remove it once all consumers migrate.
- Note: only the **landing page** consumer is migrated in this change. Other routes (`login/`, `myprofile/`) still import from the empty `ui/` and remain broken — a separate follow-up migrates them.
