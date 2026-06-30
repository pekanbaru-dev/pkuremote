## Context

The landing page (`src/routes/+page.svelte`) currently renders its `<header>` with a static treatment: `bg-surface dark:bg-surface-dim border-b border-secondary-fixed shadow-sm docked full-width top-0 sticky z-50`. This opaque band always sits on top of the hero section (`h-[870px] bg-surface` + batik pattern + photo + gradient overlay), which flattens the hero's editorial breathing room at the top of the page.

The `landing-page` spec already normatively describes the header as "sticky with a 1px hairline bottom border" — a single static state. Notably, the page `events/[slug]/+page.svelte` already uses the frosted-glass aesthetic this change wants for the scrolled state (`bg-canvas/90 backdrop-blur border-b border-hairline`), so the visual language has precedent in the codebase.

Stack constraints (from `AGENTS.md`): Svelte 5 runes mode is forced in `vite.config.ts` (`$state`, `$props`, etc.); Tailwind v4 (no config file, tokens in `@theme`); package manager is pnpm; prettier uses tabs + single quotes + no trailing commas; `svelte:window` and `on:scroll`-style events are available. The existing "Motion respects reduced-motion preference" requirement in `landing-page` spec mandates that every transition collapse to effectively 0ms under `prefers-reduced-motion: reduce`.

## Goals / Non-Goals

**Goals:**

- Make the header background, bottom border, and shadow **conditional on scroll position** on the landing page only.
- Two states: transparent at `scrollY = 0`; frosted glass (`bg-canvas/80` + `backdrop-blur` + hairline border, no shadow) at `scrollY > 30px`.
- Soften the state change with a ~200ms CSS transition on `background-color` and `border-color`, collapsed to 0ms under reduced-motion.
- Keep the change scoped to `src/routes/+page.svelte`. No layout promotion, no new dependencies, no token changes.

**Non-Goals:**

- Promoting the header into `+layout.svelte` so it is shared across routes. (Out of scope — other routes keep their own header treatments.)
- Applying scroll-aware behavior to `events/[slug]`, `login`, or `myprofile` pages.
- Continuous/proportional opacity scaling tied to `scrollY` (interpretation B was considered and rejected in favor of a step function).
- Mobile hamburger menu (the landing nav already collapses responsively; this change does not touch menu behavior).
- Changing the wordmark, nav link set, search input, or Login/Register button.

## Decisions

### Decision 1: Scroll detection via `svelte:window onscroll` + rAF-throttled `$state<boolean>`

A single `let scrolled = $state(false)` boolean drives the class binding. The handler:

```ts
let ticking = false;
function onScroll() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(() => {
		scrolled = window.scrollY > 30;
		ticking = false;
	});
}
```

bound via `<svelte:window onscroll={onScroll} />`.

**Rationale / alternatives:**

- **IntersectionObserver sentinel** — slightly more performant (no scroll-event firing at all), but more moving parts (sentinel element, `$effect` setup/teardown, root-margin tuning) for a single-element toggle. Overkill here.
- **CSS scroll-driven animations** (`animation-timeline: scroll()`) — no JS, but bleeding-edge browser support and cannot easily toggle discrete Tailwind utility classes. Rejected.
- **Plain `onscroll` without rAF** — works but can fire dozens of times per second during momentum scroll on mobile, mutating `$state` each time. rAF caps work to one computation per frame and coalesces with the browser's paint cycle.

### Decision 2: Step function (binary toggle) at `scrollY > 30px`

The user explicitly chose interpretation A (step) over B (continuous scaling). The threshold of 30px is proportional to the header height (`h-20` = 80px, so ~38% of header height) — enough to detect intent without feeling twitchy on a stray 1–2px scroll nudge.

### Decision 3: `backdrop-blur` always present; only `bg`/`border` toggle

The header element keeps `backdrop-blur` in **both** states. At `scrollY = 0` the hero behind is a solid cream `surface`, so blurring a solid color produces no visible effect — the blur is inert. Once varied content scrolls under, the (already-present) blur activates meaningfully. Only `bg-canvas/80` and `border-b border-hairline` toggle on/off.

**Rationale:** transitioning `backdrop-filter` between `blur(0)` and `blur(12px)` is janky on several browsers; keeping it constant and toggling only `background-color` + `border-color` (both cheap, non-reflowing) gives a clean 200ms fade.

### Decision 4: Drop `shadow-sm` entirely (both states)

DESIGN.md's "flat-by-default elevation" principle is the authority. The hairline border alone divides the header from content; a box-shadow would add unwarranted elevation for a calm bulletin aesthetic.

### Decision 5: `bg-canvas/80` (not `/90`, not `/70`)

- `/90` matches `events/[slug]` but reads as nearly-solid — the "frost" is barely visible.
- `/70` is glassy but risks contrast failure when dark event-card content scrolls under.
- `/80` is the midpoint: clearly frosted, still highly readable. The `canvas` token (cream `#fefae0`) is used rather than `surface` to align with the events-page precedent and the canonical Stitch Material-3 golden palette.

### Decision 6: Scoped to `+page.svelte` (no layout promotion)

Only the landing page has a hero with a background image that benefits from a transparent-at-top header. `events/[slug]` already has its own always-frosted header; `login`/`myprofile` use in-flow (non-sticky) headers. Promoting to `+layout.svelte` would force every route to opt out of a default they did not ask for. Scope stays local.

### Decision 7: SSR-safe initial state

`$state(false)` initializes `scrolled = false`, so the server-rendered HTML emits the "at rest" (transparent) class string. `<svelte:window onscroll>` is a no-op on the server. The first paint is therefore transparent, which is the correct initial state for a page loaded at `scrollY = 0`. If a user lands mid-page via anchor link (e.g. `/#events`), the hydration pass will fire `onscroll` once and correct the state on the first frame — acceptable.

### Decision 8: `position: fixed` (not `sticky`) so the hero bleeds to `y = 0`

The original proposal said `position: sticky; top: 0`, matching the existing `landing-page` spec. During implementation the user pointed out that `sticky` keeps the header **in normal flow** — the header reserves 80px (`h-20`) of vertical space at the top of the document, so the hero section starts at `y = 80`, not `y = 0`. Even with a fully transparent header background, the hero photo does not fill the viewport from the top edge; there is an 80px transparent band above it.

To achieve the user's intent (hero photo as the page's true first impression, header overlaying it), the header SHALL use `position: fixed; top: 0; left: 0; right: 0` (`fixed top-0 inset-x-0`), taking it **out of flow** so the hero section naturally fills from document `y = 0` and the header floats over the top portion. The header's wordmark/nav/login remain visible over the hero at rest (transparent bg); the frosted background appears on scroll.

**Rationale / alternatives:**

- **`position: sticky` + hero `-mt-20` (negative margin)** — would pull the hero up under the in-flow header, but couples the hero's margin to the header's height (fragile), and the spec normatively says `sticky` which would then need a negative-margin exception. Rejected as a hack.
- **`position: absolute`** — would overlay the hero but scroll away with content (header disappears past the hero). Rejected; the header must stay visible.
- **`position: fixed`** — overlays the hero AND stays visible at all scroll positions. Standard "overlay header" pattern. Chosen.

**Consequence — anchor-link offset:** because the header is fixed and overlays the top 80px of the viewport at all times, in-page anchor targets (`#events`, `#blog`, `#partnership`) SHALL set `scroll-margin-top: 80px` (`scroll-mt-20`) so navigating to them does not hide the section heading behind the header. (This also fixes a pre-existing latent bug: the previous `sticky` header had the same issue but it was never normatively addressed.)

**Consequence — width:** under `position: fixed`, the header's containing block is the viewport, so `inset-x-0` (`left: 0; right: 0`) guarantees full-viewport width regardless of the undefined `.full-width` / `.docked` custom classes (which have no definition in `src/routes/layout.css` and are treated as no-ops).

## Risks / Trade-offs

- **Scroll-listener cost on mobile momentum scroll** → rAF throttle caps mutations to one per frame; only a single class toggle on a single element; toggled properties (`background-color`, `border-color`, `backdrop-filter`) do not trigger reflow, only paint.
- **`backdrop-filter` Safari prefix** → Tailwind v4's `backdrop-blur` utility emits `-webkit-backdrop-filter` automatically; no manual prefix needed.
- **Anchor-link loads (e.g. `/#events`) start mid-scroll** → initial paint is transparent (SSR `scrolled=false`), then corrects on the first client-side `onscroll`. Visually: a one-frame transparent-then-frost flicker. Acceptable; not worth a `onMount`-time `scrollY` read for this edge case.
- **Spec/impl drift on the border token** → existing spec said "hairline bottom border" but impl used `border-secondary-fixed`. This change normatively aligns both to `border-hairline` in the scrolled state, fixing the drift as a side effect.
- **Reduced-motion compliance** → the CSS transition MUST be wrapped in a `@media (prefers-reduced-motion: no-preference)` guard (or its inverse) so the default transition does not apply under `reduce`. The JS toggle itself is not motion and remains.

## Migration Plan

1. Edit `src/routes/+page.svelte`: add `scrolled` `$state`, the rAF-throttled `onScroll` function, and `<svelte:window onscroll={onScroll} />`.
2. Replace the `<header>` `class=` string with a conditional `class=` that toggles `bg-canvas/80 border-b border-hairline` based on `scrolled`, while keeping `fixed top-0 inset-x-0 z-50 backdrop-blur` in both states. Remove `bg-surface`, `dark:bg-surface-dim`, `border-secondary-fixed`, `dark:border-outline-variant`, and `shadow-sm`. Drop the undefined `docked full-width` (no-op) in favor of `inset-x-0` for explicit full-viewport width under `fixed`.
3. Add `scroll-mt-20` (80px = header height `h-20`) to the three in-page anchor sections (`#events`, `#blog`, `#partnership`) so anchor-link navigation does not hide their headings behind the fixed header.
4. Add the ~200ms ease-out transition on `background-color` and `border-color` for the `<header>` via Tailwind v4 `motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out` (auto-suppressed under `prefers-reduced-motion: reduce`). Do not transition `backdrop-filter`.
5. Verify: `pnpm check` → `pnpm lint` (or `pnpm format` first if needed) → `pnpm test:unit -- --run` (and manual scroll in `pnpm dev`).

**Rollback:** revert the `<header>` class string to the original static classes (`sticky`, `bg-surface`, etc.), remove the `scroll-mt-20` from the three sections, and delete the `scrolled` state + handler + `<svelte:window>` binding. No data migration, no dependency removal, no token revert.

## Open Questions

None outstanding. All four exploration questions were resolved with the user: threshold (proportional default = 30px), shadow (dropped), scope (landing only), opacity (proportional default = `bg-canvas/80`). Interpretation A (step function) was chosen over B (continuous scaling).
