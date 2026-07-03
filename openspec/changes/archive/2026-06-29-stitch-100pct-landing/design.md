## Context

The `align-stitch-landing` change (archived `2026-06-29-align-stitch-landing`) brought the homepage to ~95% visual match with the Stitch design at `projects/15775088065885956423/screens/201e2a86b11f4749a57a6d6ab46caff2`, but inspection of the rendered HTML via headless Chromium (`page.evaluate(getComputedStyle)`) reveals that the typography is the failing axis. The Stitch HTML uses the following custom Tailwind class names: `text-headline-xl`, `text-headline-lg`, `text-headline-md`, `text-body-lg`, `text-body-md`, `text-label-lg`, `text-label-md`. The project's `@theme` block in `src/routes/layout.css` defines a different set: `--text-display`, `--text-headline`, `--text-title`, `--text-body`, `--text-label`. Because Tailwind v4 only generates utilities for tokens it knows about, every `text-headline-xl` etc. class in the markup is silently falling back to 16px (the browser's default base font size). Concretely:

- The hero `<h1>` "Celebrating the Heart of Riau's Local Heritage" is rendered at 16px (should be 48px).
- The Empower Your Business `<h2>` is rendered at 16px (should be 48px).
- The "Latest News & Stories" bento `<h2>` is rendered at 16px (should be 32px).
- The "Upcoming Community Gatherings" `<h2>` is rendered at 16px (should be 32px).
- The bento "The Evolution of Pekanbaru's Modern Identity" `<h3>` is rendered at 16px (should be 48px — same as the hero h1 because the Stitch fontSize config maps `headline-xl` to 48px).
- The event card `<h3>` titles are rendered at 16px (should be 24px).
- The "Inspired by the layered sweetness..." body paragraph is rendered at 16px (should be 18px).
- The "Latest News & Stories" subtitle is rendered at 16px (should be 18px).

The visual layout, colors, and component composition are correct; the typography is collapsed to body size. The user has confirmed the goal is **100% visual match**, which is unachievable without (a) lifting the Stitch font-size tokens into `@theme` and (b) rewriting the homepage as a byte-for-byte translation of the Stitch HTML.

The Stitch HTML is now committed at `tmp/index.html` (30,049 bytes, 444 lines, fetched live via the Stitch MCP `get_screen` tool on `2026-06-29`). The goal of this change is to make the rendered output of `src/routes/+page.svelte` visually indistinguishable from the rendered Stitch HTML, with exactly three substitutions (the brand wordmark, the page title, and the partner logos).

## Goals / Non-Goals

**Goals:**

- Lift the seven missing Stitch font-size tokens into `@theme` so that every `text-headline-xl` / `text-headline-lg` / `text-headline-md` / `text-body-lg` / `text-body-md` / `text-label-lg` / `text-label-md` class generates with the Stitch sizes.
- Lift the three missing Stitch color tokens (`--color-inverse-primary`, `--color-on-primary-fixed`, `--color-on-primary-fixed-variant`) into `@theme` so the bento section's "Join the Team" tile can use `bg-primary text-on-primary` and the Empower CTA card's `bg-on-primary-container text-white` references resolve.
- Rewrite `src/routes/+page.svelte` as a byte-for-byte translation of the Stitch HTML (header / hero / events / bento / Empower CTA / Trusted by Partners / 4-col footer), with three substitutions (brand wordmark, page title, partner logos).
- Replace the four placeholder partner logos in `static/partners/` with the four Stitch third-party brand logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia), rendered as inline SVG with `currentColor` fill.
- Replace the eight dummy events with the three Stitch events (Traditional Talam Masterclass, Riau Heritage Night, Local Business Mixer), so the Upcoming Community Gatherings section renders the same three cards as the Stitch design.
- Use the existing `EventCard` component (from `src/lib/features/events/components/event-card.svelte`) with the Stitch class set applied via Tailwind's class merging; use a plain `<button>` (not the project's `Button` component) for the Login/Register button so the Stitch `rounded-full` class is not overridden by the `Button`'s `rounded-lg` default; use a plain `<button>` for the Empower CTAs and bento CTAs for the same reason.
- Verify by `pnpm check` (0 errors), `pnpm lint` (prettier clean, no new eslint errors), `pnpm test:unit -- --run` (all 34 pass), a manual screenshot at 1280px viewport, and a `page.evaluate` of the computed styles for the hero h1, the Empower h2, the bento h2, and the event-card h3 to confirm the font sizes match Stitch.

**Non-Goals:**

- Refactoring the project's existing `Button` component to make `rounded-full` the default (out of scope; the change uses plain `<button>` for the cases where Stitch's `rounded-full` matters).
- Real backend for events (the dummy data is still dummy; the goal is visual match with the Stitch HTML, which uses three events).
- Removing the existing 5-event "archive" of past events from the EventCard reusable component (the component continues to support any number of events; only the dummy data is reduced to three).
- Adding the Bento News section's underlying article schema (the bento tiles use the Stitch HTML's static content; a future change adds a real CMS).
- Self-hosting the hero background image and the four partner logos (the change downloads the assets from the Stitch CDN and re-renders them as inline SVG; a future change can move them to `static/images/` and `static/partners/`).
- Real search functionality (the search input in the header remains decorative).
- Real newsletter signup (the email input + Join button in the footer remains decorative).

## Decisions

### Decision 1: Lift the Stitch font-size tokens verbatim, not as a sub-class

**Choice:** Add the seven missing text-size tokens to `@theme` with the exact values from the Stitch HTML's `tailwind.config.js`:

- `--text-headline-xl: 48px` (with `--text-headline-xl--line-height: 56px`, `--text-headline-xl--letter-spacing: -0.02em`, `--text-headline-xl--font-weight: 800`)
- `--text-headline-lg: 32px` (40px / no letter-spacing / 600)
- `--text-headline-md: 24px` (32px / no letter-spacing / 600)
- `--text-body-lg: 18px` (28px / no letter-spacing / 400)
- `--text-body-md: 16px` (24px / no letter-spacing / 400)
- `--text-label-lg: 14px` (20px / 0.05em / 600)
- `--text-label-md: 12px` (16px / no letter-spacing / 500)

The existing `--text-display`, `--text-headline`, `--text-title`, `--text-body`, `--text-label` tokens are RETIRED. The change's Svelte markup uses the Stitch class names (`text-headline-xl` etc.) so the layout.css change is the single point of contact.

**Rationale:** Tailwind v4 generates a utility class for each `--text-*` token in `@theme`. The Stitch HTML uses `text-headline-xl` etc.; if the project's `@theme` doesn't have those tokens, Tailwind doesn't generate the utilities, and the markup falls back to 16px. Lifting the tokens verbatim means the Svelte markup can use the Stitch class names directly, the rendered output matches the Stitch HTML, and the project's existing `--text-display` etc. tokens (which were never used in the new Stitch composition) can be removed.

**Alternatives considered:**

- _Sub-class with new names (e.g., `--text-h1: 48px` etc.) and update the Svelte markup to use `text-h1` instead of `text-headline-xl`._ — rejected: forces the Svelte markup to use a different class name than the Stitch HTML, which would make a future "diff the rendered HTML against the Stitch HTML" verification impossible. The whole point of this change is to make the markup a literal translation.
- _Use a Tailwind v4 plugin to register the Stitch class names._ — rejected: Tailwind v4's `@theme` block is the documented way to register custom utilities, and using a plugin would add a build-step dependency for what is fundamentally a static token list.
- _Keep the existing `--text-display` etc. tokens AND add the Stitch ones._ — rejected: the existing tokens are no longer used (the Stitch composition uses only `text-headline-xl` / `text-headline-lg` / `text-headline-md` / `text-body-lg` / `text-body-md` / `text-label-lg` / `text-label-md`); keeping them would be dead code.

### Decision 2: Use plain `<button>` for the Login/Register button and the Empower CTAs, not the project's `Button` component

**Choice:** The Login/Register button in the header and the "Become a Partner" / "Sponsorship Kit" CTAs in the Empower section SHALL be plain `<button>` elements with the Stitch class names applied verbatim. The project's `Button` component SHALL NOT be used for these elements.

**Rationale:** The project's `Button` component's `buttonVariants.tv` has a `rounded-lg` class in its base; any class applied via `<Button class="rounded-full">` is overridden by the component's own class merging (or in the worst case, Tailwind's class merging order puts `rounded-lg` after `rounded-full` because `rounded-lg` is in the component's source order). The Stitch HTML uses `rounded-full` on these buttons; a `rounded-lg` override would visually change the button shape. The fix is to use a plain `<button>` for the cases where Stitch's `rounded-full` matters; the project can refactor the `Button` component to make `rounded-full` the default in a future change.

**Alternatives considered:**

- _Add a `pill` variant to the `Button` component that uses `rounded-full`._ — rejected: the `Button` component is documented in the `component-library` spec as a primitive, and adding a `pill` variant is out of scope for this visual-match change. The change is focused on the homepage; the Button refactor is a separate change.
- _Use `Button` with `!rounded-full` (Tailwind v4 important modifier) to force the rounded-full class._ — rejected: the `!` modifier is a Tailwind v3 syntax; in v4 the equivalent is `rounded-full!` but it relies on the class being in the Tailwind generated CSS, which it is. The `!` modifier would work in theory, but the simpler plain-`<button>` approach is what the Stitch HTML does and avoids depending on a Tailwind v4 feature that may not survive the version bump.

### Decision 3: Use the existing `EventCard` component with the Stitch class set

**Choice:** The Upcoming Community Gatherings section SHALL use the project's `EventCard` component from `src/lib/features/events/components/event-card.svelte`. The component SHALL be re-styled to use the Stitch class set (`bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden group`).

**Rationale:** The `EventCard` component is the project's reusable primitive for event display; the Stitch HTML's event card class set is a perfect match for what the component should render. The change reuses the component and applies the Stitch class set via the existing class-merging mechanism (Tailwind's `cn()` utility).

**Alternatives considered:**

- _Render the event cards as plain HTML (not via the component)._ — rejected: the `EventCard` component is the documented primitive; using it keeps the code DRY and lets a future change (e.g., adding a "categoryLabel" pill to the event detail page) update both surfaces at once.
- _Create a new `StitchEventCard` component._ — rejected: the project would end up with two event-card components; the existing one is generic enough to take the Stitch class set.

### Decision 4: Download the four third-party partner logos as inline SVG

**Choice:** The four Stitch third-party partner logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia) are downloaded from the Stitch CDN and re-rendered as inline SVG files at `static/partners/logo-{1,2,3,4}.svg`. Each SVG is 200×60 viewBox with `fill="currentColor"`.

**Rationale:** The Stitch HTML references the logos via `<img src="https://lh3.googleusercontent.com/.../...">`; a literal translation would keep the CDN URLs. The change downloads the logos so the project doesn't depend on the Stitch CDN's stability. The `currentColor` fill preserves the grayscale → color hover effect (Tailwind's `grayscale` filter is applied to the rendered SVG, and the SVG inherits the `text-primary` color via `currentColor`).

**Alternatives considered:**

- _Keep the CDN URLs._ — rejected: the project becomes dependent on a third-party CDN that is not under the project's control; a Stitch-side change would break the production site.
- _Skip the four logos and keep the placeholders from the `align-stitch-landing` change._ — rejected: the user has confirmed the goal is 100% visual match, which requires the real logos (or visual equivalents of them).

### Decision 5: Replace the eight dummy events with the three Stitch events

**Choice:** The dummy data in `src/lib/features/events/services/dummy-events.ts` is reduced from eight events to three (Traditional Talam Masterclass, Riau Heritage Night, Local Business Mixer), matching the Stitch HTML's Upcoming Community Gatherings section.

**Rationale:** The Stitch HTML has exactly three events; the homepage matches that count. The five past events (UI Typography, Svelte 5 Runes, Ngobrol Santai, Malam Membaca, Ngoprek ESP32, Intro to Data Engineering) are removed from the dummy data because the Stitch design has no past-events listing on the homepage. A future change can re-add the past events as a separate "archive" route.

**Alternatives considered:**

- _Keep all eight events; pick the first three for the homepage._ — rejected: the Stitch design has no past-events listing, so keeping the five past events in the dummy data is dead code.
- _Move the five past events to a separate "archive" route._ — out of scope for this change; a future change adds the archive.

## Risks / Trade-offs

- **[Risk] The four third-party partner logos are trademarks of their respective brands.** → _Mitigation:_ the change ships the logos but the operator should add an attribution line ("Logos used with permission from [Brand]") in the footer before going to production. A future change can replace the logos with permission-confirmed alternatives if the trademark holder objects.
- **[Risk] The hero background image (Great Mosque of An-Nur) is hosted at the Stitch CDN.** → _Mitigation:_ the change documents the URL and a future change can move the image to `static/images/hero-mosque.jpg` for self-hosting.
- **[Risk] The `Button` component is bypassed in the Login/Register position, which is a one-off inconsistency.** → _Mitigation:_ the change uses a plain `<button>` with the Stitch class set; a future change adds a `pill` variant to the `Button` component and migrates the Login/Register button back.
- **[Trade-off] The bento news section is now driven by static HTML, not by a CMS.** → _Accepted:_ the goal is 100% visual match with the Stitch HTML, which has static content. A future change adds a CMS-backed news source.
- **[Trade-off] The bento news section is added to the homepage, which is a breaking change to the previous composition (no bento).** → _Accepted:_ the user has confirmed the goal is 100% visual match, which requires the bento section.
- **[Trade-off] The 5 past events are removed from the dummy data; the event detail page returns 404 for those slugs.** → _Accepted:_ the goal is 100% visual match with the Stitch HTML, which has three events. A future change re-adds the past events as an archive route.

## Migration Plan

This is a single in-place rewrite of the homepage, the design tokens, the dummy data, and the four partner logos. The deployment order is:

1. Build: `pnpm install && pnpm build` (no new dependencies).
2. Run: `pnpm dev` and open `http://localhost:5173/`. Confirm the rendered HTML matches the Stitch HTML element-for-element, the typography is at the correct sizes, the four partner logos render in grayscale, and the footer is 4-column.
3. Smoke: `curl -I http://localhost:5173/` returns 200; `curl -I http://localhost:5173/sitemap.xml` returns 200; `curl -I http://localhost:5173/robots.txt` returns 200.
4. Visual: screenshot at 1280px viewport and confirm the rendered output is visually indistinguishable from the Stitch design.
5. Spec: run `page.evaluate(getComputedStyle)` on the hero h1, the Empower h2, the bento h2, and the event-card h3 to confirm the font sizes match the Stitch values.

**Rollback** is a single `git revert` of the change. The four third-party partner logos can be replaced with placeholders; the three Stitch events can be replaced with the previous eight events.

## Open Questions

- _Are the four third-party partner logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia) acceptable for production use?_ The change ships them but the operator should confirm the licensing before going to production.
- _Is the hero background image (Great Mosque of An-Nur, hosted at `lh3.googleusercontent.com`) acceptable for production use?_ The change documents the URL; a future change can self-host the image.
- _Should the bento news section be a CMS-driven list of articles?_ A future change can wire the bento tiles to a CMS; this change ships static content.
- _Should the search input and email signup be wired up?_ Both are decorative in this change; a future change wires them to the events service and a newsletter endpoint.
