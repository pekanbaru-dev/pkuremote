## MODIFIED Requirements

### Requirement: Card component is configured with bento variants

The shadcn `card` component SHALL be installed under `$lib/components/ui/card/`. Its `card.svelte` SHALL use a `cardVariants` `tv()` config (replacing the current plain `cn(...)` string) defining the variants `default` (stock, for general use), `bento` (`bg-surface-container-lowest rounded-xl talam-shadow ring-0`), `bento-primary` (`bg-primary text-on-primary rounded-xl ring-0`), and `stats` (`bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`). The `bento`, `bento-primary`, and `stats` variants SHALL each include `ring-0` to defeat the stock `ring-1 ring-foreground/10`. Grid placement (`tablet:col-span-*`, `tablet:row-span-*`) and internal flex layout (`flex flex-col justify-between`, `flex gap-md items-center`, etc.) remain per-usage via the `class` prop, not via variant.

#### Scenario: Bento card renders without a ring

- **WHEN** `<Card variant="bento" class="tablet:col-span-2 p-lg flex flex-col justify-between">` is rendered
- **THEN** its computed classes include `bg-surface-container-lowest rounded-xl talam-shadow ring-0` and do NOT include `ring-1`, pixel-equivalent to the pre-migration bento card `<div>`.

#### Scenario: Bento-primary accent card renders with primary fill

- **WHEN** `<Card variant="bento-primary" class="tablet:col-span-1 p-md flex flex-col justify-center items-center text-center">` is rendered
- **THEN** its computed classes include `bg-primary text-on-primary rounded-xl ring-0`, pixel-equivalent to the pre-migration accent bento card.

#### Scenario: Stats card renders with glass background

- **WHEN** `<Card variant="stats" class="p-lg">` is rendered
- **THEN** its computed classes include `bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0`, pixel-equivalent to the pre-migration CTA stats panel.

#### Scenario: Stock default card variant preserved

- **WHEN** a `<Card>` (no variant prop) is rendered on a non-landing route
- **THEN** it uses the stock card styling (`bg-card rounded-xl ring-1 ring-foreground/10 py-4 gap-4 text-sm`), unchanged by the bento variant additions.
