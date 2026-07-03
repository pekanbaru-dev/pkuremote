## Context

The site is a SvelteKit + Svelte 5 + Tailwind v4 + shadcn-svelte landing page that currently presents as "PKU Remote" — a single editorial page with seven hand-rolled sections (header, hero, featured event, announcements, recent posts, about strip, footer). The brand is repositioning to "PKUBersua" (Pekanbaru + bersua, "to meet") to broaden the community scope from "remote workers" to "komunitas event lintas profesi", and a new design direction has been chosen: the Stitch Material-3 golden palette, which intentionally relaxes the existing "True Neutral Rule" and adopts a warm cream canvas.

The codebase has just absorbed a major primitive-library change (`feat/reusable-primitive-components`, archived as `2026-06-28-port-react-components`) that filled `src/lib/components/ui/` with shadcn-svelte components (`Button`, `StatusBadge`, `EmptyState`, `PanelCard`, `CurrencyDisplay`, `Separator`, etc.). The empty `src/lib/components/ui/card/` folder is an artifact from that change and is filled in by this one. The home-events-ssr-seo work was originally scoped as a UI slice plus SEO/SSR infrastructure, but has now grown to include a full brand repositioning (rename, palette, typography, copy, product register).

The site has no real backend for events. `db/schema/events.ts` defines a minimal `events` table (id, title, startsAt, location, excerpt, body, createdAt) but the runtime page reads a typed const array inside `+page.svelte` — there is no API endpoint, no real registration, no payment. This change keeps that contract: events live in `src/lib/features/events/services/dummy-events.ts` and the booking flow is a `mailto:` link, with no server-side registration logic.

## Goals / Non-Goals

**Goals:**

- Replace the existing seven-section landing page with an event-listing page: header / hero / "Event Akan Datang" / "Event Sebelumnya" / footer.
- Add a fully server-rendered event detail page at `/events/[slug]` with banner, meta, body, price, quota, and a booking CTA.
- Migrate the design tokens in `layout.css` to the Stitch Material-3 golden palette (cream canvas, deep-amber primary) and swap the typography to Hanken Grotesk + Manrope.
- Rename the brand from "PKU Remote" to "PKUBersua" everywhere it appears, with the public surface URL `pkubersua.com` and the booking email `hello@pkubersua.com`.
- Stand up the SEO/SSR infrastructure: per-page meta + canonical + OG + Twitter Card, dynamic `sitemap.xml` and `robots.txt`, JSON-LD `Event` schema on detail pages, lazy images, Lighthouse SEO ≥ 90 / Performance ≥ 80.
- Adopt the `src/lib/features/events/` feature folder for all event-specific code, following the project's feature-based architecture convention; existing `$lib/components/ui/` primitives are reused without modification.
- Document the new positioning in `PRODUCT.md` and the new palette in `DESIGN.md` (with an explicit retirement of the "True Neutral Rule" / "no warm cream" prohibition).
- Keep the change self-contained: 1 PR, atomic rebrand + slice + SEO, reviewable in a single sitting.

**Non-Goals:**

- Implementing a real backend for event CRUD, registration, payment, or authentication. The booking CTA is a `mailto:` link only.
- Custom logo design. The wordmark remains plain text "PKUBersua" in the display font; a future change can replace it with a designed mark.
- Migrating the `db/schema/events.ts` table. The DB schema stays as-is; the new `Event` TypeScript type is a superset that the dummy data can supply without any database migration.
- Real Google Fonts swap at the API level — the `<link>` tags in `app.html` are updated, but no font preloading, subsetting, or self-hosting changes happen in this change.
- DNS setup for `pkubersua.com`, social-media handle updates (Discord, Telegram), and any third-party service re-pointing. None of this is in the repo.
- A real tagline. The hero uses a literal placeholder `[TAGLINE_PKUBERSUA_TBD]` for the brand team to replace in a follow-up edit.
- Removing or migrating the existing three folder-placeholder changes (`home-events-ssr-seo`, `integrate-landing-page-card`, `slice-homepage-stitch`) — they remain as empty placeholders until a future cleanup.

## Decisions

### Decision 1: Stitch Material-3 golden palette is adopted as the canonical design tokens

**Choice:** Rewrite the `@theme` block in `src/routes/layout.css` to match the Stitch Material-3 golden palette in OKLCH, with both the brand-name family (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-primary-container`, `--color-on-primary-container`, `--color-secondary`, `--color-secondary-container`, `--color-tertiary`, `--color-tertiary-container`, `--color-outline`, `--color-outline-variant`, `--color-surface-*`) and the shadcn-mapped family (`--color-background`, `--color-foreground`, `--color-primary-foreground`, `--color-secondary-foreground`, `--color-muted-foreground`, `--color-border`, `--color-input`, `--color-ring`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-popover`, `--color-popover-foreground`, `--color-card`, `--color-card-foreground`).

**Rationale:** The user explicitly chose the Stitch palette and explicitly accepted the override of the existing `DESIGN.md` "True Neutral Rule". Adopting it in OKLCH (not hex) keeps the values within the same shape as the existing tokens, which makes the migration a value-replace rather than a structural rewrite. Keeping the dual-name family (brand names + shadcn names) preserves the existing utility classes (`bg-canvas` and `bg-background` both work) so the many existing primitive components do not need to be touched.

**Alternatives considered:**

- _Adopt only the accent (deep amber), keep true-neutral canvas._ — rejected by the user; they wanted the full Stitch palette, warm cream and all.
- _Add Stitch as a separate theme that the user toggles._ — rejected: out of scope, complicates the design system, and the project has no other brand to toggle to.
- _Switch to hex values throughout `@theme`._ — rejected: the rest of the design system uses OKLCH, and Tailwind v4's `@theme` blocks accept literal values that may include either; OKLCH preserves the design intent and the math (e.g., relative lightness) better.

### Decision 2: Typography swap to Hanken Grotesk + Manrope, kept in one CSS custom-property

**Choice:** Replace `--font-display: "Spectral", ...` and `--font-body: "Source Sans 3", ...` with `--font-display: "Hanken Grotesk", system-ui, sans-serif`, `--font-body: "Hanken Grotesk", system-ui, sans-serif`, and `--font-label: "Manrope", system-ui, sans-serif`. The `app.html` Google Fonts link is updated to request the documented weights (Hanken Grotesk 400, 600, 800; Manrope 500, 600).

**Rationale:** The Stitch `fontSize` table uses these two families across all roles. Keeping `--font-display` and `--font-body` pointing at the same family (Hanken Grotesk) is unusual but matches Stitch exactly: Stitch does not differentiate display vs body, only "headline" (Hanken Grotesk) vs "label" (Manrope). A separate `--font-label` is added so the label role (small caps, tracked, used in meta rows and status badges) can render in Manrope without changing the existing `font-label` class consumers.

**Alternatives considered:**

- _Keep Spectral for display only, switch body to Hanken._ — rejected: not faithful to Stitch and adds two font loads.
- _Use the Stitch `fontSize` keys verbatim (`--text-headline-xl`, etc.)._ — considered; the keys collide with the existing `--text-display` / `--text-headline` tokens used by `landing-page` spec scenarios. We keep the existing key names and update their values, so the spec scenario language (`text-display`, `text-headline`) keeps resolving.
- _Self-host the fonts via `@fontsource`._ — deferred: out of scope, no precedent in the project, and Google Fonts preconnect already works.

### Decision 3: Feature folder for events; the existing `src/routes/+page.svelte` is rewritten in place

**Choice:** All event-specific code lives in `src/lib/features/events/`. The existing `src/routes/+page.svelte` is rewritten to consume `getUpcomingEvents()` and `getPastEvents()` from the feature's public surface, with no event-specific logic in the route file. The new `src/routes/events/[slug]/+page.svelte` follows the same pattern. Existing routes (`/login`, `/myprofile`) only have their `<title>` and any visible "PKU Remote" wordmark updated; their structure is untouched.

**Rationale:** The project already adopts a feature-based architecture (documented in `AGENTS.md` for the new event work and the user explicitly chose "Adopt features/ untuk NEW code saja (existing stays as-is)"). Putting events behind a feature folder lets a future change (e.g., a real event CRUD backend) swap the dummy data service for a real fetch without touching any consumer, and keeps `src/routes/+page.svelte` declarative. The existing `src/lib/components/ui/` is the primitives layer; the feature folder is one level up.

**Alternatives considered:**

- _Refactor all existing code to features/_ — rejected: explicitly out of scope per the user's direction.
- _Put events under `src/lib/components/` next to the primitives._ — rejected: events are a feature, not a primitive; mixing them would violate the feature-based architecture.
- _Skip the feature folder and inline events in `src/lib/server/`._ — rejected: events are client-rendered (the listing uses `$derived`/loaders) and the booking CTA is a `mailto:` link; no server-only logic.

### Decision 4: Booking is a `mailto:` link, not a real registration flow

**Choice:** The booking CTA opens `mailto:hello@pkubersua.com?subject=Booking: {event title}&body=...` in the visitor's mail client. The CTA is `disabled` (with the label "Kuota penuh") when `remainingSlots = 0`. There is no form submission, no API call, no server-side booking.

**Rationale:** The user explicitly chose `mailto:hello@pkubersua.com` as the booking destination, and the rest of the system already documents "BE ngga ada logic, hanya ngirim dummy data". A `mailto:` link requires no backend changes, no auth, no rate limiting, and no spam protection — it ships with the URL scheme itself. A future change can replace the CTA target with a real form endpoint without changing the UI affordance.

**Alternatives considered:**

- _Modal with a registration form (UI only)._ — considered and rejected: gives the illusion of a working registration flow, which is worse than a clear `mailto:` link.
- _Open in a new tab to a Google Form._ — rejected: Google Form IDs are not in scope; a placeholder link would look broken in screenshots.
- _WhatsApp link._ — considered; rejected because the user did not supply a phone number and the email-based flow is more accessible and less region-specific.

### Decision 5: `Event` TypeScript type is a strict superset of the DB schema, with optional fields for the new affordances

**Choice:** The new `Event` type (in `src/lib/features/events/types.ts`) is a strict superset of the DB row (`id, title, startsAt, location, excerpt, body, createdAt`) plus optional `slug`, `endsAt`, `bannerUrl`, `status`, `quota`, `remainingSlots`, `priceNormal`, `pricePromo`, and `category`. All new fields are optional (`null` or absent). The dummy data fills all of them; a real backend can omit any it doesn't know and the UI degrades gracefully (no price block, no quota meter, no banner image).

**Rationale:** The DB schema is the contract a future real backend will eventually conform to; the TypeScript type is the contract the UI conforms to today. Making the type a strict superset with optional fields lets the UI be designed against the full affordance surface without requiring the DB to grow. If/when a real backend lands, it can either extend the DB schema (preferred) or return the extra fields via a denormalized view; the type stays the same either way.

**Alternatives considered:**

- _Mirror the DB schema exactly and have the UI read everything from a separate `eventMetadata` object._ — rejected: introduces a second type for no benefit; the UI doesn't care whether the data came from a column or a denormalized field.
- _Make all new fields required and require a DB migration now._ — rejected: explicitly out of scope (no backend work).

### Decision 6: Per-page meta is hand-authored in `<svelte:head>`, not extracted to a helper

**Choice:** Each route's `<svelte:head>` block lists its `<title>`, `meta name="description"`, `link rel="canonical"`, Open Graph tags, and Twitter Card tags explicitly. There is no `usePageMeta(title, description, image)` helper. The JSON-LD `<script type="application/ld+json">` block is also inline in the event detail page's `<svelte:head>`.

**Rationale:** The project has no precedent for a meta helper; introducing one in this change is a side-quest. The event detail page is the only place with non-trivial meta (OG image varies per event, JSON-LD varies per event) and a helper would save only a few lines. Future public pages can extract a helper if/when three or more pages share the pattern.

**Alternatives considered:**

- _Extract `src/lib/seo/page-meta.ts` with a `setMeta({ title, description, image, type })` helper._ — deferred: a small abstraction now, larger abstraction later, when we have a clearer pattern to abstract over.

### Decision 7: `sitemap.xml` and `robots.txt` are dynamic server routes, not static files in `static/`

**Choice:** Both endpoints are implemented as SvelteKit server routes (`src/routes/sitemap.xml/+server.ts` and `src/routes/robots.txt/+server.ts`) that build the response at request time. `sitemap.xml` reads from the events feature service; `robots.txt` reads from `PUBLIC_SITE_URL`.

**Rationale:** A dynamic sitemap means a new event in the dummy data is reflected in the sitemap on the next request, with no rebuild. A static `static/sitemap.xml` would require a build step to regenerate, which adds friction. The robots route is dynamic for the same reason — the sitemap URL embedded in it needs to come from `PUBLIC_SITE_URL`, which can differ between dev and prod.

**Alternatives considered:**

- _Static `static/sitemap.xml` generated at build time._ — rejected: requires a custom SvelteKit hook or a manual step; the events list is dummy data and changes infrequently but the pattern matters for when real data lands.
- _Server-rendered HTML at `/sitemap` (not XML)._ — rejected: search engines expect `application/xml` at `/sitemap.xml`.

### Decision 8: No `breakpoint`-specific class toggles beyond the existing `<details>` mobile nav

**Choice:** The event listing uses CSS grid/flex with `clamp()` for fluid layout; no `sm:`, `md:`, `lg:` Tailwind variants are used for layout decisions. The only breakpoint-specific markup that survives is the existing `<details>` mobile nav disclosure, which is unchanged.

**Rationale:** The `landing-page` spec's "Layout is responsive without breakpoint-specific markup" requirement is preserved, and it is the established project convention (the existing `+page.svelte` follows it). Adding breakpoint variants would also create screenshot churn that the operator would have to re-verify.

**Alternatives considered:**

- _Use Tailwind `sm:grid-cols-2 lg:grid-cols-3` for the event listing._ — rejected: violates the existing spec; would require a parallel spec change.

## Risks / Trade-offs

- **[Risk] The Stitch palette may not match the long-term "Quiet Bulletin" personality the rest of the project language implies.** → _Mitigation:_ the new positioning (lintas profesi, lebih hangat) already implies a warmer brand; the palette is consistent with that direction. If the brand team later wants a cooler palette, the `@theme` block is the single point of change.
- **[Risk] `EVENTS` data is fully dummy; a future real backend may not return all the new fields (banner, price, quota).** → _Mitigation:_ every new UI affordance has a null/missing-data fallback (no banner placeholder, no price block, no quota meter). A partial response degrades gracefully.
- **[Risk] Adopting Hanken Grotesk for both display and body may feel monotone to a reader expecting more type contrast.** → _Mitigation:_ the `--font-label` role uses Manrope (tracked, smaller, lighter weight) which provides the only typographic counterpoint. If feedback says it's monotone, a future change can split display to a serif (e.g., Spectral) and body to Hanken Grotesk.
- **[Risk] The "True Neutral Rule" retirement in `DESIGN.md` is a one-way door — anyone reading the old rules won't know they were ever the intent.** → _Mitigation:_ the `DESIGN.md` rewrite explicitly notes the retirement and links to the new positioning rationale; the change's `tasks.md` includes a review step that calls out the deletion of the old rules.
- **[Risk] `mailto:` booking is a poor experience on mobile devices without a configured mail client (rare but possible).** → _Mitigation:_ the mailto link is a fallback in those cases; a future change can detect `navigator.canShare` or surface a "copy email" affordance.
- **[Risk] The hero tagline placeholder `[TAGLINE_PKUBERSUA_TBD]` is a literal string in the source; if the brand team forgets to replace it, the site ships with a visible placeholder.** → _Mitigation:_ the `tasks.md` includes a final review step that calls out the placeholder; a follow-up change can add a CI check that the string is not present.
- **[Risk] Per-page meta is hand-authored; if a contributor forgets the canonical or OG tags on a new page, SEO degrades silently.** → _Mitigation:_ the `site-seo` spec's "unique title, description, and canonical URL" requirement is the contract; the change's `tasks.md` includes a manual audit step that fetches `/`, `/events/{slug}` and grep-checks the rendered HTML.
- **[Trade-off] One large change is harder to review than three small ones.** → _Accepted:_ the user explicitly chose this trade-off. The change is structured in three phases (rebrand, slice, SEO) in `tasks.md` so a reviewer can read in order.
- **[Trade-off] No real backend means no end-to-end test of the booking flow.** → _Accepted:_ the `mailto:` link is the entire flow; a future backend change can introduce E2E tests at that point.
- **[Trade-off] Switching typography + palette + brand in one change touches a lot of files; the visual diff is large and a re-screenshot is required.** → _Accepted:_ documented in `tasks.md` as a manual verification step at 360 / 768 / 1280 viewports.

## Migration Plan

The change is a single in-place rewrite of the homepage and the design tokens, plus new routes for events. There is no data to migrate; the DB schema is unchanged. The deployment order on a host is:

1. Build: `pnpm install && pnpm build` (no new dependencies; the build picks up the new shadcn primitives installed into `$lib/components/ui/`).
2. Env: set `PUBLIC_SITE_URL=https://pkubersua.com` and `CONTACT_EMAIL=hello@pkubersua.com` in the production environment. (Both default in `.env.example`; setting them is a no-op for dev.)
3. DNS: outside the repo, point `pkubersua.com` at the deployment host. Caddy (already configured) will obtain a Let's Encrypt cert on first request.
4. Smoke: open `/` in a browser; confirm the hero placeholder, the "Event Akan Datang" section with at least one event, and the "Event Sebelumnya" section. Open `/events/{slug}` and confirm the booking CTA opens a mail compose window. Fetch `/sitemap.xml` and `/robots.txt` and confirm both return XML / plain text.
5. Lighthouse: run a desktop audit on `/` and on a representative `/events/{slug}`; confirm SEO ≥ 90 and Performance ≥ 80.

**Rollback** is a single `git revert` of the merge commit (or branch reset). No data is migrated, no schema changes, no external services touched, so the rollback is safe to run at any point.

## Open Questions

- **Domain registration and DNS for `pkubersua.com`.** Out of repo. Should be confirmed to be in place before the production deploy, but the change itself does not need to wait on it.
- **Tagline.** The hero uses `[TAGLINE_PKUBERSUA_TBD]`. The brand team should replace it in a follow-up one-line edit; the placeholder is documented in `tasks.md` as a final review item.
- **Discord and Telegram handles.** The footer still references the old `pkuremote` handles. Updating them requires creating the new handles out of band; the change leaves a `tasks.md` note that the operator should update the footer once the new handles exist.
- **`CONTACT_EMAIL` env var.** The new `site-seo` requirement hard-codes `hello@pkubersua.com` for the public mailto link (the brand contract is fixed), but `.env.example` introduces a `CONTACT_EMAIL` variable in case a future env (e.g., a staging deploy) wants a different address. The two may diverge; the public-facing mailto always wins.
- **Re-screenshot cost.** The Stitch palette and new typography change the look substantially. The verification step in `tasks.md` includes a manual re-screenshot; the operator should expect ~30 minutes of review time after the change lands.
