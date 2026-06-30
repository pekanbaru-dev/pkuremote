## Why

The event cards in the "Upcoming Community Gatherings" grid render the date + CTA footer row directly below the excerpt, using a fixed `mt-2` margin. Because excerpts vary in length (short vs. 2-line `line-clamp-2`), the footer rows across a 3-column row land at different vertical positions — breaking the visual baseline. The cards already stretch to equal height (CSS grid default), but the flex chain from card root to footer row is not wired up to push the footer to the bottom of the available height. This is a small layout correctness fix that makes the grid feel composed rather than ragged.

## What Changes

- The `EventCard` root `<a>` becomes a flex column (`flex flex-col`) so its children can distribute height.
- The card body `<div>` (currently `p-md flex flex-col gap-3`) gains `flex-1` so it grows to fill the banner-to-bottom space left by the fixed-height banner above it.
- The footer row (date + CTA) changes its top margin from the fixed `mt-2` to `mt-auto`, which consumes all remaining free space above it and pins the row to the bottom of the body — and therefore to the bottom of the card — regardless of excerpt length, badge presence, or title line count.
- No changes to banner, badge, title, excerpt, date formatting, CTA label logic, link target, or hover behavior. This is purely a vertical-alignment change to the footer row.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `events`: The `EventCard` footer-row requirement gains a bottom-alignment constraint — the date + CTA row SHALL sit at the bottom of the card body across all cards in a row, independent of excerpt length.

## Impact

- **Affected code**: `src/lib/features/events/components/event-card.svelte` — three class-string edits (root `<a>`, body `<div>`, footer `<div>`). No structural/JS changes.
- **Affected specs**: `openspec/specs/events/spec.md` — the "EventCard shows banner, title, date, location, status, and price" requirement gains a bottom-alignment clause; its scenario gains a "footer rows align across a row" THEN.
- **No API/type/dependency changes.** No new components. No changes to the grid in `src/routes/+page.svelte` (grid already stretches items equally).
- **Risk**: negligible. Pure CSS-class change localized to one component. `pnpm check` + visual review of the events section is sufficient verification.
