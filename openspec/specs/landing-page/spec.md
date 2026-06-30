# landing-page Specification

## Purpose

Defines the structure, content, design tokens, and behavior of the public landing page at `/` — its semantic sections, OKLCH color and typography system, reusable component classes, responsive layout, and motion rules.

## Requirements

### Requirement: Page renders seven semantic sections in order

The landing page at `/` SHALL render, in this order: a sticky site header (containing the wordmark, a search bar, the nav, and a Login/Register pill button), a hero section at 870px with the batik pattern + bg image + clip-path + dual CTAs, an "Upcoming Community Gatherings" 3-column event grid, an "Empower Your Business Through Community" CTA card, a "Trusted by Local & Global Partners" 4-logo grid, and a 4-column footer with an email input. The "Event Sebelumnya" section from the previous composition is REMOVED (the Stitch design has no past-events listing on the homepage). Each section SHALL be a semantic landmark (`<header>`, `<main>` containing `<section>` blocks with `aria-labelledby`, `<footer>`).

#### Scenario: Visitor loads the landing page

- **WHEN** a visitor navigates to `/`
- **THEN** the page renders header → hero (870px) → Upcoming Community Gatherings (3-col grid) → Empower Your Business CTA → Trusted by Partners (4 logos) → 4-col footer in that order, each as a distinct semantic region.

### Requirement: Design token system defines OKLCH colors and typography

`src/routes/layout.css` SHALL define, via Tailwind v4 `@theme`, the color tokens canvas, surface, ink, muted, hairline, primary, primary-hover, primary-container, on-primary-container, secondary, secondary-container, tertiary, tertiary-container, outline, and outline-variant in OKLCH, taken from the Stitch Material-3 golden palette (canvas cream `#fefae0`, primary deep amber `#765a05`, primary-container soft yellow `#e9c46a`); the font tokens `--font-display` and `--font-body` mapped to Hanken Grotesk and `--font-label` mapped to Manrope; the radius tokens card (12px) and pill (9999px); and the text-size tokens display, headline, title, body, and label as documented in the Stitch `fontSize` table (fluid `clamp()` values for the larger sizes). The shadcn-mapped name family (`--color-background`, `--color-foreground`, `--color-primary-foreground`, `--color-border`, `--color-ring`, `--color-muted-foreground`, `--color-input`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-popover`, `--color-popover-foreground`, `--color-card`, `--color-card-foreground`) SHALL mirror the brand tokens so Tailwind generates both `bg-canvas` and `bg-background` utilities.

#### Scenario: Body text contrast against canvas

- **WHEN** the `ink` token is used for body text on the `canvas` background
- **THEN** the computed contrast ratio is at least 7:1 (recalculated against the cream canvas; if the new value drops below 7:1, the `ink` token SHALL be darkened until the ratio is satisfied).

#### Scenario: Muted text contrast against canvas

- **WHEN** the `muted` token is used for secondary text on the `canvas` background
- **THEN** the computed contrast ratio is at least 4.5:1.

#### Scenario: Primary accent stays within the One Voice budget

- **WHEN** the rendered page is analyzed for primary-accent surface coverage
- **THEN** the primary accent color occupies no more than 10% of the visible surface area at any viewport.

### Requirement: Reusable component classes are defined

`src/routes/layout.css` SHALL define the reusable classes `.container-page` (max-width 72rem, fluid horizontal padding via `clamp()`), `.measure-prose` (max-width 70ch), `.label-meta` (small uppercase-free meta text using the label font and label size from the Stitch fontSize table), and `.link-quiet` (hairline underline transitioning to primary on hover). The `.btn-primary` class is REMOVED; its role is filled by the shadcn Button component (see the `shadcn-components` spec).

On the landing page, all interactive buttons and CTAs SHALL render via the shadcn `<Button>` component using the project variants defined in the `shadcn-components` spec (`login`, `hero-primary`, `hero-outline`, `view-all`, `become-partner`, `sponsorship-kit`, `join`) — no raw `<button>` elements SHALL remain in `src/routes/+page.svelte`. The bento grid card containers and the CTA stats panel SHALL render via the shadcn `<Card>` component using the `bento`, `bento-primary`, and `stats` variants — no card-like `<div>` containers with hand-rolled `bg-surface-container-lowest talam-shadow` class strings SHALL remain. The hero pill badge SHALL render via the shadcn `<Badge variant="pill">` component — no raw `<span>` pill SHALL remain. The header search input and the footer email input SHALL render via the shadcn `<Input>` component with a per-usage `class` override that defeats the stock input styling (`border-none bg-transparent rounded-none p-0 h-auto focus-visible:ring-0`).

The 1px section dividers, when rendered, SHALL use the shadcn Separator component. (The landing page currently uses background-color transitions between sections rather than explicit dividers, so Separator is not instantiated on the landing page in this change; it remains available.)

The header and footer navigation links SHALL remain raw `<a>` elements — the shadcn NavigationMenu component is explicitly NOT used on the landing page (per `AGENTS.md`, its `hover:bg-muted` background-fill treatment conflicts with the editorial nav aesthetic). This corrects the previous spec text that claimed NavigationMenu renders the header and footer navigation.

#### Scenario: All landing buttons use the shadcn Button component

- **WHEN** the landing page is rendered
- **THEN** every button instance (header Login/Register, hero Explore Events + Learn History, events View All, CTA Become a Partner + Sponsorship Kit, footer Join) renders as `<Button variant="...">` with the corresponding project variant, and no raw `<button>` element exists in `src/routes/+page.svelte`.

#### Scenario: Bento and stats containers use the shadcn Card component

- **WHEN** the landing page's blog bento grid and CTA stats panel are rendered
- **THEN** the 5 card-like containers render as `<Card variant="bento|bento-primary|stats">` with grid-placement and internal-layout classes passed via `class`, and no hand-rolled `bg-surface-container-lowest talam-shadow` `<div>` card container exists in `src/routes/+page.svelte`.

#### Scenario: Hero pill uses the shadcn Badge component

- **WHEN** the hero section's "Pekanbaru Heritage & Culture" pill is rendered
- **THEN** it renders as `<Badge variant="pill">`, not a raw `<span>`.

#### Scenario: Search and email inputs use the shadcn Input component

- **WHEN** the header search field and footer email field are rendered
- **THEN** they render as `<Input class="...">` with per-usage overrides that defeat the stock input border/background/ring, reproducing the pre-migration bare-input-in-custom-container layout.

#### Scenario: NavigationMenu is not used on the landing page

- **WHEN** the landing page's header and footer nav are inspected
- **THEN** they consist of raw `<a>` elements (not shadcn NavigationMenu), consistent with the `AGENTS.md` ban.

#### Scenario: Quiet link hover

- **WHEN** a `.link-quiet` element is hovered or receives focus
- **THEN** its underline border and text color transition to the primary accent color.

#### Scenario: Pixel-equivalence to pre-migration visual

- **WHEN** the post-migration landing page is compared visually to the pre-migration version
- **THEN** no visual difference is detectable — all colors, typography, spacing, radii, shadows, and hover/active states are identical, because the shadcn component variants reproduce the exact pre-migration Tailwind class strings.

### Requirement: Landing page sources components from primitives and ui

The landing page (`src/routes/+page.svelte`) SHALL source simple interactive components (`Button`, `Badge`, `Input`) from `$lib/components/primitives` and composite/headless components (`Card`, etc.) from `$lib/components/ui` (shadcn-svelte). The landing page SHALL NOT import these components from `$lib/components/ui-cp` (the backup) or from the empty `$lib/components/ui/<simple-name>` paths. Landing-specific visual treatments that do not map to the canonical primitive variant contract (`intent`/`variant`/`size`/`rounded`/...) SHALL be applied via the `class` prop at the call site — Strategy A: `cn(<name>Variants({...}), className)` emits the primitive's default classes first and the call-site `className` last, so `tailwind-merge` resolves conflicts in favor of the call-site class. Where a component's non-conflicting base classes leak undesirably onto a landing element (e.g., the primitive `Input`'s `ring-1 ring-inset` on a bare embedded input, the primitive `Button`'s `focus-visible:ring-2` on a landing variant that originally had no focus ring, or the shadcn `Card`'s `flex flex-col` on a bento card that intends a row layout), the call-site `class` SHALL include an explicit defeat (`ring-0`, `focus-visible:ring-0`, `flex-row`, etc.).

#### Scenario: Landing page imports simple primitives from primitives

- **WHEN** the landing page renders a `Button`, `Badge`, or `Input`
- **THEN** the component is imported from `$lib/components/primitives` (the barrel or per-component path), not from `$lib/components/ui` or `$lib/components/ui-cp`.

#### Scenario: Landing page imports Card from ui

- **WHEN** the landing page renders a `Card`
- **THEN** the component is imported from `$lib/components/ui/card` (shadcn-svelte), not from `primitives/` (Card is a composite container, so it lives in `ui/`).

#### Scenario: Landing-specific visuals use the class prop, not component-internal variants

- **WHEN** the landing page needs a visual that does not map to the canonical primitive variant contract (e.g., `hero-primary`, `bento`, `stats`, `pill`)
- **THEN** the visual is applied by passing the exact CSS class string as the `class` prop on the primitive (or shadcn `Card`), and the component definition in `primitives/` (or `ui/`) contains no landing-specific variant key for it.

#### Scenario: Leaked component base classes are defeated explicitly

- **WHEN** a component's non-conflicting base class would leak onto a landing element (e.g., the bare embedded `Input` would show the primitive's `ring-1` border, or the shadcn `Card`'s `flex-col` would force a column on a bento card that intends a row)
- **THEN** the call-site `class` includes an explicit defeat (e.g., `ring-0`, `flex-row`) so the rendered result matches the intended landing design.

### Requirement: Web fonts are loaded with preconnect

`src/app.html` SHALL include `<link rel="preconnect">` for `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (with `crossorigin`), and a stylesheet link to Google Fonts for Hanken Grotesk (weights 400, 600, 800) and Manrope (weights 500, 600) with `display=swap`.

#### Scenario: Fonts load with fallback visible

- **WHEN** the page loads on a slow connection
- **THEN** text renders immediately in the fallback stack (system-ui, sans-serif) and swaps to the web fonts once they arrive, without a flash of invisible text.

### Requirement: Header is sticky with wordmark and nav

The site header SHALL be `position: fixed; top: 0; left: 0; right: 0` (Tailwind `fixed top-0 inset-x-0`) with `z-50`, so it is **out of normal flow** and overlays the page content rather than reserving vertical space at the top of the document. The header SHALL apply a `backdrop-blur` in both rest and scrolled states. The header's background, bottom border, and box-shadow SHALL be **conditional on scroll position**, with two normative states:

- **At-rest state** (`window.scrollY === 0`): the header SHALL render with a transparent background (no `bg-*` fill), no bottom border, and no box-shadow. Because the header is out of flow, the hero section's photo + cream composition fills the viewport from `y = 0` (the hero is not pushed down by an 80px in-flow band); the header's wordmark, nav, search, and Login/Register pill float transparently over the hero.
- **Scrolled state** (`window.scrollY > 30`): the header SHALL render with `bg-canvas/80` (the `canvas` token at 80% alpha), a 1px hairline bottom border (`border-b border-hairline`), and **no box-shadow** (flat-by-default per DESIGN.md; the hairline border alone divides the header from content beneath).

The transition between at-rest and scrolled states SHALL animate `background-color` and `border-color` over approximately 200ms with an ease-out timing function, and SHALL be collapsed to effectively 0ms under `prefers-reduced-motion: reduce` (per the "Motion respects reduced-motion preference" requirement). `backdrop-filter` SHALL remain applied in both states (it is visually inert at rest because the hero behind is a solid cream, and activates meaningfully once varied content scrolls under).

The toggle SHALL be driven by a Svelte 5 `$state<boolean>` (e.g. `scrolled`) mutated by a `svelte:window onscroll` handler. The handler SHALL be throttled via `requestAnimationFrame` so at most one state mutation occurs per animation frame. The initial value of `scrolled` SHALL be `false` so that server-rendered HTML emits the at-rest (transparent) class string.

Because the header is `position: fixed` and overlays content, any in-page anchor target (e.g. the sections with `id="events"`, `id="blog"`, `id="partnership"`) SHALL set `scroll-margin-top` equal to the header height (`scroll-mt-20` = 80px) so that navigating to that anchor does not hide the target's heading behind the fixed header.

The header SHALL contain the wordmark "PKUBersua" (in the display font, 500 weight) and a navigation that links to `#event-akan-datang`, `#event-sebelumnya`, and a future "Tentang" anchor. On viewports below 640px the nav SHALL collapse into a `<details>` disclosure; above 640px it SHALL display inline. The nav links' hover and focus states SHALL use the `--primary` accent.

This behavior is scoped to the landing page (`src/routes/+page.svelte`) only. Other routes retain their own header treatments.

#### Scenario: Header is transparent and overlays the hero at the top of the page

- **WHEN** a visitor loads the landing page at `scrollY = 0`
- **THEN** the header is fixed at the top of the viewport with a transparent background, no bottom border, and no box-shadow, and the hero section's cream + batik + photo composition fills the viewport from `y = 0` (not pushed down by an in-flow header band), so the hero reads as the page's first impression with the wordmark/nav/login floating transparently over it.

#### Scenario: Header becomes frosted glass once the visitor scrolls

- **WHEN** the visitor scrolls the page so that `window.scrollY` exceeds 30
- **THEN** the header gains an `bg-canvas/80` background, a 1px hairline bottom border, and `backdrop-blur` over the content scrolling beneath it, with no box-shadow; the transition from transparent to frosted is animated over ~200ms ease-out.

#### Scenario: Header returns to transparent when scrolled back to top

- **WHEN** the visitor scrolls back up so that `window.scrollY` returns to 0
- **THEN** the header's background and bottom border are removed again, returning to the at-rest transparent state via the same ~200ms transition.

#### Scenario: Header stays visible (fixed) while scrolling

- **WHEN** the visitor scrolls down the page
- **THEN** the header remains pinned to the top of the viewport via `position: fixed` regardless of scroll state, so the wordmark, nav, search, and Login/Register pill remain accessible at all scroll positions.

#### Scenario: Hero starts at document top-0 under the overlay header

- **WHEN** the landing page is rendered at any viewport width
- **THEN** the hero section (`<section>` immediately following the `<header>`) begins at document `y = 0` because the header is out of normal flow (`position: fixed`); the hero's vertically-centered content (via `flex items-center`) is not hidden behind the 80px overlay header.

#### Scenario: Anchor links do not hide headings behind the fixed header

- **WHEN** a visitor clicks a nav link to an in-page anchor (e.g. `#events`, `#blog`, `#partnership`)
- **THEN** the browser scrolls the target section into view with `scroll-margin-top` of 80px (`scroll-mt-20`), so the section's heading is not obscured by the fixed header.

#### Scenario: Scroll handler is throttled to one mutation per frame

- **WHEN** the visitor performs a momentum scroll that fires many `scroll` events in rapid succession
- **THEN** the `scrolled` state is mutated at most once per animation frame (via `requestAnimationFrame` coalescing), avoiding redundant re-renders.

#### Scenario: Reduced motion collapses the transition

- **WHEN** a visitor with `prefers-reduced-motion: reduce` loads the page and scrolls past 30px
- **THEN** the header still toggles between transparent and frosted states, but the `background-color` and `border-color` change is effectively instant (0ms duration) rather than animated over 200ms.

#### Scenario: Keyboard focus on nav links

- **WHEN** a keyboard user tabs through the header nav
- **THEN** each link shows a visible focus ring in `--ring` (mapped to `--primary`), in both the at-rest and scrolled states.

#### Scenario: Server-rendered HTML emits the at-rest state

- **WHEN** the landing page is server-rendered (no `window` available)
- **THEN** the header's class string reflects the at-rest (transparent) state, because `scrolled` initializes to `false` and `<svelte:window onscroll>` is a no-op on the server; the first client-side `onscroll` corrects the state if the page was loaded mid-scroll (e.g. via an anchor link).

### Requirement: Hero displays one headline, subcopy, and two actions

The hero section SHALL display one "Pekanbaru Heritage & Culture" pill badge, one `<h1>` "Celebrating the Heart of Riau's Local Heritage" (with "Riau's Local Heritage" rendered as a `<span class="text-secondary">`), one short descriptive sentence, and two CTAs ("Explore Events" filled and "Learn History" outlined). No tertiary action, no carousel.

#### Scenario: Hero renders two CTAs

- **WHEN** a visitor loads the homepage
- **THEN** the hero renders the pill badge, the h1, the descriptive sentence, and the two CTAs side by side.

### Requirement: Announcements list renders dated entries

The announcements section SHALL render a section heading followed by a list of dated entries. Each entry SHALL have a date column (`.label-meta`, tabular-nums) and a headline with a one-line excerpt in muted ink. Entries SHALL be separated by 1px hairlines. The list SHALL render at least two and at most five entries.

#### Scenario: Announcements render as an editorial list, not a card grid

- **WHEN** the announcements section is rendered
- **THEN** entries appear as horizontal date-and-headline rows divided by hairlines, not as a grid of bordered cards.

### Requirement: Recent posts list renders reading-list entries

The recent posts section SHALL render a section heading followed by post entries. Each post SHALL have a serif title (Spectral 500) that is a `.link-quiet` on hover, a byline row (author, date, reading time in `.label-meta`), a two-line excerpt capped at 70ch, and a "Read →" link. Entries SHALL be separated by 1px hairlines with generous vertical rhythm. The section SHALL render exactly three posts.

#### Scenario: Post title hover state

- **WHEN** a visitor hovers a post title
- **THEN** the title's underline and text color transition to the primary accent.

### Requirement: About strip renders one paragraph and one link

The about strip SHALL render a section heading ("About the club") in Spectral at headline size, followed by one paragraph of body text capped at 70ch, and one `.link-quiet` to a future About page. No imagery, no card, no secondary actions.

#### Scenario: About strip is quiet

- **WHEN** the about strip is rendered
- **THEN** it contains exactly one heading, one paragraph, and one link, with no decorative elements, cards, or imagery.

### Requirement: Footer renders wordmark, nav, community links, and copyright

The footer SHALL render a 4-column grid: a brand column (wordmark + tagline + 3 social-icon links), a "The Community" nav column, a "Support & Partnership" nav column, and a "Stay Connected" column with an email input + Join button. The footer SHALL also render the `© 2026 PKUBersua` copyright line below the grid in `.label-meta`. No large CTA banner.

#### Scenario: Footer renders 4 columns

- **WHEN** the footer is rendered at desktop viewports
- **THEN** it renders 4 columns side by side; on mobile it stacks to a single column.

### Requirement: Layout is responsive with mobile-first breakpoint overrides

The page SHALL be mobile-first and use `clamp()` for container padding, fluid text sizes, and section vertical rhythm. The event listing collapses to a single column below 640px. All responsive layout overrides — for side margin, hero height, section padding, font sizes, bento grid, and mobile navigation — SHALL use the semantic breakpoint prefixes (`mobile:`, `tablet:`, `desktop:`) defined in `@theme` — not the removed default prefixes (`sm:`, `md:`, `lg:`). The side-margins, hero, and section paddings SHALL follow the "mobile-first base + tablet/desktop override" pattern: base class applies at all viewports, and a `tablet:` or `desktop:` override raises the value at the larger breakpoint. JavaScript-based menu toggling is permitted ONLY for the mobile hamburger navigation (sheet/drawer open-state); no other JS-driven breakpoint toggling exists.

#### Scenario: Page renders at 360px viewport

- **WHEN** the page is rendered at a 360px viewport width
- **THEN** no horizontal overflow occurs, all text remains readable, and the event listing collapses to a single column. The side margins of each section SHALL be 16px (`px-margin-mobile`), not the desktop 80px.

#### Scenario: Page renders at 768px viewport (tablet)

- **WHEN** the page is rendered at a 768px viewport width
- **THEN** the side margins of each section SHALL be 80px (`tablet:px-margin-desktop`), the hero height SHALL be 870px, and the events grid SHALL be 3 columns.

#### Scenario: Page renders at 1280px viewport

- **WHEN** the page is rendered at a 1280px viewport width
- **THEN** the content container centers with a max-width of 72rem and the event listing reads with generous whitespace, not stretched edge-to-edge.

### Requirement: Side margin is mobile-first with tablet override

Every section on the landing page (`header`, hero, `#events`, `#blog`, `#partnership`, `#partners`, `footer`) SHALL render with `px-margin-mobile` (16px) as its base class and `tablet:px-margin-desktop` (80px) as its tablet-and-up override. No section SHALL use `px-margin-desktop` without the `px-margin-mobile` base — otherwise narrow viewports are crushed by the 80px margin.

#### Scenario: Section side margin scales with viewport

- **WHEN** a section is rendered on a 360px mobile viewport
- **THEN** the content has 16px horizontal padding. When the same section is rendered on a 1024px desktop viewport, it has 80px horizontal padding. The two values come from the same class string (`px-margin-mobile tablet:px-margin-desktop`), not from two different sections.

### Requirement: Mobile hamburger navigation opens a sheet drawer

The site header SHALL render a hamburger button (`<Button>` with `menu` Material Symbols icon) that is visible only below the `tablet` breakpoint (`tablet:hidden`) and absent at tablet+. The desktop nav links (Home, Events, Blog, Partnership) remain `hidden tablet:flex` (unchanged). Tapping the hamburger button SHALL open a shadcn `Sheet` (drawer) anchored to the right edge containing the same four nav links plus the Login/Register button, stacked vertically. The sheet SHALL trap focus, close on the Escape key, close when an anchor-link is tapped, and render an `aria-label="Menu navigasi"` attribute. A sheet backdrop `bg-ink/40` covers the page.

#### Scenario: Hamburger button appears on narrow viewports

- **WHEN** a visitor loads the homepage at a viewport < 768px
- **THEN** the header renders a hamburger `<Button>` with the `menu` Material Symbols icon; the desktop nav links are NOT visible.

#### Scenario: Hamburger button is hidden on tablet and wider

- **WHEN** a visitor loads the homepage at a viewport ≥ 768px
- **THEN** the hamburger button is NOT visible, and the desktop nav links render as the default navigation.

#### Scenario: Drawer opens and contains all nav links

- **WHEN** a mobile visitor taps the hamburger button
- **THEN** a sheet drawer slides in from the right edge with `aria-label="Menu navigasi"`, an `×` close button in the top-right, and five stacked actionable rows (Home, Events, Blog, Partnership, Login/Register). The background is covered by a `bg-ink/40` backdrop.

#### Scenario: Drawer closes on Escape or link tap

- **WHEN** the sheet is open and the visitor presses Escape OR taps any link row
- **THEN** the sheet closes and the backdrop is removed. Link taps additionally navigate to the target section/page.

### Requirement: Hero is fluid on mobile, 870px on tablet+

The hero section SHALL render with `h-auto min-h-[870px]` as its base (so on narrow viewports its height expands to contain the content) and `tablet:h-[870px]` as the tablet-and-up override (restoring the fixed 870px height from the Stitch design). The hero headline SHALL render at `text-headline-lg` (32px) base and override to `tablet:text-headline-xl` (48px) at tablet+. The hero body paragraph SHALL render at `font-body-md` base and `tablet:font-body-lg` at tablet+.

#### Scenario: Hero resizes fluidly below tablet

- **WHEN** a visitor loads the homepage at a 360px viewport
- **THEN** the hero height is determined by its content (not a fixed 870px), its headline is 32px, and no headline text overflows or truncates.

#### Scenario: Hero is 870px on tablet and wider

- **WHEN** a visitor loads the homepage at a 768px+ viewport
- **THEN** the hero height is fixed at 870px and the headline scales to 48px, matching the Stitch design.

### Requirement: Section headings and internal paddings scale at tablet

Section h2 headings ("Upcoming Community Gatherings", "Latest News & Stories", "Empower Your Business Through Community", "Trusted by Local & Global Partners") SHALL render at `text-headline-md` (24px) base and override to `tablet:text-headline-lg` (32px) at tablet+. Section vertical rhythm SHALL render at `py-md mb-md` base and override to `tablet:py-xl tablet:mb-xl` at tablet+. The Empower CTA section SHALL render at `p-md` base and override to `tablet:p-xl` at tablet+.

#### Scenario: Section heading on mobile

- **WHEN** a mobile viewport (< 768px) renders an h2 section heading
- **THEN** the heading is 24px (`text-headline-md`), not the desktop 32px.

#### Scenario: Section heading on tablet+

- **WHEN** a tablet or desktop viewport (≥ 768px) renders an h2 section heading
- **THEN** the heading is 32px (`tablet:text-headline-lg`), matching the Stitch design.

#### Scenario: CTA card padding on mobile

- **WHEN** the Empower CTA card is rendered on a 360px mobile viewport
- **THEN** its internal padding is `p-md` (24px), reduced from the desktop `p-xl` (64px), so content does not overflow horizontally.

### Requirement: Bento blog grid stacks cleanly on mobile

The "Latest News & Stories" bento grid SHALL render as `grid grid-cols-1 h-auto` base (`tablet:grid-cols-4 grid-rows-2 tablet:h-[600px]`). Each bento `<Card>` SHALL have a fluid mobile height (no fixed `h-[600px]` bleed through) and override to `tablet:col-span-*` placements on tablet+. The hero bento card and the "Local Guide" card's internal `flex-row gap-md` layout SHALL retain their horizontal arrangement on mobile (since they are wide cards); the narrow sponsorship + volunteer cards SHALL stack vertically on mobile.

#### Scenario: Bento tiles stack as a column below tablet

- **WHEN** a mobile visitor (< 768px) scrolls to the blog section
- **THEN** the 4 tiles render as a vertical column with `gap-gutter` spacing, each tile sizing to its content height.

#### Scenario: Bento tiles form a 4-col mosaic on tablet+

- **WHEN** a tablet visitor (≥ 768px) scrolls to the blog section
- **THEN** the tiles form the original 4-column × 2-row mosaic with the hero card spanning 2×2, matching the Stitch design.

### Requirement: Motion respects reduced-motion preference

Every animation and transition on the page SHALL provide a `@media (prefers-reduced-motion: reduce)` alternative that disables animations and makes transitions effectively instant. The hero fade-up SHALL be the only entrance animation on the page; no scroll-triggered choreography SHALL exist.

#### Scenario: Reduced motion disables hero animation

- **WHEN** a visitor with `prefers-reduced-motion: reduce` loads the page
- **THEN** the hero headline appears immediately with no fade or transform animation.

#### Scenario: Hover transitions are effectively instant under reduced motion

- **WHEN** a visitor with `prefers-reduced-motion: reduce` hovers a `.link-quiet` or a shadcn `Button`
- **THEN** the state change happens with a duration of effectively 0ms rather than the default 0.18s ease.

### Requirement: Dummy content is clearly sample data

The homepage SHALL NOT define its own typed `const` arrays for events, announcements, or posts. The event listing SHALL read from `$lib/features/events`'s `getUpcomingEvents` and `getPastEvents` service functions, which read from a typed const array in `src/lib/features/events/services/dummy-events.ts`. The dummy data SHALL cover the lintas-profesi positioning and SHALL fill the new `category` and `categorySecondary` fields on every event.

#### Scenario: Content owner inspects the data source

- **WHEN** a content owner opens `src/lib/features/events/services/dummy-events.ts`
- **THEN** the dummy events are visible as a typed const array with `category` and `categorySecondary` filled, clearly the single swap surface for real content.

### Requirement: "Event Akan Datang" section lists upcoming events

The "Event Akan Datang" section SHALL render an `<h2 id="event-akan-datang">` heading followed by a list of `EventCard` components, one per upcoming event (events whose `startsAt` is in the future), sorted ascending by `startsAt` (soonest first). When no upcoming events exist, the section SHALL render an `EmptyState` with `title="Belum ada event yang akan datang"` and `description="Pantau terus untuk kabar terbaru komunitas."`. The section SHALL have a 1px hairline top border (via shadcn `Separator`) and no card border, no shadow.

#### Scenario: Visitor sees upcoming events sorted soonest first

- **WHEN** the dummy data contains three upcoming events on different dates
- **THEN** the section renders three `EventCard`s in ascending date order, each card linking to `/events/{slug}`.

#### Scenario: Visitor sees an empty state when no events are upcoming

- **WHEN** the dummy data contains zero upcoming events
- **THEN** the section renders the `EmptyState` with the documented title and description, and no event cards.

### Requirement: "Event Sebelumnya" section lists past events

The "Event Sebelumnya" section SHALL render an `<h2 id="event-sebelumnya">` heading followed by a list of `EventCard` components, one per past event (events whose `startsAt` is in the past), sorted descending by `startsAt` (most recent first), capped at six events with a "Lihat semua" link to `/events` when more exist. The section SHALL be omitted entirely (no heading, no empty state) when no past events exist. The section SHALL have a 1px hairline top border (via shadcn `Separator`).

#### Scenario: Visitor sees past events sorted most recent first

- **WHEN** the dummy data contains four past events
- **THEN** the section renders four `EventCard`s in descending date order.

#### Scenario: Visitor sees up to six past events with a "Lihat semua" link

- **WHEN** the dummy data contains eight past events
- **THEN** the section renders six `EventCard`s followed by a "Lihat semua" link pointing at `/events`.

#### Scenario: Section is omitted when no past events exist

- **WHEN** the dummy data contains zero past events
- **THEN** the section is omitted from the rendered HTML entirely; no `<h2>` is emitted.

### Requirement: Landing page images are local static assets optimized for SEO and GEO

The landing page (`src/routes/+page.svelte`) SHALL render every image from a local static asset under `/static/images/` (served at `/images/...`) — it SHALL NOT reference any remote (cross-origin) image URL (e.g. `lh3.googleusercontent.com`) for rendered imagery. Each image SHALL be encoded as WebP and SHALL carry explicit native `width` and `height` attributes (to reserve aspect-ratio box and prevent CLS). Each image SHALL have a keyword-rich, lowercase, hyphenated filename and descriptive `alt` text that names the subject and the local entities (Pekanbaru, Riau, Senapelan, songket, batik) where the image depicts local-heritage subject matter. The hero (LCP) image SHALL use `loading="eager"` and `fetchpriority="high"`; below-fold images SHALL use `loading="lazy"`. All images SHALL use `decoding="async"`. Content images (not decorative backgrounds) SHALL be rendered as `<img>` elements (not CSS `background-image`) so they are crawlable and indexable. The landing page SHALL include an `ImageObject` JSON-LD block (in `<svelte:head>`) for content images, each naming `contentUrl`, `name`, `description`, and `creditText`, to signal local-heritage subject matter to generative engines (GEO). Purely decorative background imagery (e.g. the opacity-0.07 batik-pattern overlay) is exempt from the `<img>`/alt/schema requirements and may remain as CSS.

#### Scenario: No remote image URLs on the landing page

- **WHEN** the rendered landing page HTML is inspected
- **THEN** every `src` attribute and `background-image` URL resolves to a local path under `/images/...` (or `/partners/...` for the existing partner logos), and no `lh3.googleusercontent.com` or other cross-origin image URL appears.

#### Scenario: Hero image is a crawlable img with LCP-priority loading

- **WHEN** the hero section is rendered
- **THEN** the hero photo is an `<img>` element (not a CSS `background-image`) with a descriptive `alt`, `loading="eager"`, `fetchpriority="high"`, `decoding="async"`, and explicit `width`/`height`, served from `/images/hero/`.

#### Scenario: Below-fold images are lazy-loaded with dimensions

- **WHEN** a below-fold bento image is rendered
- **THEN** it carries `loading="lazy"`, `decoding="async"`, explicit `width`/`height`, a keyword-rich local filename, and descriptive `alt` naming the local-heritage subject.

#### Scenario: Content images expose ImageObject schema

- **WHEN** a crawler or generative engine reads the landing page's JSON-LD
- **THEN** it finds an `ImageObject` entry for each content image (not the decorative hero) with `contentUrl`, `name`, `description`, and `creditText`, identifying the images as Pekanbaru/Riau local-heritage subject matter.

#### Scenario: Images do not cause layout shift

- **WHEN** the landing page loads on a slow connection
- **THEN** no cumulative layout shift is caused by images, because each `<img>` reserves its aspect-ratio box via native `width`/`height` before the file arrives.

### Requirement: Landing page sources components from primitives and ui

The landing page (`src/routes/+page.svelte`) SHALL source simple interactive components (`Button`, `Badge`, `Input`) from `$lib/components/primitives` and composite/headless components (`Card`, etc.) from `$lib/components/ui` (shadcn-svelte). The landing page SHALL NOT import these components from `$lib/components/ui-cp` (the backup) or from the empty `$lib/components/ui/<simple-name>` paths. Landing-specific visual treatments that do not map to the canonical primitive variant contract (`intent`/`variant`/`size`/`rounded`/...) SHALL be applied via the `class` prop at the call site — Strategy A: `cn(<name>Variants({...}), className)` emits the primitive's default classes first and the call-site `className` last, so `tailwind-merge` resolves conflicts in favor of the call-site class. Where the primitive's base classes do not conflict but leak undesirably (e.g., the primitive `Input`'s `ring-1 ring-inset` on a bare embedded input, or the primitive `Button`'s `focus-visible:ring-2` on a landing variant that originally had no focus ring), the call-site `class` SHALL include an explicit defeat (`ring-0`, `focus-visible:ring-0`, etc.).

#### Scenario: Landing page imports simple primitives from primitives

- **WHEN** the landing page renders a `Button`, `Badge`, or `Input`
- **THEN** the component is imported from `$lib/components/primitives` (the barrel or per-component path), not from `$lib/components/ui` or `$lib/components/ui-cp`.

#### Scenario: Landing page imports Card from ui

- **WHEN** the landing page renders a `Card`
- **THEN** the component is imported from `$lib/components/ui/card` (shadcn-svelte), not from `primitives/` (Card is composite/headless-delegating, so it lives in `ui/`).

#### Scenario: Landing-specific visuals use the class prop, not component-internal variants

- **WHEN** the landing page needs a visual that does not map to the canonical primitive variant contract (e.g., `hero-primary`, `bento`, `stats`, `pill`)
- **THEN** the visual is applied by passing the exact CSS class string as the `class` prop on the primitive (or shadcn `Card`), and the component definition in `primitives/` (or `ui/`) contains no landing-specific variant key for it.

#### Scenario: Leaked primitive base classes are defeated explicitly

- **WHEN** a primitive's non-conflicting base class would leak onto a landing element (e.g., the bare embedded `Input` would show the primitive's `ring-1` border)
- **THEN** the call-site `class` includes an explicit defeat (e.g., `ring-0`) so the rendered result matches the intended landing design.

### Requirement: Semantic breakpoint tokens are defined in @theme

`src/routes/layout.css` SHALL define exactly three breakpoint tokens in the `@theme` block, using semantic device-tier names: `--breakpoint-mobile: 40rem` (640px), `--breakpoint-tablet: 48rem` (768px), and `--breakpoint-desktop: 64rem` (1024px). Tailwind v4 SHALL generate `mobile:`/`tablet:`/`desktop:` responsive variant prefixes from these tokens. The default Tailwind v4 breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) SHALL be removed by setting each `--breakpoint-*` to `initial` in the same `@theme` block, so that `sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixes are NOT generated. Project code SHALL use only `mobile:`/`tablet:`/`desktop:` for responsive variants.

#### Scenario: Semantic prefixes are generated

- **WHEN** a developer writes `tablet:grid-cols-3` in a class string
- **THEN** Tailwind generates a `@media (min-width: 48rem)` rule applying `grid-template-columns: repeat(3, minmax(0, 1fr))`.

#### Scenario: Default prefixes are not generated

- **WHEN** a developer writes `md:grid-cols-3` in a class string
- **THEN** Tailwind does NOT generate any matching CSS rule, because `--breakpoint-md` is set to `initial` and the `md:` variant does not exist.
