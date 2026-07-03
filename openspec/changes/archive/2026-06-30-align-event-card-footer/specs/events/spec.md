## MODIFIED Requirements

### Requirement: EventCard shows banner, title, date, location, status, and price

Each `EventCard` (in `src/lib/features/events/components/event-card.svelte`) SHALL render the event's `bannerUrl` in a fixed-height (`h-48`) banner at the top, with the banner clipped to `rounded-xl` (12px) corners and a `group-hover:scale-105 transition-transform duration-500` effect on the image. Below the banner, the card SHALL render (in document order): (1) two category pill badges — one styled `bg-primary/10 text-primary rounded-full text-label-md` reading the event's `category`, and one styled `bg-secondary/10 text-secondary rounded-full text-label-md` reading the event's `categorySecondary`; (2) the event title in `font-headline-md text-headline-md`; (3) a one-line excerpt with `line-clamp-2`; (4) a footer row containing a Material Symbols `calendar_today` icon next to the event date, and a right-aligned `Book Now` / `RSVP` / `Register` link (selected by the event's `category` via a small mapping) styled `text-primary font-bold hover:translate-x-1 transition-transform`. The card SHALL be a `bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden group` container. The whole card SHALL be a single `<a>` linking to `/events/{event.slug}`.

The card root `<a>` SHALL be a flex column (`flex flex-col`), the body container below the banner SHALL carry `flex-1` (so it grows to fill the banner-to-bottom space), and the footer row SHALL use `mt-auto` (not a fixed top margin) so that it is pinned to the bottom of the card body. As a result, when multiple `EventCard`s are rendered in the same grid row (e.g. the "Upcoming Community Gatherings" 3-column grid), their footer rows SHALL share a common baseline — the date + CTA row of the shortest-excerpt card SHALL align with the date + CTA row of the longest-excerpt card — regardless of excerpt length, badge presence, or title line count. On a single-column layout (mobile), where each card is its own grid row, `mt-auto` SHALL degrade to a no-op and the footer SHALL sit directly below the excerpt with the body's standard `gap-3` spacing.

#### Scenario: Reader scans a Stitch-style event card

- **WHEN** a visitor views an event card in the Upcoming Community Gatherings grid
- **THEN** they see a 192px-tall banner, two category pills, the event title, a 2-line excerpt, the date with a calendar icon, and a "Book Now" / "RSVP" / "Register" CTA.

#### Scenario: Banner zooms on card hover

- **WHEN** a visitor hovers an event card
- **THEN** the banner image scales up to 105% over 500ms.

#### Scenario: Category pills are hidden when category is missing

- **WHEN** the event has neither `category` nor `categorySecondary` set
- **THEN** the card renders with no category pills (graceful degradation, per the existing "Partial response" rule).

#### Scenario: Footer rows align across a grid row regardless of excerpt length

- **WHEN** a grid row renders two or more `EventCard`s whose excerpts differ in length (e.g. one 1-line excerpt and one 2-line excerpt)
- **THEN** the date + CTA footer row of every card in that row sits at the same vertical position — pinned to the bottom of each card — so the footer rows form a single aligned baseline across the row.

#### Scenario: Footer sits directly under excerpt on single-column mobile

- **WHEN** an `EventCard` is rendered in a single-column (mobile) grid where it is the only item in its row
- **THEN** the footer row sits directly below the excerpt with the body's standard `gap-3` spacing (no extra gap is introduced), matching the pre-change layout.
