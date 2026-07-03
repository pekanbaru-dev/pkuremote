## MODIFIED Requirements

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
