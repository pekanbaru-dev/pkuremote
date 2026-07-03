## Why

The site currently presents as "PKU Remote" — a quiet bulletin for Pekanbaru's remote workers, built around one featured event, three announcements, and three blog posts on a single hand-rolled page. The brand is repositioning to "PKUBersua" (Pekanbaru + bersua, "to meet") to reflect a broader community-of-events scope across professions, and the landing page needs to be sliced to match a new design system based on a Material-3 golden palette. At the same time, the site lacks the SSR/SEO infrastructure that public event pages need to be discoverable on Google, ChatGPT, Gemini, and Perplexity (titles, descriptions, canonical URLs, Open Graph, JSON-LD `Event` schema, `robots.txt`, `sitemap.xml`, structured performance budgets).

## What Changes

- **Rename the brand** from "PKU Remote" to "PKUBersua" everywhere it appears in the codebase (`+page.svelte`, `login`, `myprofile`, `db/seed.ts`, `PRODUCT.md`, `DESIGN.md`, the public surface URL, and the booking email address `hello@pkubersua.com`).
- **Migrate the design tokens** in `src/routes/layout.css` from the current pure-white / ochre "Quiet Bulletin" palette to the Stitch Material-3 golden palette (cream canvas `#fefae0`, deep-amber primary `#765a05`, primaryContainer `#e9c46a`, plus the full `secondary` / `tertiary` / `outline` / `error` family). This **explicitly overrides** the current `DESIGN.md` "True Neutral Rule" and the prohibition on warm-cream canvas; `DESIGN.md` is updated to reflect the new palette as canonical.
- **Switch typography** from Spectral + Source Sans 3 to Hanken Grotesk (display + body) and Manrope (label), matching the Stitch design system.
- **Replace the landing page** (`src/routes/+page.svelte`): remove the existing hero, featured-event row, announcements list, recent-posts list, and about strip; introduce a new hero/intro, an "Event Akan Datang" section (multi-card list, upcoming sorted ascending), an "Event Sebelumnya" section (multi-card list, past sorted descending), and a footer. **BREAKING** for the public homepage URL `/` (its composition changes from editorial to event-listing).
- **Add an event detail page** at `src/routes/events/[slug]/+page.svelte` (with `+page.server.ts` for SSR data loading) showing banner, title, date/time, location, body, price (normal + promo with strikethrough, or "GRATIS" label), quota display, and a booking CTA. Booking opens `mailto:hello@pkubersua.com?subject=Booking: {event title}`. On desktop the booking panel is sticky; on mobile it renders as a floating action button.
- **Add event feature folder** at `src/lib/features/events/` containing `components/`, `types.ts`, `services/dummy-events.ts`, and an `index.ts` public surface. All event-specific code lives here; primitives are imported only from `$lib/components/ui/`.
- **Add SEO/SSR infrastructure**: per-page `<svelte:head>` with unique `<title>`, `meta description`, canonical URL, Open Graph, and Twitter Card tags; `<script type="application/ld+json">` with `Schema.org Event` on event detail pages; `src/routes/sitemap.xml/+server.ts` (dynamic) listing `/`, `/events/[slug]` entries with `lastmod`; `src/routes/robots.txt/+server.ts` (dynamic) with `Sitemap: <base>/sitemap.xml`.
- **Install missing primitives** to support the new components: fill the empty `card/` folder, add `sheet/` (for the mobile booking drawer), `skeleton/` (for loading states), and `aspect-ratio/` (for the event banner).
- **Apply all event listing/ detail copy and dummy data** to the new "lintas profesi" positioning (workshops, talks, meetups across design, health, dev, etc., not only remote work).
- **Tagline**: hero uses a placeholder string `[TAGLINE_PKUBERSUA_TBD]` that the operator can replace in a follow-up edit without code-side work; a one-line prompt above it invites the visitor to "Kabar terbaru komunitas Pekanbaru dalam satu tempat."
- **Verification**: `pnpm check`, `pnpm lint`, `pnpm test:unit -- --run`; manual screenshot of the homepage and one event detail page at 360/768/1280 viewports; manual Lighthouse run with the SEO ≥ 90 and Performance ≥ 80 budgets.

## Capabilities

### New Capabilities

- `events`: The PKUBersua event system — homepage event listing (upcoming + past), event detail page with banner / meta / body / price / quota / booking CTA, the `features/events/` component folder, the `Event` TypeScript type extended with `bannerUrl`, `status`, `quota`, `remainingSlots`, `priceNormal`, `pricePromo` (all optional), and the dummy-data service that supplies both list and detail data. The booking flow is `mailto:hello@pkubersua.com` only — no backend registration, no payment.
- `site-seo`: The site-wide SEO/SSR infrastructure — per-page meta (title, description, canonical), Open Graph and Twitter Card tags, JSON-LD `Event` schema on event pages, dynamic `sitemap.xml`, dynamic `robots.txt`, lazy-loaded images, and a Lighthouse SEO ≥ 90 / Performance ≥ 80 verification step.
- `brand-pkubersua`: The brand identity for "PKUBersua" — the rename from "PKU Remote", the Stitch-based golden palette adopted as canonical in `DESIGN.md` and `layout.css`, the Hanken Grotesk + Manrope typography swap, the public surface URL `pkubersua.com`, the booking email `hello@pkubersua.com`, and the updated product register copy in `PRODUCT.md`.

### Modified Capabilities

- `landing-page`: The single public landing page at `/` is **replaced** (not edited in place). The seven-section editorial composition (sticky header / hero / featured event / announcements / posts / about / footer) is removed; the new composition is header / hero / event-akan-datang / event-sebelumnya / footer. The "design token system" and "reusable component classes" requirements are updated to reflect the new palette and the `features/events/` component import surface. The "dummy content" requirement is reframed: the typed dummy arrays now supply the `Event` data for the two new sections and the four detail-page dummy entries.

## Impact

- **Code:**
  - `src/routes/+page.svelte` — rewritten as event-listing page.
  - `src/routes/events/[slug]/+page.svelte` — new event detail page.
  - `src/routes/events/[slug]/+page.server.ts` — new SSR data loader.
  - `src/routes/login/+page.svelte`, `src/routes/myprofile/+page.svelte` — `<title>` and wordmark updated.
  - `src/routes/sitemap.xml/+server.ts`, `src/routes/robots.txt/+server.ts` — new dynamic endpoints.
  - `src/routes/layout.css` — `@theme` block rewritten with the Stitch palette; font imports updated to Hanken Grotesk + Manrope.
  - `src/lib/features/events/` — new feature folder with `components/`, `types.ts`, `services/dummy-events.ts`, `index.ts`.
  - `src/lib/components/ui/card/`, `src/lib/components/ui/sheet/`, `src/lib/components/ui/skeleton/`, `src/lib/components/ui/aspect-ratio/` — filled in (card was an empty artifact; the other three are new installs via `shadcn-svelte`).
  - `db/seed.ts` — seed user email and welcome text updated.
  - `PRODUCT.md` — register, users, product purpose, brand personality, design principles updated to "komunitas event lintas profesi Pekanbaru".
  - `DESIGN.md` — palette section rewritten to the Stitch golden palette as canonical; the "True Neutral Rule" and the "no warm cream" prohibition are explicitly retired.
  - `.env.example` — `PUBLIC_SITE_URL` example updated from `http://localhost:5173` (kept as the dev default) plus a documented prod value of `https://pkubersua.com`; new `CONTACT_EMAIL=hello@pkubersua.com` added.
  - `AGENTS.md` — section "Commands" updated to mention the new endpoints; section "Stack quirks" updated to reflect the typography swap.
- **Specs:**
  - Three new capabilities: `events`, `site-seo`, `brand-pkubersua`.
  - One modified capability: `landing-page` (replaced, not deleted — the spec file lives on with new requirements).
- **Public surface:** the homepage composition changes; the old `/` URL still resolves but its content is different. `https://pkubersua.com` is the new canonical domain; the old `pkuremote.id` references in code, copy, and OG tags are gone.
- **Out of repo:** DNS setup for `pkubersua.com`, social-media handle updates (Discord `discord.gg/pkubersua`, Telegram `t.me/pkubersua`), and any third-party service re-pointing. None of this is touched by the change.
- **No new runtime dependencies** beyond the shadcn-svelte primitives installed into `$lib/components/ui/`.
- **Hero tagline** is a placeholder (`[TAGLINE_PKUBERSUA_TBD]`); a follow-up one-line edit replaces it after the brand team supplies copy.
