# stitch-100pct Specification

## Purpose

TBD - created by archiving change stitch-100pct-landing. Update Purpose after archive.

## Requirements

### Requirement: Stitch font-size and color tokens are defined as compound values matching `tmp/index.html`

The `src/routes/layout.css` `@theme` block SHALL contain the following seven text-size tokens, each as a compound value with the four properties Tailwind v4 expects (size, line-height, letter-spacing, font-weight) so that `text-headline-xl`, `text-headline-lg`, `text-headline-md`, `text-body-lg`, `text-body-md`, `text-label-lg`, `text-label-md` all generate as Tailwind utilities:

- `--text-headline-xl`: 48px / 56px / -0.02em / 800
- `--text-headline-lg`: 32px / 40px / (no letter-spacing) / 600
- `--text-headline-md`: 24px / 32px / (no letter-spacing) / 600
- `--text-body-lg`: 18px / 28px / (no letter-spacing) / 400
- `--text-body-md`: 16px / 24px / (no letter-spacing) / 400
- `--text-label-lg`: 14px / 20px / 0.05em / 600
- `--text-label-md`: 12px / 16px / (no letter-spacing) / 500

The three additional color tokens that the Stitch HTML references but the project is missing SHALL also be added:

- `--color-inverse-primary: #e7c268`
- `--color-on-primary-fixed: #251a00`
- `--color-on-primary-fixed-variant: #5a4400`

#### Scenario: Tailwind generates the text utilities

- **WHEN** a Svelte file uses `class="text-headline-xl"`
- **THEN** the rendered text is 48px / 56px / -0.02em / 800.

#### Scenario: Tailwind generates the body utilities

- **WHEN** a Svelte file uses `class="text-body-lg"`
- **THEN** the rendered text is 18px / 28px / 400.

#### Scenario: Tailwind generates the label utilities

- **WHEN** a Svelte file uses `class="text-label-lg"`
- **THEN** the rendered text is 14px / 20px / 0.05em / 600.

### Requirement: Homepage is a byte-for-byte translation of the Stitch HTML at `tmp/index.html`

The homepage at `/` SHALL render the same DOM structure, the same class names, the same text, and the same Tailwind utility class strings as the Stitch HTML at `tmp/index.html` (line 121 onwards), with exactly three substitutions:

- The brand wordmark "Pekanbaru Community" is replaced with "PKUBersua" in the header `<div>` and the footer `<div>`.
- The page title `<title>Pekanbaru Community | Celebrating Heritage</title>` is replaced with `<title>PKUBersua — [TAGLINE_PKUBERSUA_TBD]</title>`.
- The Stitch third-party partner logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia) are downloaded from the Stitch CDN and re-rendered as `static/partners/logo-{1,2,3,4}.svg` (inline SVG with `currentColor` fill), referenced via `<img alt="<brand name> Logo" class="h-12 w-auto object-contain" src="/partners/logo-{1,2,3,4}.svg">`.

The seven sections (header, hero, events, bento, Empower CTA, Trusted by Partners, footer) and all the section-internal markup (bento tiles, Empower CTAs, partner logo tiles, footer columns) SHALL match the Stitch HTML element-for-element and class-for-class.

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

### Requirement: Stitch HTML classes are applied verbatim via `class={...}` to defeat class merging

Where the Stitch HTML uses a class name that conflicts with the project's existing utility classes (e.g., a `Button` component that adds its own `rounded-lg` class, defeating the Stitch `rounded-full` class on the Login/Register button), the Svelte translation SHALL apply the Stitch class name as a literal `class="..."` attribute on the element, NOT through a reusable component. The exception is the `EventCard`, which the project reuses (and the Stitch HTML's event-card class set is applied via Tailwind's class merging on the `<EventCard>` component).

#### Scenario: Login/Register button is rounded-full

- **WHEN** the visitor inspects the Login/Register button
- **THEN** its computed border-radius is `9999px` (rounded-full), not the `rounded-lg` that the project's `Button` component applies by default. This is achieved by either (a) using a plain `<button class="...">` element with the Stitch classes applied verbatim, or (b) using the project's `Button` component with a `class` override that includes `rounded-full` and is applied after the component's own classes.

#### Scenario: Stitch event card classes are applied

- **WHEN** the EventCard component is used
- **THEN** the rendered event card has the exact Stitch class set: `bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden group`.

### Requirement: The three Stitch dummy events are the only events in the dummy data

`src/lib/features/events/services/dummy-events.ts` SHALL contain exactly three events (matching the Stitch HTML's "Upcoming Community Gatherings" section):

1. "Traditional Talam Masterclass" — slug `traditional-talam-masterclass`, category `workshop`, categoryLabel `Culinary`, categorySecondary `Workshop`, date 2024-10-24.
2. "Riau Heritage Night" — slug `riau-heritage-night`, category `meetup`, categoryLabel `Culture`, categorySecondary `Festival`, date 2024-11-02.
3. "Local Business Mixer" — slug `local-business-mixer`, category `meetup`, categoryLabel `Business`, categorySecondary `Networking`, date 2024-11-15.

Each event SHALL have the full `Event` type (banner, location, excerpt, body, etc.) with the `categoryLabel` and `categorySecondary` fields filled. The five past events (UI Typography, Svelte 5 Runes, Ngobrol Santai, Malam Membaca, Ngoprek ESP32, Intro to Data Engineering) SHALL be removed from the dummy data.

#### Scenario: Visitor sees three Stitch events on the homepage

- **WHEN** a visitor opens the homepage
- **THEN** the events section renders the three Stitch events (Traditional Talam Masterclass, Riau Heritage Night, Local Business Mixer) in the order they are defined in the dummy data.

#### Scenario: Event detail page still works for past events

- **WHEN** a developer navigates to `/events/ui-typography-deep-dive` after the change lands
- **THEN** the event detail page returns a 404 (the dummy data only contains the three Stitch events, not the old five past events). A future change can re-add past events as a separate "archive" route.

### Requirement: The four third-party partner logos are downloaded as inline SVG

`static/partners/logo-{1,2,3,4}.svg` SHALL be a 200×60 viewBox SVG with `fill="currentColor"` rendering the third-party brand wordmark:

1. `logo-1.svg` — "Pekanbaru City" (Stitch logo URL: `lh3.googleusercontent.com/aida-public/AB6AXuDyVuZ1vWrjQRMOgKsjgvrGb6j1Bc6Gdy7KO0WDOi7C45cGXsvbRDYAs_mxtcjiXKOPGCw8Zr9pj3kMd-9gSpvY8Lkx9Xq8zPBtgVU8HaBKd76BHIqXNARi6RUVacpPS1WMeXFjugjtv5l9oxn7I6fkhlhiQMDsEsy1E2W7uAlAnMw26cFTYh9NVa1yoowofi0f-vtoFIdYa0MSiWiIq0gjuLkcM_Db6y2CAIOq1YAxlBvNRBWL2R9HsPZHlyytsr4IQlLo81yPVaWT`).
2. `logo-2.svg` — "Bank Riau" (Stitch logo URL: `...AB6AXuAwPpU78EXHG85Gmjr3YB1oFh4UrBW8Pyull_-S5-NRFEQZtyJMw2nwPZgf_pcL1kkQosET00-NxVl6-7-f_q77vO3QzjQfvBsj4kduVcGQnB82UM-kxK6Lz5_Qy4ERVIp-NUcOyi9dcdGNgTqTHOKjrJ0_Z79ehwyOQukAsr7e0b_xGl6gfh6rWcY_8g6gvSXKb9b5B2glb3Jp1yCGnt0EyRzBB4MmNJ9l8BZyKPv8epJmg31ezI9jXuO256_33g53i-dNNsiQ7MxQ`).
3. `logo-3.svg` — "Visit Riau" (Stitch logo URL: `...AB6AXuDDVyy4JyN9W4d46tCMFxO3ia-f-wdsm7cLysPGJOYFeDYYGxV2rOYA3_7LtPg1OITMtSkiRpMBYbxMEpHSbmWDFdtLmU2d2P6y6pgPkQeclm0pnADzq5x2Li73p3hiflfIVK8OWK7WNKo_sK1TrqQrD3nXAQC6hkecIGSOjGs1GsrFjxsdyHGeaAWhH79gYawVh5O52871azbxu2z1mF8ydToQW9sCTDvn57sS9wYIeYBhnqHYicWIhiaIJoJUD7NgxoETyfyyWhqS`).
4. `logo-4.svg` — "Wonderful Indonesia" (Stitch logo URL: `...AB6AXuDTqzs82EnctTFGrZ2yFRNCHFikYSlCTPjgNP8l6gGF_J0pr5axZUxQPumhjV4GpCmlrqpTOQe9bI3DlzfqWUUOMaM7kQlhUy2htaVgr_ZPtz70z_7v6ZVCYoI6e5v7Fox9Pdty7uyLbTduu-1OfFNQofZDTFeTjbiuG5jbWiX1698BMEVwVpdgMRJjnbYCnoCqSmSWU4qLvEE9GpscEWSDCh7dJF7T6Xy0ttseTfkGXvM_TpkKdxH4HLLZ_45u7n_O_13cUu92SyRF`).

Each SVG SHALL be downloaded from the Stitch CDN (or re-rendered with a similar shape), with the text replaced by the brand name and `fill="currentColor"`.

#### Scenario: Visitor sees the four logos

- **WHEN** a visitor scrolls to the Trusted by Partners section
- **THEN** the four logos render in grayscale at 40% opacity (default), and colorize to 100% opacity on hover.
