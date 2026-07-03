# events Specification (delta)

## Purpose

Adds the Stitch-aligned EventCard style and two new optional fields to the Event type, supporting the new homepage composition from the `landing-stitch` spec.

## ADDED Requirements

### Requirement: Event type optionally carries `categoryLabel` and `categorySecondary`

The `Event` type SHALL add two optional fields: `categoryLabel?: string` and `categorySecondary?: string`. Each SHALL be a string of max 16 characters, displayed as a pill label on the event card. When either field is `undefined`, the corresponding pill SHALL be hidden. The dummy data SHALL fill both fields on all 8 events.

#### Scenario: A new event is added to the dummy data with categories

- **WHEN** a developer adds an entry to `features/events/services/dummy-events.ts` with `categoryLabel: "Workshop"` and `categorySecondary: "Hands-on"`
- **THEN** the event card renders two pills reading "Workshop" and "Hands-on", and the type check passes.

## MODIFIED Requirements

### Requirement: EventCard shows banner, title, date, location, status, and price

Each `EventCard` (in `src/lib/features/events/components/event-card.svelte`) SHALL render the event's `bannerUrl` in a fixed-height (`h-48`) banner at the top, with the banner clipped to `rounded-xl` (12px) corners and a `group-hover:scale-105 transition-transform duration-500` effect on the image. Below the banner, the card SHALL render (in document order): (1) two category pill badges — one styled `bg-primary/10 text-primary rounded-full text-label-md` reading the event's `category`, and one styled `bg-secondary/10 text-secondary rounded-full text-label-md` reading the event's `categorySecondary`; (2) the event title in `font-headline-md text-headline-md`; (3) a one-line excerpt with `line-clamp-2`; (4) a footer row containing a Material Symbols `calendar_today` icon next to the event date, and a right-aligned `Book Now` / `RSVP` / `Register` link (selected by the event's `category` via a small mapping) styled `text-primary font-bold hover:translate-x-1 transition-transform`. The card SHALL be a `bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden group` container. The whole card SHALL be a single `<a>` linking to `/events/{event.slug}`.

#### Scenario: Reader scans a Stitch-style event card

- **WHEN** a visitor views an event card in the Upcoming Community Gatherings grid
- **THEN** they see a 192px-tall banner, two category pills, the event title, a 2-line excerpt, the date with a calendar icon, and a "Book Now" / "RSVP" / "Register" CTA.

#### Scenario: Banner zooms on card hover

- **WHEN** a visitor hovers an event card
- **THEN** the banner image scales up to 105% over 500ms.

#### Scenario: Category pills are hidden when category is missing

- **WHEN** the event has neither `category` nor `categorySecondary` set
- **THEN** the card renders with no category pills (graceful degradation, per the existing "Partial response" rule).
