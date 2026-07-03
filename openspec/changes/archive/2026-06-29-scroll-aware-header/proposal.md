## Why

The landing-page header currently always renders with a solid `bg-surface` background, a bottom border, and a `shadow-sm`. At the top of the page this opaque band sits on top of the hero (cream `surface` + batik pattern + photo), which flattens the hero's intended editorial breathing room and contradicts the "Quiet Bulletin" calm/minimal aesthetic. A transparent-at-top header that frost-glasses only once the visitor scrolls lets the hero read as the page's first impression, while preserving legibility the moment content begins to pass underneath.

## What Changes

- Replace the always-on solid header background with a **two-state, scroll-aware header** on the landing page only:
  - **At rest (`scrollY = 0`)**: transparent background, no bottom border, no shadow.
  - **Scrolled (`scrollY > ~30px`)**: frosted glass — `bg-canvas/80` + `backdrop-blur` + a 1px hairline bottom border.
- The state transition is a **step function** (binary toggle at the threshold), softened by a ~200ms CSS transition on `background-color` and `border-color` for the calm cadence prescribed by `PRODUCT.md`.
- `backdrop-blur` is **always present** on the header element (it is visually inert at top because the hero behind is a solid cream; it activates meaningfully only once varied content scrolls under).
- `shadow-sm` is **removed entirely** from the scrolled state, aligning the header with DESIGN.md's "flat-by-default elevation" principle. The hairline border alone divides the header from content.
- A `svelte:window onscroll` handler drives a Svelte 5 `$state<boolean>` (`scrolled`), throttled via `requestAnimationFrame` so the handler runs at most once per frame.
- Scope is **the landing page only** (`src/routes/+page.svelte`). The header is not promoted to `+layout.svelte`; other routes keep their existing header treatments (e.g. `events/[slug]` is already always-frosted; `login`/`myprofile` are in-flow, non-sticky).
- **No new dependencies.** No change to the design-token palette, typography, or section composition.

## Capabilities

### New Capabilities

<!-- None. This change modifies an existing capability rather than introducing a new one. -->

### Modified Capabilities

- `landing-page`: The "Header is sticky with wordmark and nav" requirement is updated so the header's background, border, and shadow are **conditional on scroll position** (transparent at rest; frosted glass with hairline border — and no shadow — once `scrollY` crosses a small threshold). The previous spec of "sticky with a 1px hairline bottom border" described a single static state; the new spec describes two states plus the transition rule. The threshold, opacity, transition duration, reduced-motion behavior, and JS strategy (rAF-throttled scroll listener) are normative.

## Impact

- **`src/routes/+page.svelte`**: add a `scrolled` `$state`, an `onscroll` handler (rAF-throttled), a `<svelte:window>` binding, and replace the header's static `class=` string with a conditional `class:` binding that toggles the frosted-glass treatment. The `shadow-sm`, `bg-surface`, `dark:bg-surface-dim`, and `border-secondary-fixed` classes are removed from the base string; `backdrop-blur` and `sticky top-0 z-50` remain on the element in both states.
- **No spec-level change to other routes.** `events/[slug]/+page.svelte` already uses `bg-canvas/90 backdrop-blur`; it is unaffected and may continue to differ (always-frosted, no scroll behavior).
- **No dependency, build, or token changes.** Tailwind v4 already generates `bg-canvas`, `backdrop-blur`, and `border-hairline` utilities; `svelte:window` and `$state` are built into Svelte 5 runes mode (already forced in `vite.config.ts`).
- **Accessibility / reduced motion**: under `prefers-reduced-motion: reduce`, the CSS transition duration MUST collapse to effectively 0ms so the state change is instant rather than animated (per the existing "Motion respects reduced-motion preference" requirement in `landing-page` spec). The JS toggle itself is not motion and remains.
- **Performance**: a scroll listener is unavoidable for this behavior; the rAF throttle caps work to one computation per frame, and the only mutation is a class toggle on a single element. No layout thrash because the toggled properties (`background-color`, `border-color`, `backdrop-filter`) do not trigger reflow.
