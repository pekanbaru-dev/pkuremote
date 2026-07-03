## Context

The `slice-events-rebrand-pkubersua` change (just archived) brought the homepage palette and typography to the Stitch Material-3 golden palette, but the layout composition diverged significantly from the source Stitch design at `projects/15775088065885956423/screens/201e2a86b11f4749a57a6d6ab46caff2` ("Pekanbaru Community - Home with Authentic Partner Logos"). The Stitch design has a fixed 870px hero with a `clip-path: polygon(0 0, 100% 0, 100% 90%, 0% 100%)` bottom edge and a batik-pattern overlay (Pucuk Rebung motif, stroke `#e9c46a`, opacity 0.07), a header with a Material Symbols search bar and a `Login/Register` pill button, a "Upcoming Community Gatherings" 3-column grid with category pills and a per-card `Book Now` CTA, a primary-container "Empower Your Business" CTA with an `Impact` metric card, a "Trusted by Local & Global Partners" 4-logo grid (grayscale → color on hover), and a 4-column footer with an email input + Join button. The current homepage reduces all of that to two event sections and a 2-column footer.

The user has confirmed the visual divergence is unacceptable and has chosen to:

- 100% match the Stitch hero (background image, batik pattern, clip-path, 870px, dual CTAs).
- Skip the Stitch Bento News section (out of scope for an events-only product, no posts in the db schema).
- Ship the Trusted by Partners section with **placeholder** logos (the four logos in the Stitch design — Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia — belong to third-party brands and are not in the project's asset inventory).

## Goals / Non-Goals

**Goals:**

- Match the Stitch design at the pixel level: hero height, hero-clip, batik pattern, background image, dual CTAs, the four new section compositions, the four-column footer with email input.
- Add Material Symbols Outlined as a Google Fonts request so the icon names in the design (`search`, `calendar_today`, `arrow_forward`, `trending_up`, `campaign`, `public`, `alternate_email`, `share`) resolve at runtime.
- Add three custom CSS utility classes (`.hero-clip`, `.talam-shadow`, `.talam-gradient`) and a `--hero-pattern` data-URI SVG variable in `layout.css`.
- Add the new spacing and radius tokens to `@theme` so the new design compiles.
- Add `category` and `categorySecondary` optional fields to the `Event` type and fill them on all 8 dummy events.
- Replace the `EventCard` component with the Stitch style: `bg-surface-container-lowest rounded-xl talam-shadow border-b-2 border-primary-container`, `h-48` banner, two category pills, calendar icon, `Book Now` / `RSVP` / `Register` per-card CTA.
- Replace the "Event Sebelumnya" section with the "Upcoming Community Gatherings" 3-column grid, the "Empower Your Business" CTA, and the "Trusted by Partners" grid.
- Commit four placeholder partner-logo SVGs to `static/partners/` (generic monochrome wordmarks the operator replaces later).
- Verify: `pnpm check` (0 errors), `pnpm lint` (prettier clean, no new eslint warnings), `pnpm test:unit -- --run` (all pass), a manual screenshot of the homepage at 360/768/1280 viewports.

**Non-Goals:**

- Self-hosting the hero background image (Great Mosque of An-Nur) or the partner logos. A future change can move them from the third-party CDN to `static/`.
- The Stitch Bento News section (out of scope for the events-only positioning).
- Using the four original Stitch logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia) — those are third-party trademarks.
- A real backend for partners (the section renders four placeholders; a future change adds a partner-management flow).
- A real search backend (the search input is decorative for this change; a future change wires it to the events service).
- The Stitch talam-gradient utility is documented for completeness but is not applied to any section in this change (it is reserved for future use).

## Decisions

### Decision 1: The hero background image stays at the third-party CDN

**Choice:** The hero background image (Great Mosque of An-Nur) is referenced from its current Stitch-hosted `lh3.googleusercontent.com` URL. The change documents the URL in `proposal.md` and `design.md` but does not commit the image to the repo.

**Rationale:** The image is a third-party asset already hosted by Stitch's CDN, and committing the 100KB+ JPEG would bloat the repo. The `lh3.googleusercontent.com` URL is stable for the lifetime of the Stitch project. A future change can move the image to `static/images/hero-mosque.jpg` if the project stops relying on Stitch.

**Alternatives considered:**

- _Self-host now._ — rejected: adds 100KB+ to the repo for an image that is already available at a stable URL; the operator can self-host later.
- _Use a different Riau-themed image._ — rejected: the user has confirmed the Stitch design as the source of truth; a different image would not be a 100% match.

### Decision 2: Partner logos are simple SVGs the operator replaces

**Choice:** Commit four placeholder partner logos to `static/partners/logo-{1,2,3,4}.svg`. Each is a simple monochrome wordmark (e.g., "Partner One", "Partner Two", ...) sized 200×60px so it fits the `h-12 w-auto` slot in the design.

**Rationale:** The four original Stitch logos (Pekanbaru City, Bank Riau, Visit Riau, Wonderful Indonesia) are third-party trademarks. Shipping them in the repo would create a legal/attribution issue. The placeholders let the design render as Stitch-faithful as soon as the change lands, and the operator can drop in real partner logos when the project has actual partners.

**Alternatives considered:**

- _Use a CDN like `placeholder.com` or `placehold.co` for runtime placeholders._ — rejected: the design needs the `grayscale-40% → full-color on hover` effect, which is cleaner with local SVG than with a placeholder service that requires a request to render.
- _Skip the partners section._ — rejected: the user has confirmed the section is in scope, just with placeholders.

### Decision 3: Material Symbols is loaded as a second Google Fonts request

**Choice:** Add a second `<link>` to `src/app.html` requesting `Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap`. The eight icon names in the design (`search`, `calendar_today`, `arrow_forward`, `trending_up`, `campaign`, `public`, `alternate_email`, `share`) render via `<span class="material-symbols-outlined">icon-name</span>`.

**Rationale:** Material Symbols is the icon family used in the Stitch design. Loading it from Google Fonts (already a project dependency for Hanken Grotesk + Manrope) avoids adding a new package, and the icon set is 200KB+ but loaded asynchronously, so the LCP impact is minimal.

**Alternatives considered:**

- _Use `@lucide/svelte` (already in the project) and map the eight icon names to Lucide equivalents._ — rejected: the visual result is close but not identical; Material Symbols has a different stroke weight and visual style than Lucide. The user wants a 100% match.
- _Self-host Material Symbols via `@fontsource/material-symbols`._ — deferred: adds a new dependency; Google Fonts is the lower-friction path for this change.

### Decision 4: Hero is fixed 870px, not fluid

**Choice:** The hero is `class="h-[870px]"` (fixed), not the existing `clamp()`-based fluid treatment. The hero-clip polygon is applied to the bottom edge.

**Rationale:** The Stitch design has an exact 870px hero — a fluid hero changes the visual composition (the bg image scales differently, the CTAs sit at different positions). A 100% match requires the fixed height.

**Alternatives considered:**

- _Fluid hero with `clamp(700px, 80vh, 870px)`._ — rejected: changes the visual composition; the user wants a 100% match.
- _Remove the bg image to make the fluid hero work._ — rejected: the bg image is part of the Stitch composition; removing it changes the visual identity.

### Decision 5: Event card per-card CTA is a mapping from category

**Choice:** The "Book Now" / "RSVP" / "Register" label on the event card is selected by a small mapping: `workshop` → "Book Now", `meetup` → "RSVP", `talk` → "RSVP", `social` → "Register", `other` → "Register". The mapping lives in the `EventCard` component (not in the data) so a future real backend doesn't have to compute the label.

**Rationale:** The Stitch design shows different per-card labels ("Book Now", "RSVP", "Register") without a data field for the label. The category-based mapping is the cleanest way to mirror the design without changing the `Event` data shape.

**Alternatives considered:**

- _Add a `ctaLabel?: string` field to the `Event` type._ — rejected: adds a data field that 100% duplicates the category; the mapping keeps the data clean.
- _Hardcode "Book Now" everywhere._ — rejected: would not match the Stitch design's "RSVP" / "Register" labels.

### Decision 6: Hero pattern is a CSS variable, not a static file

**Choice:** The Pucuk Rebung batik motif is embedded as a data-URI SVG in a `--hero-pattern` CSS variable in `layout.css`. The `.hero-pattern` utility class uses this variable as the `background-image`.

**Rationale:** The pattern is a 200×200 SVG that fits in a single CSS file. Committing it as a separate file in `static/` would require the same data-URI to be loaded via `<img>` or `background-image: url(/hero-pattern.svg)` — both are slower than the inline data URI. The variable approach also keeps the design token atomic (one place to change the pattern).

**Alternatives considered:**

- _Commit the SVG to `static/hero-pattern.svg` and load via `background-image: url('/hero-pattern.svg')`._ — rejected: adds a file for ~600 bytes of SVG content; the data-URI is self-contained and ships with the CSS.

### Decision 7: The "Event Sebelumnya" section is removed

**Choice:** The previous composition's "Event Sebelumnya" section is REMOVED. The new homepage does not have a past-events listing.

**Rationale:** The Stitch design has no past-events listing on the homepage. Adding one would diverge from the source. The event detail page (`/events/[slug]`) is still the canonical place to find an event; the homepage focuses on what's next.

**Alternatives considered:**

- _Keep "Event Sebelumnya" as a small section after the main grid._ — rejected: diverges from the Stitch composition. The user wants a 100% match.
- _Move "Event Sebelumnya" to a separate `/events/archive` route._ — deferred: not in this change's scope. A future change can add the archive route.

## Risks / Trade-offs

- **[Risk] The hero background image is hosted at a third-party CDN.** If the Stitch project is deleted or the CDN URL changes, the hero will break. → _Mitigation:_ the change documents the URL and the future self-hosting path. The `next.config` or `+layout.svelte` could add a `<link rel="preload">` for the image to make the swap easier.
- **[Risk] Material Symbols adds a ~200KB+ font request.** → _Mitigation:_ the font is loaded with `display=swap`, so text renders immediately with the system fallback. The hero and partners section use only a handful of icon names, so the visible glyph count is low.
- **[Risk] The four placeholder partner logos are obviously placeholders, not real partner brands.** → _Mitigation:_ the placeholders are clearly labeled "Partner One", "Partner Two", etc., so a stakeholder viewing the site knows the section is not yet populated. The `static/partners/README.md` (added in §14) explains the replacement flow.
- **[Risk] The fixed 870px hero may feel cramped on small viewports.** → _Mitigation:_ the bg image uses `object-cover` and the dual CTAs stack vertically below the `sm` breakpoint. The hero composition is tested at 360/768/1280.
- **[Risk] The `talam-gradient` utility is defined but not used.** → _Mitigation:_ the class is documented in the spec and `design.md` as a future-use utility; not a defect.
- **[Trade-off] The change is a visual-only update; the underlying data model is unchanged except for two optional fields.** → _Accepted:_ the goal is a 100% visual match; the data model is intentionally minimal.
- **[Trade-off] The footer 4-col layout is heavier than the previous 2-col.** → _Accepted:_ the Stitch design has 4 columns; matching it is the goal.
- **[Trade-off] The `category` mapping in the EventCard is hardcoded.** → _Accepted:_ a future real backend can either keep the mapping client-side or move it server-side via a new `ctaLabel` field.

## Migration Plan

This is a single in-place rewrite of the homepage and the event-card component. The event detail page is unchanged. The deployment order is:

1. Build: `pnpm install && pnpm build` (no new dependencies).
2. Run: `pnpm dev` and open `http://localhost:5173/`. Confirm the 6 sections render, the hero is 870px with the batik pattern, the events render in a 3-col grid with category pills, the Empower CTA renders, the Trusted by Partners grid renders with placeholders, the footer is 4-col with the email input.
3. Smoke: `curl -I http://localhost:5173/` returns 200.
4. Visual: screenshot at 360/768/1280 viewports and confirm no horizontal overflow.

**Rollback** is a single `git revert` of the change. No data is migrated, no schema changes, no external services touched. The placeholder partner logos are committed but can be deleted or replaced without effect.

## Open Questions

- **Hero background image licensing.** The Great Mosque of An-Nur photo on `lh3.googleusercontent.com` was generated by Stitch and is hosted on its CDN. The project should confirm the licensing before going to production. A future change can replace it with a self-hosted image with a known license.
- **Search input wiring.** The search input is decorative for this change (a `placeholder="Search community..."` with no event handler). A future change wires it to the events service (`getUpcomingEvents()` filtered by title).
- **Email signup in footer.** The email input + Join button has no submit handler. A future change wires it to a newsletter service (or a simple `/api/newsletter` route).
- **Partner management.** A future change adds a `partners` db table, an admin UI to manage partners, and replaces the placeholder logos with real ones.
