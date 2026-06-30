## Context

The landing page (`src/routes/+page.svelte`, 477 lines) renders its interactive and container elements as raw HTML: 7 `<button>`, 2 `<input>`, 5 card-like `<div>`, 1 pill `<span>` — each with a long hand-rolled Tailwind class string. Meanwhile `src/lib/components/ui/` contains 44 installed shadcn-svelte components, unused on this route. The existing `shadcn-components` spec already normatively says "`.btn-primary` is REMOVED; its role is filled by the shadcn Button component," but that was never actually applied to `+page.svelte` — and the spec's Button requirement describes an aspirational customization ("ochre fill, pill radius, label-lg") that was never written into the stock `button.svelte` (which still ships shadcn defaults: `rounded-lg`, `text-sm`, `h-8`/`h-9`).

The current `button.svelte` uses `tv()` with stock variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes (`default`=`h-8`, `xs`, `sm`, `lg`=`h-9`, `icon*`). The current `card.svelte` uses a plain `cn("...stock classes...", className)` string (no `tv`), with `ring-1 ring-foreground/10` + `rounded-xl bg-card py-4 gap-4` defaults. The `badge/` directory is empty (not installed). The `input.svelte` wraps its `<input>` in a structural `<div class="flex w-full flex-col gap-1.5">` with optional label/hint/error, and styles the input with `border-hairline bg-canvas rounded-md ... focus-visible:ring-2`.

All shadcn components merge classes via `cn()` = `tailwind-merge(clsx(...))`, so a `class` prop wins standard-utility conflicts (e.g. `rounded-full` over `rounded-lg`) but cannot defeat custom token classes that tailwind-merge doesn't recognize, and cannot remove structural wrappers.

Stack constraints (from `AGENTS.md`): Svelte 5 runes mode forced; Tailwind v4 (tokens in `@theme` in `src/routes/layout.css`); `font-*` utilities come from `--font-*` family tokens, `text-*` utilities from `--text-*` size tokens (both recognized by tailwind-merge as font-family / font-size respectively); prettier uses tabs + single quotes + no trailing commas; `shadcn-svelte add` runs via `pnpm dlx` (no global install); NavigationMenu is explicitly banned on the landing page.

## Goals / Non-Goals

**Goals:**

- Replace the landing page's raw `<button>` / card-`<div>` / pill-`<span>` / `<input>` elements with shadcn-svelte primitives from `src/lib/components/ui/`.
- Preserve the exact current visual output (pixel-equivalent) — no token, color, typography, spacing, or radius value changes.
- Consolidate the 7 button styles, 3 card styles, and 1 badge style into named `tv()` variants inside the shared component files, so they are reusable on future routes.
- Align the `shadcn-components` spec with reality (the Button requirement currently describes a customization that was never applied; Card is installed but undocumented; Badge is not installed).

**Non-Goals:**

- Touching the NavigationMenu (banned on landing per `AGENTS.md`) — header + footer nav links stay raw `<a>`.
- Migrating elements with no shadcn primitive: headings, hero background image layers, partner logo grid, the blog progress bar, social icon links, the copyright line.
- Changing any design token, the `@theme` block, `.talam-shadow`, `.container-page`, or any other `layout.css` class.
- Forcing other routes (`events/[slug]`, `login`, `myprofile`) to adopt the new variants — they keep their own treatments (the variants are available but opt-in).
- Replacing the scroll-aware header logic, hero composition, or any section's structural/semantic markup.

## Decisions

### Decision 1: Approach B (customize component via `tv`) for Button + Card + Badge; Approach A (per-usage class override) for Input

Per the user's explicit choice: Button, Card, and Badge get new variants inside their shared `.svelte` files via `tv()` (clean per-usage: `<Button variant="login">`, `<Card variant="bento">`, `<Badge variant="pill">`). Input is the exception — it uses the stock component with a heavy per-usage `class` override, because (a) there are only 2 input usages with divergent layouts, (b) the Input component's structural wrapper `<div>` cannot be removed via a `class` prop, and (c) customizing `input.svelte` to make the wrapper optional would be more invasive than the 2 usages justify.

**Alternatives considered:**

- **Approach A for all (per-usage `<Button class="...long string...">`)** — rejected: verbose, repeats the 7 button class strings at each call site, defeats the "reusable" goal.
- **Approach B for Input (add an `unwrapped` variant/prop)** — rejected: `input.svelte`'s wrapper is structural HTML, not a `tv` class; removing it needs a Svelte-level conditional, which is a bigger change than the 2 usages warrant. Revisit if a 3rd bare-input usage appears.

### Decision 2: Button variant taxonomy — 7 named semantic variants (not a grouped matrix)

The 7 current button styles are each semantically distinct (login pill, hero filled, hero outlined, view-all link, become-a-partner, sponsorship-kit glass, footer join). Rather than group them into a `pill` + `hero` matrix with `tone`/`size` props, each gets its own named variant: `login`, `hero-primary`, `hero-outline`, `view-all`, `become-partner`, `sponsorship-kit`, `join`. This is the most explicit and readable at call sites (`<Button variant="become-partner">`), at the cost of a longer `buttonVariants` config. Stock variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) are retained for non-landing use.

Each variant's class string SHALL exactly reproduce the current hand-rolled classes from `+page.svelte`, prefixed with `h-auto` to defeat the stock `h-8`/`h-9` fixed-height (which would otherwise squash the padding-based sizing). The full mapping:

| Variant           | Reproduces (current `+page.svelte` line) | Class string (illustrative)                                                                                                                                                     |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `login`           | L86-90                                   | `h-auto bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg hover:opacity-90 transition-all active:scale-95`                                                      |
| `hero-primary`    | L125-129                                 | `h-auto bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-headline-md shadow-sm hover:shadow-md transition-all active:scale-95`                        |
| `hero-outline`    | L131-135                                 | `h-auto border-2 border-primary text-primary px-xl py-md rounded-lg font-headline-md hover:bg-primary/5 transition-all active:scale-95`                                         |
| `view-all`        | L153-155                                 | `h-auto text-primary font-label-lg flex items-center gap-xs hover:underline`                                                                                                    |
| `become-partner`  | L278-282                                 | `h-auto bg-on-primary-container text-white px-xl py-md rounded-full font-headline-md hover:opacity-90 transition-all active:scale-95`                                           |
| `sponsorship-kit` | L284-288                                 | `h-auto bg-white/20 text-on-primary-container px-xl py-md rounded-full font-headline-md border border-on-primary-container/30 hover:bg-white/30 transition-all active:scale-95` |
| `join`            | L466-468                                 | `h-auto bg-primary text-on-primary px-4 py-2 hover:opacity-90`                                                                                                                  |

**Alternative considered:** a grouped matrix (`variant="pill" tone="primary"`) — rejected because the 7 styles differ in padding, radius, font, and bg simultaneously; a matrix would need 3-4 axes and be harder to read than 7 named variants.

### Decision 3: Card variant taxonomy — `bento` + `bento-primary` + `stats`

The 5 card-like containers map to 3 variants:

| Variant         | Used by                                                          | Reproduces                                                                                                         |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `bento`         | Large Feature (L173), Small Story 1 (L206), Small Story 2 (L229) | `bg-surface-container-lowest rounded-xl talam-shadow ring-0` + per-usage padding/layout/grid-placement via `class` |
| `bento-primary` | Small Story 3 (L249)                                             | `bg-primary text-on-primary rounded-xl ring-0` + per-usage layout via `class`                                      |
| `stats`         | CTA stats panel (L292)                                           | `bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`                              |

All three include `ring-0` to defeat the stock `ring-1 ring-foreground/10`. Grid placement (`md:col-span-2`, `md:row-span-2`, etc.) and internal flex layout (`flex flex-col justify-between`, `flex gap-md items-center`) remain per-usage via `class`, because they are layout concerns, not card styling. The stock `default`/`sm` sizes are retained. `card.svelte` is migrated from its current plain `cn(...)` string to a `tv()` config.

### Decision 4: Badge — install then overwrite entirely with `tv`

`pnpm dlx shadcn-svelte@latest add badge --yes --overwrite` creates the stock `badge/` files, then `badge.svelte` is overwritten with a `tv()` config defining a `pill` variant: `bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1`. The stock shadcn badge variants (`default`, `secondary`, `destructive`, `outline`) MAY be retained in the `tv` config for future use, but the `pill` variant is the normative one for the landing hero. The hero `<span>` pill (L110-114) becomes `<Badge variant="pill">Pekanbaru Heritage & Culture</Badge>`.

### Decision 5: Input — stock + heavy per-usage override, accept the wrapper `<div>`

The 2 input usages diverge: the header search input lives inside a `rounded-full border` pill container (`w-40`); the footer email input lives inside a `<form class="flex">` next to the Join button (`w-full`). Both use `<Input class="...">` where the `class` prop overrides the inner `<input>`'s stock classes:

- Search: `class="border-none bg-transparent rounded-none p-0 h-auto w-40 text-label-md focus-visible:ring-0 focus-visible:border-transparent outline-none"`
- Email: `class="border-none bg-transparent rounded-none p-0 h-auto w-full text-label-md px-4 py-2 focus-visible:ring-0 focus-visible:border-transparent outline-none"`

The structural wrapper `<div class="flex w-full flex-col gap-1.5">` is accepted as-is (it adds an extra div but `w-full` + single-child `flex-col` is visually harmless inside both containers). No `label`/`hint`/`error` props are passed (so no extra label/message elements render).

### Decision 6: Visual preservation enforced via `h-auto`, `ring-0`, and explicit `font-*` weight

Three specific defeats are normative because tailwind-merge alone won't handle them:

- **`h-auto` on every Button variant** — stock `h-8`/`h-9` (fixed height) would squash the current `py-*` padding-based sizing; `h-auto` is the explicit defeat.
- **`ring-0` on every Card variant** — stock `ring-1 ring-foreground/10` would add a visible ring the current cards don't have; `ring-0` is the explicit defeat.
- **Explicit `font-bold`/`font-medium` where the current classes rely on `text-*` token's implicit weight** — the `--text-headline-md--font-weight: 600` token sets weight via the `text-headline-md` utility, but tailwind-merge may not know `text-*` sets weight, so the stock `font-medium` (500) could win. If a current button used `font-headline-md` (family) + `text-headline-md` (size+weight) without an explicit `font-bold`/`font-semibold`, the variant SHALL add the explicit weight class to match. (In practice, the current buttons use `font-headline-md` for family and rely on the token's weight; the variants will include `font-semibold` where the token specifies 600.)

## Risks / Trade-offs

- **[tailwind-merge unpredictability with custom token classes]** → The `font-headline-md` (family) and `text-headline-md` (size) utilities ARE recognized by tailwind-merge (Tailwind v4 generates them from `--font-*`/`--text-*` tokens), so conflicts with stock `text-sm`/`font-medium` resolve correctly. But `talam-shadow`, `px-margin-desktop`, and other `layout.css` component classes are NOT recognized — they coexist with stock defaults. Mitigation: the Card/Input variants avoid relying on those custom classes inside the component; they are passed per-usage via `class` where needed, and the stock defaults they conflict with (`px-3`, `py-2` for Input) are explicitly defeated (`p-0`).
- **[Input wrapper div breaks pill/form layout]** → The extra `<div class="flex w-full flex-col gap-1.5">` around the inner `<input>` changes the DOM structure. Mitigation: `w-full` + single-child `flex-col` is visually harmless inside the pill's `flex items-center` container and the form's `flex` container; verified in the smoke test (task 6.4). If it does break, fall back to raw `<input>` for that one usage (the Input non-goal is not absolute).
- **[Badge CLI overwrite loses stock variants]** → Overwriting `badge.svelte` with a custom `tv` config removes the stock shadcn badge variants unless explicitly retained. Mitigation: the new `tv` config SHALL retain stock variants (`default`, `secondary`, `destructive`, `outline`) alongside the `pill` variant, so future non-landing usages aren't blocked.
- **[Button variant bloat — 7 variants in one `tv` config]** → `button.svelte` grows significantly. Mitigation: 7 named variants is still readable (each is one line); the alternative (a matrix) was rejected as harder to read. Accept the bloat as the cost of explicitness.
- **[Spec/impl drift on the Button requirement]** → The `shadcn-components` spec currently describes an aspirational "pill radius, label-lg" Button that was never applied. This change makes the variants real AND updates the spec to match, fixing the drift as a side effect.
- **[Visual regression on the landing page]** → The whole point is pixel-equivalence, but `cn`/tailwind-merge edge cases could cause subtle drift (a missing defeat, an unrecognized conflict). Mitigation: the verify phase (tasks 6.1-6.4) runs `pnpm check` + `pnpm lint` + `pnpm test:unit` + a manual visual diff; any drift is caught before archive.

## Migration Plan

1. **Install Badge** — `pnpm dlx shadcn-svelte@latest add badge --yes --overwrite` (creates `src/lib/components/ui/badge/`).
2. **Customize `button.svelte`** — extend the existing `buttonVariants` `tv()` with the 7 project variants (each prefixed with `h-auto`); retain stock variants + sizes.
3. **Migrate `card.svelte` to `tv()`** — replace the plain `cn(...)` string with a `cardVariants` `tv()` config defining `default`, `bento`, `bento-primary`, `stats`; update `card.svelte` to use `cardVariants({ variant, size })` + `className` via `cn`.
4. **Overwrite `badge.svelte`** — replace the stock file with a `tv()`-based config retaining stock variants + adding `pill`.
5. **Migrate `+page.svelte`** — replace the 7 `<button>` with `<Button variant="...">`, the 5 card `<div>` with `<Card variant="..." class="...layout...">`, the hero `<span>` pill with `<Badge variant="pill">`, and the 2 `<input>` with `<Input class="...heavy override...">`. Leave all other markup (header scroll logic, hero bg, headings, partner logos, progress bar, footer nav `<a>`, social links, copyright) untouched.
6. **Verify** — `pnpm check` → `pnpm lint` (scoped to touched files if repo-wide drift) → `pnpm test:unit -- --run` → manual visual diff in `pnpm dev` (scroll, hover states, mobile viewport, anchor links).

**Rollback:** revert `button.svelte`, `card.svelte`, `badge.svelte` to their pre-change state (or `git checkout`), delete the `badge/` dir if it was newly created, and revert `+page.svelte` to its pre-change raw elements. No data, no token, no dependency rollback beyond removing the badge dir.

## Open Questions

- **Button variant taxonomy refinement** — 7 named variants is the design choice, but during implementation a cleaner grouping may emerge (e.g. `view-all` could become `variant="link" class="font-label-lg flex items-center gap-xs"` if the stock `link` is close enough). Deferred to implementation judgment; the spec normatively requires the 7 visuals, not the exact variant count.
- **Whether to retain stock Badge variants** — the design says retain them, but if the `pill` variant is the only one used project-wide, dropping stock variants simplifies `badge.svelte`. Deferred; default is retain.
