## MODIFIED Requirements

### Requirement: Hero is a fixed 870px section on tablet+, fluid on mobile

The homepage hero SHALL render as a `<section>` with `class="relative w-full h-auto min-h-[870px] tablet:h-[870px] bg-surface overflow-hidden flex items-center hero-clip"`. Inside the section, in document order, the following elements SHALL be rendered: (1) an absolute-positioned `<div>` with `class="absolute inset-0 z-0 opacity-[0.07] pointer-events-none hero-pattern"` (batik pattern fill); (2) an absolute-positioned `<div>` containing a background image of the Great Mosque of An-Nur (Riau) at 40% opacity and a `bg-gradient-to-r from-surface via-surface/80 to-transparent` overlay; (3) a content container with `class="relative z-10 px-margin-mobile tablet:px-margin-desktop max-w-[1280px] mx-auto w-full"` containing a "Pekanbaru Heritage & Culture" pill badge (`bg-secondary-container text-on-secondary-container rounded-full font-label-lg`), the h1 "Celebrating the Heart of Riau's Local Heritage" rendered at `text-headline-lg tablet:text-headline-xl` (with "Riau's Local Heritage" rendered as a `<span class="text-secondary">`), one short descriptive sentence at `font-body-md tablet:font-body-lg`, and two CTAs ("Explore Events" filled `bg-primary-container` `rounded-lg`, "Learn History" outlined `border-2 border-primary text-primary` `rounded-lg`).

#### Scenario: Hero renders all elements

- **WHEN** a visitor loads the homepage
- **THEN** the page renders a hero with the batik pattern overlay, the background image, the gradient fade, the pill badge, the h1 with the secondary-color span, the descriptive sentence, and the two CTAs in that order.

#### Scenario: Hero height is 870px on tablet+, fluid on mobile

- **WHEN** the hero is rendered at a viewport < 768px
- **THEN** its height is determined by content (fluid, with a `min-height: 870px` floor), ensuring no headline truncation on mobile.
- **WHEN** the hero is rendered at a viewport ≥ 768px
- **THEN** its computed height is 870px and the hero-clip polygon is applied to its bottom edge, matching the Stitch design.

#### Scenario: Hero type scales smoothly

- **WHEN** the hero headline is rendered across viewport sizes
- **THEN** it scales from `text-headline-lg` (32px) at < 768px to `tablet:text-headline-xl` (48px) at ≥ 768px; the descriptive sentence scales from `font-body-md` (16px) to `tablet:font-body-lg` (18px) across the same threshold.

### Requirement: Bento news grid is 4 tiles with mobile-first stacking

The "Latest News & Stories" bento section SHALL render a 4-tile mosaic (`grid grid-cols-1 h-auto tablet:grid-cols-4 grid-rows-2 tablet:h-[600px] gap-gutter`) with: a 2×2 `tablet:col-span-2 tablet:row-span-2` "Community Feature" tile (Songket-pattern background, `text-primary font-label-lg uppercase tracking-wider mb-2 block` kicker, `font-headline-xl` h3, author avatar + "5 min read • Oct 18"), a 2×1 `tablet:col-span-2` "Local Guide" tile (image left, "5 Hidden Culinary Gems" h4), a 1×1 `tablet:col-span-1` "Sponsorship Goal Reached!" tile (with the 100% progress bar), and a 1×1 `tablet:col-span-1` "Join the Team" gold CTA tile. On mobile (< 768px), the grid SHALL collapse to a single-column stack and each tile SHALL size to its content height (no row-span bleed).

#### Scenario: Bento news grid has 4 tiles

- **WHEN** the visitor scrolls to the bento section at ≥ 768px
- **THEN** the section renders a 4-column × 2-row mosaic (`tablet:grid-cols-4 grid-rows-2 tablet:h-[600px]`) with: a 2×2 "Community Feature" tile (Songket-pattern background, `text-primary font-label-lg uppercase tracking-wider mb-2 block` kicker, `font-headline-xl` h3, author avatar + "5 min read • Oct 18"), a 2×1 "Local Guide" tile (image left, "5 Hidden Culinary Gems" h4), a 1×1 "Sponsorship Goal Reached!" tile (with the 100% progress bar), and a 1×1 "Join the Team" gold CTA tile.

#### Scenario: Bento stack on mobile

- **WHEN** a mobile visitor (< 768px) scrolls to the bento section
- **THEN** the 4 tiles are stacked vertically with `gap-gutter` spacing, each tile at full width and sizing to its content height, without any `row-span-*` artifacts bleeding into adjacent tiles.
