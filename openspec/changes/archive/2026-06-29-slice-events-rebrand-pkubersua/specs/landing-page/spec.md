# landing-page Specification (delta)

## Purpose

Defines the structure, content, design tokens, and behavior of the public landing page at `/` — its semantic sections, the brand-palette and typography system, reusable component classes, responsive layout, and motion rules.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Page renders seven semantic sections in order

The landing page at `/` SHALL render, in this order: a sticky site header, a hero with the brand tagline and a primary CTA, an "Event Akan Datang" section listing upcoming events, an "Event Sebelumnya" section listing past events (omitted entirely when no past events exist), and a footer. Each section SHALL be a semantic landmark (`<header>`, `<main>` containing `<section>` blocks with `aria-labelledby`, `<footer>`). The previous featured-event row, announcements list, recent-posts list, and about-strip sections are REMOVED.

#### Scenario: Visitor loads the landing page

- **WHEN** a visitor navigates to `/`
- **THEN** the page renders header, hero, "Event Akan Datang" (with one or more `EventCard`s or an `EmptyState`), "Event Sebelumnya" (with one or more `EventCard`s, omitted entirely if empty), and footer in that order, each as a distinct semantic region.

#### Scenario: Single level-one heading

- **WHEN** the page is parsed for heading structure
- **THEN** exactly one `<h1>` exists (the hero headline) and all section headings are `<h2>`.

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

`src/routes/layout.css` SHALL define the reusable classes `.container-page` (max-width 72rem, fluid horizontal padding via `clamp()`), `.measure-prose` (max-width 70ch), `.label-meta` (small uppercase-free meta text using the label font and label size from the Stitch fontSize table), and `.link-quiet` (hairline underline transitioning to primary on hover). The `.btn-primary` class is REMOVED; its role is filled by the shadcn Button component (see the `shadcn-components` spec). The 1px section dividers are rendered via the shadcn Separator component. The header and footer navigation is rendered via the shadcn NavigationMenu component.

#### Scenario: Primary button text color

- **WHEN** the shadcn Button (primary variant) is rendered
- **THEN** its text color is the `--primary-foreground` (white) token, not ink, because the primary fill is a saturated mid-luminance color where white text reads correctly.

#### Scenario: Quiet link hover

- **WHEN** a `.link-quiet` element is hovered or receives focus
- **THEN** its underline border and text color transition to the primary accent color.

#### Scenario: Section dividers render via shadcn Separator

- **WHEN** the landing page renders a divider between sections
- **THEN** it uses the shadcn Separator component with `orientation="horizontal"`, producing a 1px line in the `--border` color.

### Requirement: Web fonts are loaded with preconnect

`src/app.html` SHALL include `<link rel="preconnect">` for `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (with `crossorigin`), and a stylesheet link to Google Fonts for Hanken Grotesk (weights 400, 600, 800) and Manrope (weights 500, 600) with `display=swap`.

#### Scenario: Fonts load with fallback visible

- **WHEN** the page loads on a slow connection
- **THEN** text renders immediately in the fallback stack (system-ui, sans-serif) and swaps to the web fonts once they arrive, without a flash of invisible text.

### Requirement: Header is sticky with wordmark and nav

The site header SHALL be `position: sticky; top: 0` with a 1px hairline bottom border. It SHALL contain the wordmark "PKUBersua" (in the display font, 500 weight) and a navigation that links to `#event-akan-datang`, `#event-sebelumnya`, and a future "Tentang" anchor. On viewports below 640px the nav SHALL collapse into a `<details>` disclosure; above 640px it SHALL display inline. The nav links' hover and focus states SHALL use the `--primary` accent.

#### Scenario: Header stays visible while scrolling

- **WHEN** the visitor scrolls down the page
- **THEN** the header remains pinned to the top of the viewport with the hairline border dividing it from the content beneath.

#### Scenario: Keyboard focus on nav links

- **WHEN** a keyboard user tabs through the header nav
- **THEN** each link shows a visible focus ring in `--ring` (mapped to `--primary`).

### Requirement: Hero displays one headline, subcopy, and two actions

The hero section SHALL display one `<h1>` headline containing the literal placeholder string `"[TAGLINE_PKUBERSUA_TBD]"` followed by one short descriptive sentence (e.g., "Kabar terbaru komunitas Pekanbaru dalam satu tempat."), and one primary CTA — a `Button` labeled "Lihat semua event" linking to `#event-akan-datang`. No secondary action, no secondary link, no imagery.

#### Scenario: Hero headline renders the placeholder

- **WHEN** a visitor loads the homepage
- **THEN** the `<h1>` is the literal `"[TAGLINE_PKUBERSUA_TBD]"` string, immediately followed by the descriptive sentence.

#### Scenario: Hero headline animates once on load

- **WHEN** the page loads with `prefers-reduced-motion` unset
- **THEN** the hero headline fades and rises 8px over 0.6 seconds using an ease-out exponential curve, then remains static.

#### Scenario: Hero headline does not animate under reduced motion

- **WHEN** the page loads with `prefers-reduced-motion: reduce` set
- **THEN** the hero headline appears instantly with no animation.

### Requirement: Next event section features one upcoming event

The "Event Akan Datang" section SHALL render an `<h2 id="event-akan-datang">` heading followed by a list of `EventCard` components, one per upcoming event (events whose `startsAt` is in the future), sorted ascending by `startsAt` (soonest first). When no upcoming events exist, the section SHALL render an `EmptyState` with `title="Belum ada event yang akan datang"` and `description="Pantau terus untuk kabar terbaru komunitas."`. The section SHALL have a 1px hairline top border (via shadcn `Separator`) and no card border, no shadow.

#### Scenario: Visitor sees upcoming events sorted soonest first

- **WHEN** the dummy data contains three upcoming events on different dates
- **THEN** the section renders three `EventCard`s in ascending date order, each card linking to `/events/{slug}`.

#### Scenario: Visitor sees an empty state when no events are upcoming

- **WHEN** the dummy data contains zero upcoming events
- **THEN** the section renders the `EmptyState` with the documented title and description, and no event cards.

### Requirement: Footer renders wordmark, nav, community links, and copyright

The footer SHALL render the wordmark "PKUBersua", a small navigation list repeating the header nav plus a "Tentang" link, one line of community links (Discord, Telegram, Email) as plain hairline-underline links (with the Email link pointing at `mailto:hello@pkubersua.com`), and a bottom row with `© 2026 PKUBersua` in `.label-meta`. The footer SHALL have a 1px hairline top border. No large CTA banner.

#### Scenario: Footer does not contain a call-to-action banner

- **WHEN** the footer is rendered
- **THEN** it contains only wordmark, nav, community links, and copyright — no full-width colored banner, button, or hero-style CTA.

### Requirement: Layout is responsive without breakpoint-specific markup

The page SHALL be mobile-first and use `clamp()` for container padding, fluid text sizes, and section vertical rhythm. The event listing collapses to a single column on viewports below 640px. No breakpoint-specific class toggles beyond the header `<details>` disclosure.

#### Scenario: Page renders at 360px viewport

- **WHEN** the page is rendered at a 360px viewport width
- **THEN** no horizontal overflow occurs, all text remains readable, and the event listing collapses to a single column.

#### Scenario: Page renders at 1280px viewport

- **WHEN** the page is rendered at a 1280px viewport width
- **THEN** the content container centers with a max-width of 72rem and the event listing reads with generous whitespace, not stretched edge-to-edge.

### Requirement: Motion respects reduced-motion preference

Every animation and transition on the page SHALL provide a `@media (prefers-reduced-motion: reduce)` alternative that disables animations and makes transitions effectively instant. The hero fade-up SHALL be the only entrance animation on the page; no scroll-triggered choreography SHALL exist.

#### Scenario: Reduced motion disables hero animation

- **WHEN** a visitor with `prefers-reduced-motion: reduce` loads the page
- **THEN** the hero headline appears immediately with no fade or transform animation.

#### Scenario: Hover transitions are effectively instant under reduced motion

- **WHEN** a visitor with `prefers-reduced-motion: reduce` hovers a `.link-quiet` or a shadcn `Button`
- **THEN** the state change happens with a duration of effectively 0ms rather than the default 0.18s ease.

### Requirement: Dummy content is clearly sample data

The homepage SHALL NOT define its own typed `const` arrays for events, announcements, or posts (those have been removed). The event listing SHALL read from `$lib/features/events`'s `getUpcomingEvents` and `getPastEvents` service functions, which read from a typed const array in `src/lib/features/events/services/dummy-events.ts`. The dummy data SHALL cover the cross-profession positioning (workshops, talks, meetups across design, health, dev, community, etc.) and SHALL include events both in the past and in the future so both sections render meaningfully on a fresh install.

#### Scenario: Content owner inspects the data source

- **WHEN** a content owner opens `src/lib/features/events/services/dummy-events.ts`
- **THEN** the dummy events are visible as a typed const array at the top of the file, clearly the single swap surface for real content.
