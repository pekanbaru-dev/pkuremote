## 1. Wire the flex chain in `EventCard`

- [x] 1.1 In `src/lib/features/events/components/event-card.svelte`, add `flex flex-col` to the root `<a>` element's class string (alongside the existing `group block bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden transition-shadow hover:shadow-lg`), so the card becomes a flex column container.
- [x] 1.2 In the same file, add `flex-1` to the body `<div>` (the element currently styled `p-md flex flex-col gap-3`), so the body grows to fill the space between the fixed-height banner and the bottom of the card.
- [x] 1.3 In the same file, change the footer row's top margin from `mt-2` to `mt-auto` on the `<div class="flex items-center justify-between mt-2">` element, so the date + CTA row is pinned to the bottom of the card body and absorbs all remaining free space above it.

## 2. Verify

- [x] 2.1 Run `pnpm check` and confirm no new Svelte/Tailwind diagnostics are introduced by the class-string edits (pre-existing errors in other files are out of scope).
- [x] 2.2 Run `pnpm format` scoped to `src/lib/features/events/components/event-card.svelte` (Prettier with tabs + double quotes) to ensure the edited class strings match repo style.
- [x] 2.3 Visually verify in `pnpm dev`: on a desktop viewport, the "Upcoming Community Gatherings" 3-column grid shows the date + CTA footer rows of all three cards aligned to a common baseline, even when the dummy events have excerpts of differing lengths.
- [x] 2.4 Visually verify in `pnpm dev`: on a narrow (mobile) viewport where the grid collapses to a single column, each card's footer sits directly below the excerpt with the standard `gap-3` spacing (no large gap introduced) — matching the pre-change mobile layout.
- [x] 2.5 Visually confirm the banner hover-zoom (`group-hover:scale-105`) still works, since `group` remains on the root `<a>` and `flex flex-col` does not interfere with `group` behavior.
