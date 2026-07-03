## Why

The homepage implemented in the `slice-events-rebrand-pkubersua` change matches the Stitch Material-3 golden palette and Hanken Grotesk + Manrope typography, but the visual layout diverges significantly from the Stitch design `projects/15775088065885956423/screens/201e2a86b11f4749a57a6d6ab46caff2` ("Pekanbaru Community - Home with Authentic Partner Logos"). The Stitch design has a fixed 870px hero with a hero-clip polygon and a batik-pattern overlay, a header with a search bar and Login/Register pill button, an "Upcoming Community Gatherings" three-column grid with category pills and a per-card "Book Now" CTA, a primary-container "Empower Your Business" CTA with an Impact metric card, a "Trusted by Local & Global Partners" four-logo grid with a grayscale-to-color hover, and a four-column footer with an email input. The current implementation reduces all of that to two event sections and a two-column footer.

## What Changes

- **Rewrite the homepage hero** in `src/routes/+page.svelte` to a fixed 870px-tall section (`h-[870px]`) with a hero-clip polygon (`clip-path: polygon(0 0, 100% 0, 100% 90%, 0% 100%)`), a background image of the Great Mosque of An-Nur (Riau), a batik-pattern overlay (Pucuk Rebung motif, stroke `#e9c46a`, opacity 0.07), a `bg-gradient-to-r from-surface via-surface/80 to-transparent` overlay, a "Pekanbaru Heritage & Culture" pill badge, the Stitch h1 ("Celebrating the Heart of Riau's Local Heritage"), and two CTAs ("Explore Events" filled, "Learn History" outlined). **BREAKING** for the homepage composition.
- **Add a search bar + Login/Register pill button to the header** (header is a sticky, with the existing `<details>` mobile disclosure preserved). The search input uses a Material Symbols `search` icon and is hidden below the `lg` breakpoint.
- **Replace the EventCard component** in `src/lib/features/events/components/event-card.svelte` with the Stitch variant: a fixed 192px-tall (`h-48`) banner, a `bg-surface-container-lowest` white card, `rounded-xl` corners (12px), `talam-shadow` (0 4px 20px rgba(233,196,106,0.15)), a 2px primary-container bottom border, two category pill badges (primary/10 and secondary/10 with `rounded-full` `text-label-md`), a Material Symbols `calendar_today` icon next to the date, a `Book Now` / `RSVP` / `Register` inline right-aligned CTA, and a `group-hover:scale-105` on the banner image. The dummy data SHALL add `category` and `categorySecondary` fields per event.
- **Replace the "Event Akan Datang" section** with "Upcoming Community Gatherings" using a 3-column responsive grid (`grid-cols-1 md:grid-cols-3 gap-gutter`), a section header with a right-aligned "View All Events →" link, and one Stitch-style event card per upcoming event.
- **Add a "Empower Your Business Through Community" CTA section** rendered as a `rounded-3xl` `bg-primary-container` card with a decorative white/10 circle in the top-right, two CTAs ("Become a Partner" filled-on-gold, "Sponsorship Kit" outline-on-gold), and a `bg-white/40 backdrop-blur-md` "Community Impact" metric card listing three numbers (New Members, Event Attendees, Partner Visibility).
- **Add a "Trusted by Local & Global Partners" section** with a 2x2 (mobile) → 4x1 (desktop) grid of partner logos. Each logo tile uses `grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300`. The change ships four **placeholder** logo tiles (generic SVG placeholders the operator can replace); it does NOT ship the original Stitch logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia) because those belong to third-party brands and are not in the project's asset inventory.
- **Add three custom CSS classes** in `src/routes/layout.css`: `.hero-clip`, `.talam-shadow`, `.talam-gradient`. Add a hero-pattern as a data-URI SVG background (the Pucuk Rebung motif from Stitch, encoded as a CSS variable).
- **Add Material Symbols Outlined** to the Google Fonts request in `src/app.html` (`weight 100..700, FILL 0..1`) so the icon names used in the design (search, calendar_today, arrow_forward, trending_up, campaign, public, alternate_email, share) resolve at runtime.
- **Add new spacing tokens** to the `@theme` block: `--spacing-margin-mobile: 16px`, `--spacing-margin-desktop: 80px`, `--spacing-gutter: 24px`, `--spacing-xs: 4px`, `--spacing-sm: 12px`, `--spacing-base: 8px`, `--spacing-md: 24px`, `--spacing-lg: 40px`, `--spacing-xl: 64px`. Add border-radius tokens `--radius-card: 0.75rem` (12px) and `--radius-pill: 9999px` (already present; documented as the canonical "card" and "pill" radii).
- **Replace the footer** in `src/routes/+page.svelte` with a four-column footer (`grid-cols-1 md:grid-cols-4 gap-gutter`): brand block (logo + tagline + 3 social-icon links with Material Symbols), "The Community" nav column, "Support & Partnership" nav column, and a "Stay Connected" column with an email input + Join button. The footer keeps the `© 2026 PKUBersua` copyright line in `.label-meta`.

## Capabilities

### New Capabilities

- `landing-stitch`: The visual design system for the PKUBersua public landing page, derived from the Stitch design `projects/15775088065885956423/screens/201e2a86b11f4749a57a6d6ab46caff2`. Covers the hero layout (870px, clip-path, batik pattern, dual CTAs), the header (search bar + Login/Register), the event-card style (category pills, talam-shadow, primary-container bottom border, calendar icon, Book Now CTA), the Upcoming Community Gatherings 3-column grid, the Empower Your Business CTA with the Community Impact metric card, the Trusted by Partners 4-logo grid (placeholder logos), the four-column footer with email input, and the supporting custom CSS classes (`.hero-clip`, `.talam-shadow`, `.talam-gradient`) and design tokens (spacing, radius).

### Modified Capabilities

- `landing-page`: The existing `landing-page` spec's `Page renders seven semantic sections in order`, `Hero displays one headline, subcopy, and two actions`, `Footer renders wordmark, nav, community links, and copyright`, and `Dummy content is clearly sample data` requirements are MODIFIED to match the new Stitch-aligned homepage composition (hero with two CTAs, three upcoming events in a 3-col grid, Empower CTA, Trusted by Partners, 4-col footer). The `Next event section features one upcoming event` requirement is REPLACED by an "Upcoming Community Gatherings" requirement that describes the 3-column grid and the new "View All Events →" link.
- `events`: The existing `events` spec's `EventCard shows banner, title, date, location, status, and price` requirement is MODIFIED to add the category pills, the calendar icon, the per-card "Book Now" / "RSVP" / "Register" CTA, the `talam-shadow` and primary-container bottom-border styling, and the `h-48` banner height. The `Event` type SHALL add an optional `category: string` and `categorySecondary: string` field (both max 16 chars, displayed as pill labels on the card).

## Impact

- **Code:**
  - `src/routes/+page.svelte` — full rewrite (hero, header, events, CTA, partners, footer).
  - `src/lib/features/events/components/event-card.svelte` — full rewrite to the Stitch style.
  - `src/routes/layout.css` — add `.hero-clip`, `.talam-shadow`, `.talam-gradient`, `--hero-pattern`, plus new spacing and radius tokens.
  - `src/app.html` — add Material Symbols Outlined to the Google Fonts request.
  - `src/lib/features/events/types.ts` — add optional `category` and `categorySecondary` to `Event`.
  - `src/lib/features/events/services/dummy-events.ts` — add `category` and `categorySecondary` to all 8 dummy events.
  - `src/lib/features/events/index.ts` — no public-surface change; the new fields are optional on the existing `Event` type.
- **Assets:**
  - Hero background image (Great Mosque of An-Nur, Riau) — third-party hosted at `lh3.googleusercontent.com`; the change documents the URL but does not commit the image. A future change can self-host.
  - Hero batik pattern (Pucuk Rebung motif) — embedded as a data-URI SVG in `layout.css`; not a separate file.
  - Four placeholder partner logos — committed as simple SVG files at `static/partners/logo-{1,2,3,4}.svg` (each a generic monochrome wordmark the operator replaces later).
- **Out of repo:** none.
- **Specs:** introduces one new capability (`landing-stitch`); modifies two existing capabilities (`landing-page`, `events`).
- **No new runtime dependencies.** Material Symbols is loaded from Google Fonts; no `package.json` change.
- **No breaking API change.** All new event-type fields are optional; a real backend that returns only the DB row will see the new fields as `undefined` and the card will hide the pills (graceful degradation, per the existing `events` spec).
