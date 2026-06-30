## 1. Lift Stitch font-size and color tokens into `@theme`

- [ ] 1.1 In `src/routes/layout.css`, add the seven missing text-size tokens to `@theme`, each as a compound value with the four properties Tailwind v4 expects (size, line-height, letter-spacing, font-weight) so that `text-headline-xl`, `text-headline-lg`, `text-headline-md`, `text-body-lg`, `text-body-md`, `text-label-lg`, `text-label-md` all generate as Tailwind utilities:
  - `--text-headline-xl: 48px` with `--text-headline-xl--line-height: 56px`, `--text-headline-xl--letter-spacing: -0.02em`, `--text-headline-xl--font-weight: 800`
  - `--text-headline-lg: 32px` with `--text-headline-lg--line-height: 40px`, `--text-headline-lg--font-weight: 600`
  - `--text-headline-md: 24px` with `--text-headline-md--line-height: 32px`, `--text-headline-md--font-weight: 600`
  - `--text-body-lg: 18px` with `--text-body-lg--line-height: 28px`, `--text-body-lg--font-weight: 400`
  - `--text-body-md: 16px` with `--text-body-md--line-height: 24px`, `--text-body-md--font-weight: 400`
  - `--text-label-lg: 14px` with `--text-label-lg--line-height: 20px`, `--text-label-lg--letter-spacing: 0.05em`, `--text-label-lg--font-weight: 600`
  - `--text-label-md: 12px` with `--text-label-md--line-height: 16px`, `--text-label-md--font-weight: 500`
- [ ] 1.2 Add the three missing color tokens: `--color-inverse-primary: #e7c268`, `--color-on-primary-fixed: #251a00`, `--color-on-primary-fixed-variant: #5a4400`.
- [ ] 1.3 Retire the existing `--text-display`, `--text-headline`, `--text-title`, `--text-body`, `--text-label` tokens (no longer used in the Stitch composition). Keep the other tokens (colors, radius, spacing) intact.
- [ ] 1.4 Run `pnpm exec svelte-kit sync && pnpm check` and confirm Tailwind v4 generates the seven new utility classes (no warnings about unknown class names).
- [ ] 1.5 Run `pnpm dev` and visit `http://localhost:5173/`. Open the browser's DevTools, inspect the hero `<h1>`, and confirm the computed font-size is 48px (not 16px).

## 2. Rewrite the homepage as a byte-for-byte translation of the Stitch HTML

- [ ] 2.1 Open `src/routes/+page.svelte` and replace the entire file content with a translation of the Stitch HTML at `tmp/index.html` (lines 121–443, body tag onwards). The translation uses the Stitch class names verbatim (e.g., `class="font-headline-xl text-headline-xl text-primary mb-md leading-tight"` for the hero h1, NOT the project's existing utilities).
- [ ] 2.2 Render the header (Stitch lines 123–144): a `<header class="bg-surface dark:bg-surface-dim border-b border-secondary-fixed dark:border-outline-variant shadow-sm docked full-width top-0 sticky z-50">` with the wordmark `<div class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">PKUBersua</div>` (substitution from "Pekanbaru Community"), the four nav links (Home with the active-state classes `text-primary font-bold border-b-2 border-primary pb-1`, Events / Blog / Partnership with the default-state classes), the search bar, and the Login/Register pill button.
- [ ] 2.3 Render the Login/Register pill as a plain `<button class="bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg hover:opacity-90 transition-all active:scale-95">Login/Register</button>` (Stitch lines 139–141). Do NOT use the project's `Button` component (its `rounded-lg` base class would override the Stitch `rounded-full` class).
- [ ] 2.4 Render the hero (Stitch lines 146–174): the `<section class="relative w-full h-[870px] bg-surface overflow-hidden flex items-center hero-clip">` containing the batik-pattern `<div>`, the bg-image `<div>`, the gradient overlay `<div>`, and the content container with the badge `<span>`, the h1 with the `<span class="text-secondary">Riau's Local Heritage</span>`, the body paragraph, and the two CTAs (Explore Events and Learn History). Use plain `<button>` elements for the two CTAs (Stitch's `rounded-lg` and `rounded-lg` is correct for these; no need to force a different shape).
- [ ] 2.5 Render the events section (Stitch lines 175–251): the `<section class="py-xl px-margin-desktop max-w-[1280px] mx-auto">` containing the header row (h2 "Upcoming Community Gatherings", subtitle, "View All Events →" link), and the 3-column grid of three event cards. Each event card SHALL use the existing `<EventCard>` component from `$lib/features/events` with the Stitch class set applied via the component's class merging.
- [ ] 2.6 Render the bento news section (Stitch lines 252–311): the `<section class="py-xl bg-surface-container-low">` containing the centered header (h2 "Latest News & Stories", subtitle), and the 4-column × 2-row grid (`md:grid-cols-4 grid-rows-2 gap-gutter h-auto md:h-[600px]`) with the four tiles (Community Feature 2×2, Local Guide 2×1, Sponsorship Goal Reached 1×1, Join the Team 1×1). Use the Stitch class names verbatim.
- [ ] 2.7 Render the Empower Your Business CTA section (Stitch lines 312–358): the `<section class="py-xl px-margin-desktop">` containing the `<div class="max-w-[1280px] mx-auto bg-primary-container rounded-3xl p-xl flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">` card with the decorative white/10 circle, the left content (h2, body, two CTAs), and the right Impact metric card. Use plain `<button>` elements for the two CTAs.
- [ ] 2.8 Render the Trusted by Partners section (Stitch lines 361–376): the `<section class="py-xl px-margin-desktop bg-surface">` containing the centered h2, the subtitle, and the 4-logo grid (`grid grid-cols-2 sm:grid-cols-4 gap-lg`). Each logo tile SHALL be `<div class="flex items-center justify-center p-md grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"><img alt="<brand> Logo" class="h-12 w-auto object-contain" src="/partners/logo-<N>.svg"></div>`.
- [ ] 2.9 Render the 4-column footer (Stitch lines 376–419): the `<footer class="bg-surface-container-highest dark:bg-surface-container-low border-t border-secondary-fixed py-xl">` with the four columns (brand → "PKUBersua" substitution, The Community nav, Support & Partnership nav, Stay Connected with email input + Join), plus the `© 2024 PKUBersua. Inspired by the heritage of Talam Durian.` line at the bottom.
- [ ] 2.10 Keep the existing `<svelte:head>` block (title, description, canonical, OG, Twitter Card) with the title updated to "PKUBersua — [TAGLINE_PKUBERSUA_TBD]" (matching the title's pattern in `slice-events-rebrand-pkubersua`).
- [ ] 2.11 Run `pnpm check` and confirm the homepage compiles without errors.

## 3. Replace the four placeholder partner logos with the Stitch third-party logos

- [ ] 3.1 Download the four third-party partner logos from the Stitch CDN URLs documented in the Stitch HTML (line 369 = Pekanbaru City, line 370 = Bank Riau, line 371 = Visit Riau, line 372 = Wonderful Indonesia) and re-render them as 200×60 viewBox inline SVG files at `static/partners/logo-{1,2,3,4}.svg`. Each SVG SHALL have `fill="currentColor"` and SHALL render the brand wordmark in a generic sans-serif.
- [ ] 3.2 Update `static/partners/README.md` to document the four new logos (no longer placeholders). Document the `currentColor` fill requirement and the operator's responsibility to confirm the third-party trademark licensing before production.

## 4. Replace the eight dummy events with the three Stitch events

- [ ] 4.1 In `src/lib/features/events/services/dummy-events.ts`, replace the eight dummy events with the three Stitch events: "Traditional Talam Masterclass" (slug `traditional-talam-masterclass`, category `workshop`, categoryLabel `Culinary`, categorySecondary `Workshop`, date 2024-10-24, banner, location, excerpt, body, all required fields), "Riau Heritage Night" (slug `riau-heritage-night`, category `meetup`, categoryLabel `Culture`, categorySecondary `Festival`, date 2024-11-02, all required fields), and "Local Business Mixer" (slug `local-business-mixer`, category `meetup`, categoryLabel `Business`, categorySecondary `Networking`, date 2024-11-15, all required fields).
- [ ] 4.2 Confirm the `Event` type in `src/lib/features/events/types.ts` has the `categoryLabel` and `categorySecondary` fields (already added by the previous `align-stitch-landing` change; no change needed if already present).
- [ ] 4.3 Run `pnpm check` and confirm the dummy data passes the type check.

## 5. Re-style the EventCard to match the Stitch class set

- [ ] 5.1 Open `src/lib/features/events/components/event-card.svelte` and confirm the root `<a>` element has the Stitch class set: `bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container overflow-hidden group`. The banner `<div>` SHALL be `h-48 overflow-hidden`. The category pills SHALL be `px-3 py-1 bg-primary/10 text-primary rounded-full text-label-md` and `px-3 py-1 bg-secondary/10 text-secondary rounded-full text-label-md`. The h3 SHALL be `font-headline-md text-headline-md`. The CTA SHALL be `text-primary font-bold hover:translate-x-1 transition-transform` (text mapped by category via the existing `ctaLabel()` function: workshop → "Book Now", meetup/talk → "RSVP", social/other → "Register").

## 6. Verification

- [ ] 6.1 Run `pnpm check` and confirm 0 errors and 0 warnings.
- [ ] 6.2 Run `pnpm format && pnpm lint` and confirm prettier and eslint pass. (The 1 pre-existing eslint error in `oauth-callback.test.ts` is acceptable.)
- [ ] 6.3 Run `pnpm test:unit -- --run` and confirm all 34 unit tests still pass.
- [ ] 6.4 Run `pnpm dev` and screenshot the homepage at 1280px viewport. Confirm the rendered output is visually indistinguishable from the Stitch design.
- [ ] 6.5 Open a Chromium DevTools session, navigate to `http://localhost:5173/`, and run `page.evaluate(getComputedStyle)` (or use the DevTools console) to confirm:
  - Hero h1 computed `font-size: 48px`, `line-height: 56px`, `font-weight: 800`, `letter-spacing: -0.02em`.
  - Empower h2 computed `font-size: 48px`, `line-height: 56px`, `font-weight: 800`.
  - Bento h2 ("Latest News & Stories") computed `font-size: 32px`, `line-height: 40px`, `font-weight: 600`.
  - Bento h3 ("The Evolution of Pekanbaru's Modern Identity") computed `font-size: 48px`, `line-height: 56px`, `font-weight: 800`.
  - Event-card h3 ("Traditional Talam Masterclass") computed `font-size: 24px`, `line-height: 32px`, `font-weight: 600`.
  - Body paragraph ("Inspired by the layered sweetness...") computed `font-size: 18px`, `line-height: 28px`, `font-weight: 400`.
- [ ] 6.6 Confirm the four partner logos render in grayscale (default state) and colorize on hover.
- [ ] 6.7 Run the brand grep: `git grep -in 'PKU Remote\|pku-remote\|pkuremote\|pekanbaru.dev' -- 'src' 'db' 'PRODUCT.md' 'DESIGN.md' 'AGENTS.md' 'openspec' 'static'`. Confirm zero matches.

## 7. OpenSpec archive

- [ ] 7.1 Run `openspec archive stitch-100pct-landing --yes` to move the change into `openspec/changes/archive/YYYY-MM-DD-stitch-100pct-landing/` and promote the new `stitch-100pct` spec plus the four modified spec deltas to canonical.
- [ ] 7.2 Verify the archive directory contains the four artifacts (`proposal.md`, `design.md`, `tasks.md`, `specs/`).
- [ ] 7.3 Verify `openspec list` no longer shows `stitch-100pct-landing` as an active change.

## 8. Operator follow-up (not in repo)

- [ ] 8.1 Confirm the third-party partner logos' licensing is acceptable for production use. If not, replace the four SVGs in `static/partners/` with permission-confirmed alternatives.
- [ ] 8.2 Confirm the Great Mosque of An-Nur background image licensing is acceptable for production. If not, replace the bg image URL with a self-hosted image (move to `static/images/hero-mosque.jpg` and update the URL in `+page.svelte`).
- [ ] 8.3 Add an attribution line in the footer for the four partner logos (e.g., "Logos used with permission from Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia").
- [ ] 8.4 Wire the search input in the header to the events service (`getUpcomingEvents()` filtered by title) and the email signup in the footer to a newsletter endpoint. Both are decorative in this change.
- [ ] 8.5 Replace the literal `[TAGLINE_PKUBERSUA_TBD]` in `src/routes/+page.svelte` with the real tagline once the brand team supplies copy.
