## Context

The `EventCard` component (`src/lib/features/events/components/event-card.svelte`) renders a fixed-height banner followed by a body containing badges, title, excerpt, and a footer row (date + CTA). The cards live in a 3-column CSS grid (`grid grid-cols-1 md:grid-cols-3` in `src/routes/+page.svelte:193`) which by default stretches all items in a row to equal height. The current card root is a plain `block` `<a>`, the body is `flex flex-col gap-3`, and the footer row uses a fixed `mt-2` margin. As a result, the footer sits wherever the excerpt ends — cards with short excerpts land their footer higher than cards with 2-line excerpts, producing a ragged baseline across the row.

## Goals / Non-Goals

**Goals:**

- Pin the date + CTA footer row to the bottom of every `EventCard`, so all footer rows in a grid row share a common baseline, independent of excerpt length, badge presence, or title line count.
- Achieve the alignment with the smallest possible diff — three Tailwind class-string edits in one component, no structural or JS changes.

**Non-Goals:**

- Changing banner height, badge styles, title typography, excerpt clamp count, date formatting, CTA label logic, link target, or hover behavior.
- Changing the grid layout, column count, or gap in `src/routes/+page.svelte`.
- Introducing a `min-height` on the excerpt area or normalizing title line count. (The footer-bottom pattern makes these unnecessary; if a future design wants a fixed-height body block, that is a separate change.)
- Touching any other card-like surface (blog bento, news list, etc.).

## Decisions

**Decision 1: Flex chain from card root to footer (`flex flex-col` on `<a>` + `flex-1` on body + `mt-auto` on footer).**

The classic CSS pattern for "pin a row to the bottom of a card of equal-height siblings" is: make the card a flex column, make the body grow to fill the card, and give the footer `margin-top: auto` so it consumes all remaining free space. Tailwind spells these `flex flex-col`, `flex-1`, and `mt-auto` respectively.

```
┌─────────────────────────┐  ┌─────────────────────────┐
│      Banner (h-48)      │  │      Banner (h-48)      │
├─────────────────────────┤  ├─────────────────────────┤
│ <a flex flex-col>       │  │ <a flex flex-col>       │
│  <div flex-1 flex-col>  │  │  <div flex-1 flex-col>  │
│   [badges]              │  │   [badges]              │
│   Title                 │  │   Title                 │
│   Short excerpt         │  │   Long excerpt line 1  │
│   ↓ mt-auto absorbs ↓  │  │   Long excerpt line 2  │
│   📅 Date    CTA →      │  │   📅 Date    CTA →      │  ← aligned
│  </div>                 │  │  </div>                 │
└─────────────────────────┘  └─────────────────────────┘
```

- **Why this over alternatives:** It reuses the existing `flex flex-col` body (already present at `event-card.svelte:70`) and requires no new elements, no `min-height`, no JS, and no changes to the grid. Three class-string swaps localized to one file.
- **Alternative considered — fixed `min-height` on the excerpt:** would couple the card's internal rhythm to a magic pixel value and break when the font scale or clamp count changes. Rejected.
- **Alternative considered — grid `align-self: end` on the footer:** would require restructuring the body into a grid and sacrificing the existing flex `gap-3` rhythm. Rejected.
- **Alternative considered — making only the body `flex flex-col` with `mt-auto` (without touching the root `<a>`):** does not work, because the body div is a block child of a block `<a>` and has no extra height to absorb. The body needs `flex-1` to grow, which in turn requires the parent `<a>` to be a flex column so `flex-1` has meaning.

**Decision 2: Keep `gap-3` on the body, do not replace it with explicit margins.**

The body already uses `flex flex-col gap-3` for vertical rhythm between badges / title / excerpt / footer. `gap-3` and `mt-auto` compose correctly: `gap` applies between adjacent items, while `auto` margins absorb the _leftover_ space after gaps are resolved. So the footer still gets its `0.75rem` separation from the excerpt when the card is exactly content-tall, and absorbs extra space only when the card is taller than its content. No need to swap `gap` for per-item margins.

**Decision 3: Spec delta uses MODIFIED (not ADDED) for the EventCard requirement.**

The existing "EventCard shows banner, title, date, location, status, and price" requirement describes the footer row's contents but says nothing about its vertical alignment. The delta copies the full requirement text and appends a bottom-alignment clause, plus a new scenario asserting cross-card alignment. This keeps the requirement self-contained after archive.

## Risks / Trade-offs

- **[Footer drifts away from excerpt on very tall cards]** → If a future change makes cards much taller than their content (e.g. a fixed card height), `mt-auto` will create a large gap between excerpt and footer. Mitigation: the grid currently sizes rows by content, so cards are only as tall as their tallest sibling; the gap stays bounded to the excerpt-height delta, which is the exact problem being solved. If a fixed height is introduced later, revisit then.
- **[Behavior on single-column mobile]** → On `grid-cols-1`, each card is its own row, so there is no sibling to align against. `mt-auto` becomes a no-op (no extra height to absorb) and the footer sits directly under the excerpt with the `gap-3` spacing — identical to today. No regression.
- **[Risk of breaking hover/banner zoom]** → The banner zoom (`group-hover:scale-105`) relies on the `group` class on the root `<a>`, which is preserved. Adding `flex flex-col` to the `<a>` does not affect `group` behavior. No regression.
