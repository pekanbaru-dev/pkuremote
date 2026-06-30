# landing-page Specification (delta)

## Purpose

Replaces the existing homepage composition rules with the Stitch-aligned 6-section layout from the `landing-stitch` spec.

## MODIFIED Requirements

### Requirement: Page renders seven semantic sections in order

The landing page at `/` SHALL render, in this order: a sticky site header (containing the wordmark, a search bar, the nav, and a Login/Register pill button), a hero section at 870px with the batik pattern + bg image + clip-path + dual CTAs, an "Upcoming Community Gatherings" 3-column event grid, an "Empower Your Business Through Community" CTA card, a "Trusted by Local & Global Partners" 4-logo grid, and a 4-column footer with an email input. The "Event Sebelumnya" section from the previous composition is REMOVED (the Stitch design has no past-events listing on the homepage). Each section SHALL be a semantic landmark (`<header>`, `<main>` containing `<section>` blocks with `aria-labelledby`, `<footer>`).

#### Scenario: Visitor loads the landing page

- **WHEN** a visitor navigates to `/`
- **THEN** the page renders header → hero (870px) → Upcoming Community Gatherings (3-col grid) → Empower Your Business CTA → Trusted by Partners (4 logos) → 4-col footer in that order, each as a distinct semantic region.

### Requirement: Hero displays one headline, subcopy, and two actions

The hero section SHALL display one "Pekanbaru Heritage & Culture" pill badge, one `<h1>` "Celebrating the Heart of Riau's Local Heritage" (with "Riau's Local Heritage" rendered as a `<span class="text-secondary">`), one short descriptive sentence, and two CTAs ("Explore Events" filled and "Learn History" outlined). No tertiary action, no carousel.

#### Scenario: Hero renders two CTAs

- **WHEN** a visitor loads the homepage
- **THEN** the hero renders the pill badge, the h1, the descriptive sentence, and the two CTAs side by side.

### Requirement: Footer renders wordmark, nav, community links, and copyright

The footer SHALL render a 4-column grid: a brand column (wordmark + tagline + 3 social-icon links), a "The Community" nav column, a "Support & Partnership" nav column, and a "Stay Connected" column with an email input + Join button. The footer SHALL also render the `© 2026 PKUBersua` copyright line below the grid in `.label-meta`. No large CTA banner.

#### Scenario: Footer renders 4 columns

- **WHEN** the footer is rendered at desktop viewports
- **THEN** it renders 4 columns side by side; on mobile it stacks to a single column.

### Requirement: Dummy content is clearly sample data

The homepage SHALL NOT define its own typed `const` arrays for events, announcements, or posts. The event listing SHALL read from `$lib/features/events`'s `getUpcomingEvents` and `getPastEvents` service functions, which read from a typed const array in `src/lib/features/events/services/dummy-events.ts`. The dummy data SHALL cover the lintas-profesi positioning and SHALL fill the new `category` and `categorySecondary` fields on every event.

#### Scenario: Content owner inspects the data source

- **WHEN** a content owner opens `src/lib/features/events/services/dummy-events.ts`
- **THEN** the dummy events are visible as a typed const array with `category` and `categorySecondary` filled, clearly the single swap surface for real content.

## REMOVED Requirements

### Requirement: Next event section features one upcoming event

This requirement is REMOVED. The "Next event section features one upcoming event" requirement from the previous `landing-page` spec is replaced by the "Upcoming Community Gatherings is a 3-column event grid" requirement in the `landing-stitch` spec.
