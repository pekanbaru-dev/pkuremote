## Why

The landing page (`src/routes/+page.svelte`) renders 7 raw `<button>` elements, 2 raw `<input>` elements, 5 card-like `<div>` containers, and 1 pill-badge `<span>` — all with hand-rolled Tailwind class strings — while 44 shadcn-svelte components sit installed but unused in `src/lib/components/ui/`. The existing `shadcn-components` spec already normatively says "`.btn-primary` is REMOVED; its role is filled by the shadcn Button component," but the landing page never actually adopted that. This duplicates styling logic across per-element class strings, leaves the component library as dead weight, and blocks reuse on future routes. Migrating to shadcn primitives — customized via `tailwind-variants` (`tv`) so the exact current visual is preserved — consolidates styling into named, reusable variants.

## What Changes

- **Customize `button.svelte` via `tv()`** with project-specific variants that reproduce the 7 current button styles exactly (header login pill, hero "Explore Events" filled + "Learn History" outlined, events "View All" link, CTA "Become a Partner" + "Sponsorship Kit", footer "Join"). Variants handle `h-auto` (to defeat the stock `h-8`/`h-9` fixed-height that conflicts with the current padding-based sizing). The 7 raw `<button>` elements in `+page.svelte` are replaced with `<Button variant="...">`.
- **Customize `card.svelte` via `tv()`** with bento variants (`bento` = `bg-surface-container-lowest talam-shadow ring-0`, `bento-primary` = `bg-primary text-on-primary`, `stats` = `bg-white/40 backdrop-blur rounded-2xl`) that reproduce the 5 current card-like containers. Variants include `ring-0` to defeat the stock `ring-1 ring-foreground/10`. The 5 card `<div>`s in the bento grid + CTA stats panel are replaced with `<Card variant="...">`.
- **Install Badge** (`pnpm dlx shadcn-svelte@latest add badge --yes --overwrite`), then **overwrite `badge.svelte`** with a `tv()`-based custom `pill` variant reproducing the hero pill (`bg-secondary-container text-on-secondary-container rounded-full font-label-lg`). The hero `<span>` pill is replaced with `<Badge variant="pill">`.
- **Use stock `<Input>` with heavy per-usage class override** for the 2 input cases (header search pill, footer email). The Input component's wrapper `<div>` is structural and accepted as-is; only the inner `<input>` is overridden (`border-none bg-transparent rounded-none p-0 h-auto focus-visible:ring-0` + the current sizing/width classes) to reproduce the current bare-input-in-custom-container layout.
- **Separator** is already installed; no current section dividers exist on the landing page to migrate (sections use bg-color transitions), so it is left unused — no change.
- **Skipped (no component or banned):** NavigationMenu is explicitly banned on the landing page per `AGENTS.md` (its `hover:bg-muted` background-fill conflicts with the editorial nav aesthetic), so header + footer nav links stay raw `<a>`. Headings, hero background image layers, partner logo grid, the blog progress bar, social icon links, and the copyright line have no corresponding shadcn-svelte primitive and stay raw HTML.
- **Visual preservation is normative:** the rendered output after migration SHALL be pixel-equivalent to the pre-migration landing page. All customization happens inside the component `tv()` definitions and per-usage `class` overrides; no design token, color, typography, spacing, or radius value changes.

## Capabilities

### New Capabilities

<!-- None. This change modifies two existing capabilities. -->

### Modified Capabilities

- `shadcn-components`: The "Button component is installed and configured" requirement is updated to reflect the actual custom project variants (the spec currently describes an aspirational "ochre fill, pill radius, label-lg" customization that was never applied to the stock `button.svelte` — this change makes the variants real and normative). A new "Badge component is installed and configured" requirement is added (the `pill` variant). The "Separator component is installed" requirement is unchanged. The Card component — currently undocumented in the spec despite being installed — gets a new requirement documenting its `bento`/`bento-primary`/`stats` variants. The NavigationMenu requirement is unchanged (still installed, still not used on landing).
- `landing-page`: The "Reusable component classes are defined" requirement is updated to reflect actual shadcn component usage on the landing page: all CTAs/buttons render via `<Button variant="...">`, bento + stats containers via `<Card variant="...">`, the hero pill via `<Badge variant="pill">`, and the search/email fields via `<Input>` (with per-usage override). The spec's existing claim that "header and footer navigation is rendered via the shadcn NavigationMenu component" is corrected — NavigationMenu remains explicitly unused on the landing page per `AGENTS.md`. Behavioral requirements (header sticky/scroll-aware, hero, sections, footer) are unchanged because the visual is preserved.

## Impact

- **`src/lib/components/ui/button/button.svelte`** — `buttonVariants` `tv()` extended with project variants; stock variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) retained for non-landing use.
- **`src/lib/components/ui/card/card.svelte`** — `tv()` introduced (currently uses a plain `cn(...)` string) with `bento`/`bento-primary`/`stats` variants; stock `default`/`sm` sizes retained.
- **`src/lib/components/ui/badge/`** — newly installed via CLI, then `badge.svelte` overwritten with a `tv()`-based `pill` variant (replacing the stock shadcn badge entirely).
- **`src/routes/+page.svelte`** — 7 `<button>` → `<Button>`, 5 card `<div>` → `<Card>`, 1 `<span>` pill → `<Badge>`, 2 `<input>` → `<Input class="...">`. The scroll-aware header logic, hero bg layers, headings, partner logos, progress bar, social links, and copyright are untouched.
- **Dependencies:** Badge install pulls `tailwind-variants` (already present via Button) — no new `package.json` deps expected. The `shadcn-svelte` CLI runs via `pnpm dlx` (no global install).
- **Specs:** `openspec/specs/shadcn-components/spec.md` and `openspec/specs/landing-page/spec.md` receive delta modifications (synced at archive time).
- **No token / typography / radius changes.** No change to `src/routes/layout.css` (the `@theme` block, `.talam-shadow`, `.container-page`, etc. are all untouched).
- **No change to `AGENTS.md`** — the NavigationMenu ban stands.
- **Other routes unaffected** — `events/[slug]`, `login`, `myprofile` keep their own treatments; the Button/Card/Badge variants are available to them but not forced.
