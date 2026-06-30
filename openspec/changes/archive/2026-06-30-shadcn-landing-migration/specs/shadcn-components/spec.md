## MODIFIED Requirements

### Requirement: Button component is installed and configured

The shadcn `button` component SHALL be installed under `$lib/components/ui/button/`. Its `buttonVariants` `tv()` config SHALL retain the stock shadcn variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`) for general (non-landing) use, AND SHALL define the following project-specific variants that reproduce the exact Tailwind class strings previously hand-rolled on the landing page's raw `<button>` elements:

- `login` — header Login/Register pill: `h-auto bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg hover:opacity-90 transition-all active:scale-95`
- `hero-primary` — hero "Explore Events" filled CTA: `h-auto bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-headline-md shadow-sm hover:shadow-md transition-all active:scale-95`
- `hero-outline` — hero "Learn History" outlined CTA: `h-auto border-2 border-primary text-primary px-xl py-md rounded-lg font-headline-md hover:bg-primary/5 transition-all active:scale-95`
- `view-all` — events section "View All Events" link: `h-auto text-primary font-label-lg flex items-center gap-xs hover:underline`
- `become-partner` — CTA "Become a Partner": `h-auto bg-on-primary-container text-white px-xl py-md rounded-full font-headline-md hover:opacity-90 transition-all active:scale-95`
- `sponsorship-kit` — CTA "Sponsorship Kit" glass: `h-auto bg-white/20 text-on-primary-container px-xl py-md rounded-full font-headline-md border border-on-primary-container/30 hover:bg-white/30 transition-all active:scale-95`
- `join` — footer form "Join" submit: `h-auto bg-primary text-on-primary px-4 py-2 hover:opacity-90`

Every project variant SHALL include `h-auto` to defeat the stock `h-8`/`h-9` fixed-height (which would otherwise squash the padding-based sizing). The rendered visual of each project variant SHALL be pixel-equivalent to the pre-migration raw `<button>` it replaces. (This replaces the previous aspirational spec text about "ochre fill, pill radius, 0.75rem 1.5rem padding, hover darken to `--primary-hover`" which was never applied to the stock `button.svelte`.)

#### Scenario: Stock default variant is preserved for non-landing use

- **WHEN** a `<Button>` (no variant prop) is rendered on a non-landing route
- **THEN** it uses the stock `default` variant (`bg-primary text-primary-foreground`, `rounded-lg`, `h-8`), unchanged from before this change.

#### Scenario: Login button renders as a pill with h-auto

- **WHEN** `<Button variant="login">Login/Register</Button>` is rendered
- **THEN** its computed classes include `bg-primary text-on-primary rounded-full px-lg py-sm font-label-lg h-auto hover:opacity-90`, and its rendered height is padding-based (not the stock 32px `h-8`), pixel-equivalent to the pre-migration header Login/Register button.

#### Scenario: Hero CTAs render filled and outlined

- **WHEN** `<Button variant="hero-primary">` and `<Button variant="hero-outline">` are rendered
- **THEN** the former has `bg-primary-container text-on-primary-container rounded-lg font-headline-md shadow-sm` and the latter has `border-2 border-primary text-primary rounded-lg font-headline-md`, both with `h-auto` and `px-xl py-md`, pixel-equivalent to the pre-migration hero CTAs.

#### Scenario: CTA buttons render with their distinct fills

- **WHEN** `<Button variant="become-partner">` and `<Button variant="sponsorship-kit">` are rendered
- **THEN** the former has `bg-on-primary-container text-white rounded-full` and the latter has `bg-white/20 border border-on-primary-container/30 rounded-full`, both with `font-headline-md px-xl py-md h-auto`, pixel-equivalent to the pre-migration CTA buttons.

#### Scenario: View All and Join buttons render their minimal styles

- **WHEN** `<Button variant="view-all">` and `<Button variant="join">` are rendered
- **THEN** the former has `text-primary font-label-lg flex items-center gap-xs hover:underline` and the latter has `bg-primary text-on-primary px-4 py-2 h-auto`, pixel-equivalent to the pre-migration raw buttons.

## ADDED Requirements

### Requirement: Badge component is installed and configured

The shadcn `badge` component SHALL be installed under `$lib/components/ui/badge/` via `pnpm dlx shadcn-svelte@latest add badge --yes --overwrite`. After installation, `badge.svelte` SHALL be overwritten with a `tv()`-based config that retains the stock shadcn badge variants (`default`, `secondary`, `destructive`, `outline`) AND defines a `pill` variant: `bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1`. The `pill` variant is normative for the landing page hero badge.

#### Scenario: Hero badge renders as a pill

- **WHEN** `<Badge variant="pill">Pekanbaru Heritage & Culture</Badge>` is rendered
- **THEN** its computed classes include `bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1`, pixel-equivalent to the pre-migration hero `<span>` pill.

#### Scenario: Stock badge variants retained for future use

- **WHEN** a `<Badge>` (no variant prop, or `variant="secondary"`) is rendered on a non-landing route
- **THEN** it uses the stock shadcn badge styling, unchanged by the `pill` addition.

### Requirement: Card component is configured with bento variants

The shadcn `card` component SHALL be installed under `$lib/components/ui/card/`. Its `card.svelte` SHALL use a `cardVariants` `tv()` config (replacing the current plain `cn(...)` string) defining the variants `default` (stock, for general use), `bento` (`bg-surface-container-lowest rounded-xl talam-shadow ring-0`), `bento-primary` (`bg-primary text-on-primary rounded-xl ring-0`), and `stats` (`bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`). The `bento`, `bento-primary`, and `stats` variants SHALL each include `ring-0` to defeat the stock `ring-1 ring-foreground/10`. Grid placement (`md:col-span-*`, `md:row-span-*`) and internal flex layout (`flex flex-col justify-between`, `flex gap-md items-center`, etc.) remain per-usage via the `class` prop, not via variant.

#### Scenario: Bento card renders without a ring

- **WHEN** `<Card variant="bento" class="md:col-span-2 p-lg flex flex-col justify-between">` is rendered
- **THEN** its computed classes include `bg-surface-container-lowest rounded-xl talam-shadow ring-0` and do NOT include `ring-1`, pixel-equivalent to the pre-migration bento card `<div>`.

#### Scenario: Bento-primary accent card renders with primary fill

- **WHEN** `<Card variant="bento-primary" class="md:col-span-1 p-md flex flex-col justify-center items-center text-center">` is rendered
- **THEN** its computed classes include `bg-primary text-on-primary rounded-xl ring-0`, pixel-equivalent to the pre-migration accent bento card.

#### Scenario: Stats card renders with glass background

- **WHEN** `<Card variant="stats" class="p-lg">` is rendered
- **THEN** its computed classes include `bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`, pixel-equivalent to the pre-migration CTA stats panel.

#### Scenario: Stock default card variant preserved

- **WHEN** a `<Card>` (no variant prop) is rendered on a non-landing route
- **THEN** it uses the stock card styling (`bg-card rounded-xl ring-1 ring-foreground/10 py-4 gap-4 text-sm`), unchanged by the bento variant additions.
