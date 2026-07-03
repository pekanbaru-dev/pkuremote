## MODIFIED Requirements

### Requirement: Homepage is a byte-for-byte translation of the Stitch HTML at `tmp/index.html`

The homepage at `/` SHALL render the same DOM structure, the same class names, the same text, and the same Tailwind utility class strings as the Stitch HTML at `tmp/index.html` (line 121 onwards), with exactly three substitutions:

- The brand wordmark "Pekanbaru Community" is replaced with "PKUBersua" in the header `<div>` and the footer `<div>`.
- The page title `<title>Pekanbaru Community | Celebrating Heritage</title>` is replaced with `<title>PKUBersua — [TAGLINE_PKUBERSUA_TBD]</title>`.
- The Stitch third-party partner logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia) are downloaded from the Stitch CDN and re-rendered as `static/partners/logo-{1,2,3,4}.svg` (inline SVG with `currentColor` fill), referenced via `<img alt="<brand name> Logo" class="h-12 w-auto object-contain" src="/partners/logo-{1,2,3,4}.svg">`.

The seven sections (header, hero, events, bento, Empower CTA, Trusted by Partners, footer) and all the section-internal markup (bento tiles, Empower CTAs, partner logo tiles, footer columns) SHALL match the Stitch HTML element-for-element and class-for-class. Responsive breakpoint prefixes in class strings SHALL use the semantic names (`mobile:`, `tablet:`, `desktop:`) defined in `@theme`, not the removed default names (`sm:`, `md:`, `lg:`).

#### Scenario: Reader sees a byte-equivalent page

- **WHEN** a visitor opens `/` in a browser at 1280px viewport
- **THEN** the rendered HTML matches the Stitch HTML at `tmp/index.html` element-for-element, with the three substitutions above, and the visual output is indistinguishable from the Stitch design.

#### Scenario: Header has 4 nav links

- **WHEN** the visitor inspects the header nav
- **THEN** the four links "Home", "Events", "Blog", "Partnership" are present, with the "Home" link styled as the active link (`text-primary font-bold border-b-2 border-primary pb-1`).

#### Scenario: Hero h1 is 48px

- **WHEN** the hero h1 renders
- **THEN** its computed font-size is 48px, line-height 56px, font-weight 800, letter-spacing -0.02em, color `oklch(0.483 0.097 87)`.

#### Scenario: Event cards are 192px tall

- **WHEN** the visitor views the events section
- **THEN** the three event cards each have a 192px-tall (`h-48`) banner, the Stitch `bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden group` class set, two category pills (`bg-primary/10` and `bg-secondary/10` `rounded-full text-label-md`), a `font-headline-md text-headline-md` h3, a `line-clamp-2` excerpt, a Material Symbols `calendar_today` icon next to the date, and a right-aligned `Book Now` / `RSVP` / `Register` text-button.

#### Scenario: Bento news grid has 4 tiles

- **WHEN** the visitor scrolls to the bento section
- **THEN** the section renders a 4-column × 2-row mosaic (`tablet:grid-cols-4 grid-rows-2 tablet:h-[600px]`) with: a 2×2 "Community Feature" tile (Songket-pattern background, `text-primary font-label-lg uppercase tracking-wider mb-2 block` kicker, `font-headline-xl` h3, author avatar + "5 min read • Oct 18"), a 2×1 "Local Guide" tile (image left, "5 Hidden Culinary Gems" h4), a 1×1 "Sponsorship Goal Reached!" tile (with the 100% progress bar), and a 1×1 "Join the Team" gold CTA tile.

#### Scenario: Empower CTA card

- **WHEN** the visitor scrolls to the Empower CTA section
- **THEN** the section renders a `rounded-3xl bg-primary-container p-xl` card with the `font-headline-xl text-headline-xl text-on-primary-container` h2 "Empower Your Business Through Community", the `font-body-lg text-body-lg text-on-primary-container/90` body paragraph, two rounded-full CTAs ("Become a Partner" and "Sponsorship Kit"), and a `bg-white/40 backdrop-blur-md p-lg rounded-2xl border border-white/20 talam-shadow` Community Impact metric card on the right with three labeled numbers (New Members: +1,240, Event Attendees: 5,800+, Partner Visibility: 150k Reach).

#### Scenario: Trusted by Partners is 4 logos

- **WHEN** the visitor scrolls to the partners section
- **THEN** the section renders a `grid grid-cols-2 mobile:grid-cols-4 gap-lg` 4-logo grid (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia), each in a `grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer` container with an `<img class="h-12 w-auto object-contain" src="/partners/logo-{1,2,3,4}.svg">`.

#### Scenario: Footer is 4 columns

- **WHEN** the footer renders
- **THEN** it renders a 4-column `tablet:grid-cols-4 gap-gutter` grid: a brand column (Pekanbaru Community wordmark → "PKUBersua" + tagline + 3 social-icon links with Material Symbols `public`, `alternate_email`, `share`), a "The Community" nav column, a "Support & Partnership" nav column, and a "Stay Connected" column with an email input + Join button, plus the `© 2024 Pekanbaru Community` → `© 2024 PKUBersua` line in `.label-md text-on-surface-variant`.
