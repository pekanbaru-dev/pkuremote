## ADDED Requirements

### Requirement: Public active event listings include live events

The public server-side active-event data path SHALL include events whose status is either `upcoming` or `live`, ordered by ascending `startsAt`. The homepage, `/events`, category-filtered listings, and the dynamic sitemap SHALL consume this active-event result so a live event is not hidden from public discovery.

#### Scenario: Homepage includes a live event

- **WHEN** a visitor opens `/` and the database contains an event with `status = "live"`
- **THEN** the live event is rendered in the homepage's active event list and links to its detail page.

#### Scenario: Event listing includes a live event

- **WHEN** a visitor opens `/events` or `/events?category=<matching-category>` and the database contains a matching event with `status = "live"`
- **THEN** the live event is rendered in the active event list in ascending `startsAt` order.

#### Scenario: Sitemap includes a live event

- **WHEN** a crawler requests `/sitemap.xml` and the database contains an event with `status = "live"`
- **THEN** the sitemap contains the event's canonical detail-page URL.

### Requirement: Live events are identified on event cards

An `EventCard` SHALL render a visible, accessible live-status badge with text identifying the event as currently live when `event.status === "live"`. The badge SHALL be omitted for events with `upcoming` or `past` status.

#### Scenario: Live card shows its status

- **WHEN** a visitor views an event card whose status is `live`
- **THEN** the card displays a live-status badge with an accessible text label.

#### Scenario: Non-live card has no live badge

- **WHEN** a visitor views an event card whose status is `upcoming` or `past`
- **THEN** the card does not display the live-status badge.
