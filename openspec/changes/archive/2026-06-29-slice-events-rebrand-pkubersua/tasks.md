## 1. Brand: rename, palette, typography, copy

- [ ] 1.1 In `PRODUCT.md`, replace the register, users section, product purpose, and design principles to reflect "PKUBersua" and the lintas-profesi positioning. Remove every occurrence of "PKU Remote" and "remote-working people" / "remote workers".
- [ ] 1.2 In `DESIGN.md`, rewrite the palette section to document the Stitch Material-3 golden palette (canvas `#fefae0`, primary `#765a05`, primary-container `#e9c46a`, plus the secondary/tertiary/outline/error family) as the canonical palette. Update the typography section to name Hanken Grotesk + Manrope. Explicitly retire the "True Neutral Rule" and the "no warm cream" prohibition; the canvas is intentionally warm cream. Keep the prohibition on gradient text, ghost cards, eyebrow kickers, and hero-metric templates.
- [ ] 1.3 In `AGENTS.md` "Stack quirks" section, replace any Spectral / Source Sans 3 references with the new Hanken Grotesk + Manrope stack. Replace any reference to the old `#fefae0` (none currently exists) with a pointer to the new palette in `layout.css`.
- [ ] 1.4 Run a project-wide grep for `PKU Remote`, `pku remote`, `pku-remote`, `pkuremote`, and `pekanbaru.dev` (case-insensitive) and confirm zero matches in tracked files under `src/`, `db/`, `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `openspec/`, and `static/`. The grep should be run from the repo root: `git grep -in 'PKU Remote\|pku-remote\|pkuremote\|pekanbaru.dev' -- 'src' 'db' 'PRODUCT.md' 'DESIGN.md' 'AGENTS.md' 'openspec' 'static'`.
- [ ] 1.5 In `db/seed.ts`, replace the `SEED_USER_EMAIL` constant value with `seed-author@pkubersua.local` and the welcome content title from `"Welcome to PKU Remote"` to `"Welcome to PKUBersua"`. (The `db` directory is not exercised by the runtime; the change is for consistency.)

## 2. Design tokens: layout.css @theme rewrite

- [ ] 2.1 Open `src/routes/layout.css` and replace the `@theme` block with the Stitch Material-3 golden palette in OKLCH. Keep both the brand-name family (`--color-canvas`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-hairline`, `--color-primary`, `--color-primary-hover`, `--color-primary-container`, `--color-on-primary-container`, `--color-secondary`, `--color-secondary-container`, `--color-on-secondary-container`, `--color-tertiary`, `--color-tertiary-container`, `--color-on-tertiary-container`, `--color-outline`, `--color-outline-variant`, `--color-surface-container-lowest`, `--color-surface-container-low`, `--color-surface-container`, `--color-surface-container-high`, `--color-surface-container-highest`, `--color-surface-bright`, `--color-surface-dim`, `--color-surface-variant`, `--color-on-surface`, `--color-on-surface-variant`, `--color-inverse-surface`, `--color-inverse-on-surface`, `--color-inverse-primary`, `--color-surface-tint`) and the shadcn-mapped family (`--color-background`, `--color-foreground`, `--color-primary-foreground`, `--color-secondary-foreground`, `--color-muted-foreground`, `--color-border`, `--color-input`, `--color-ring`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-popover`, `--color-popover-foreground`, `--color-card`, `--color-card-foreground`).
- [ ] 2.2 Verify the OKLCH values: canvas `oklch(0.981 0.034 100)`, primary `oklch(0.483 0.097 87)`, primary-container `oklch(0.834 0.117 87)`, ink `oklch(0.223 0.027 105)`, on-surface-variant `oklch(0.397 0.024 85)`, outline-variant `oklch(0.827 0.029 81)`, error `oklch(0.506 0.193 28)`. The complete mapping table is in `design.md` Decision 1.
- [ ] 2.3 Update the font tokens: `--font-display: "Hanken Grotesk", system-ui, sans-serif;`, `--font-body: "Hanken Grotesk", system-ui, sans-serif;`, `--font-label: "Manrope", system-ui, sans-serif;`. Keep the existing token names (`--font-display`, `--font-body`) so primitive components that reference them do not break; add `--font-label` as a new token.
- [ ] 2.4 Update the text-size tokens to match the Stitch `fontSize` table while keeping the existing key names: `--text-display` (Hanken Grotesk 800, `clamp(2.5rem, 6vw, 4rem)` for hero), `--text-headline` (Hanken Grotesk 600, `clamp(1.75rem, 3.5vw, 2.25rem)` for section heads), `--text-title` (Hanken Grotesk 600, 1.25rem for card titles), `--text-body` (Hanken Grotesk 400, 1rem for body), `--text-label` (Manrope 500, 0.8125rem for meta/labels). Use `clamp()` for the display and headline sizes to keep the existing fluid behaviour.
- [ ] 2.5 Recompute the `ink` and `muted` contrast ratios against the new cream canvas. If `ink` falls below 7:1, darken it (start by reducing lightness) until the ratio is satisfied; if `muted` falls below 4.5:1, darken it similarly. The site-seo spec scenario "Body text contrast against canvas" and "Muted text contrast against canvas" document the targets.
- [ ] 2.6 Keep the existing utility classes in the `@layer components` block (`.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet`). Update `.label-meta` to use the new `--font-label` and `--text-label` tokens. Do not add new utility classes; rely on Tailwind utilities mapped to the new tokens.

## 3. Web fonts: app.html Google Fonts link

- [ ] 3.1 Open `src/app.html` and replace the Google Fonts stylesheet `<link>` to request Hanken Grotesk (weights 400, 600, 800) and Manrope (weights 500, 600) with `display=swap`. Keep the existing `<link rel="preconnect">` tags for `fonts.googleapis.com` and `fonts.gstatic.com` (with `crossorigin`).
- [ ] 3.2 Verify in a slow-connection simulation (or by reading the stylesheet) that the fallback stack (`system-ui, sans-serif`) is used until the web fonts arrive, with no flash of invisible text.

## 4. Feature folder: `src/lib/features/events/`

- [ ] 4.1 Create the folder `src/lib/features/events/` with subfolders `components/` and `services/`. The folder structure follows the project's feature-based architecture convention documented in `AGENTS.md`.
- [ ] 4.2 Create `src/lib/features/events/types.ts` exporting the `Event` type with the fields documented in the `events` spec: `id`, `slug`, `title`, `startsAt`, `endsAt?`, `location`, `excerpt`, `body`, `bannerUrl?`, `status`, `quota?`, `remainingSlots?`, `priceNormal?`, `pricePromo?`, `category?`. Export the `EventStatus` and `EventCategory` literal types as named exports.
- [ ] 4.3 Create `src/lib/features/events/services/dummy-events.ts` exporting `getUpcomingEvents(): Event[]`, `getPastEvents(): Event[]`, and `getEventBySlug(slug: string): Event | undefined`. The data SHALL be a typed `const` array of at least 4 upcoming events and 4 past events, covering the lintas-profesi positioning (workshops, talks, meetups across design, health, dev, community, etc.). The function `getEventBySlug` SHALL return `undefined` for unknown slugs; the route's `+page.server.ts` SHALL translate that to a 404.
- [ ] 4.4 Create `src/lib/features/events/index.ts` as the public surface. Export the `Event` type, the three service functions, and (placeholder for now) the public components. The route files SHALL import only from `$lib/features/events`, not from any nested file.
- [ ] 4.5 Audit: grep `src/lib/features/events/components/` (after components are added in §5) for `from "$lib/features/` and confirm the only matches are the feature's own `$lib/features/events` import surface.

## 5. Event components: card, list, detail parts

- [ ] 5.1 Create `src/lib/features/events/components/event-card.svelte`. The component SHALL be a single `<a>` linking to `/events/{event.slug}` and SHALL render the banner (or a 16:9 placeholder block when `bannerUrl` is null), the title (truncated to 2 lines), the date formatted with `Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })` + the literal suffix ` WIB`, the location, a `StatusBadge` (variant `primary` for upcoming, `neutral` for past), and the price summary. The title SHALL be the accessible name (`aria-label` is redundant if the visible text is the title; confirm by inspection). Reuse only `$lib/components/ui/` primitives.
- [ ] 5.2 Create `src/lib/features/events/components/event-list.svelte`. The component SHALL accept an `events: Event[]` prop and render an unordered list of `EventCard`s. The list SHALL NOT add any wrapper card or shadow; the editorial layout is the responsibility of the parent route.
- [ ] 5.3 Create `src/lib/features/events/components/event-detail-hero.svelte`. The component SHALL render the event banner (16:9, full-width, with `loading="lazy"` and `decoding="async"`), the title (display font, ink), the status badge, the date, and the location. The component SHALL NOT render the price block, the quota, or the booking CTA — those live in the booking panel.
- [ ] 5.4 Create `src/lib/features/events/components/event-booking-cta.svelte`. The component SHALL accept `event: Event` and SHALL render either a desktop sticky panel or a mobile floating action button, depending on the `mode` prop (`"desktop" | "mobile" | "both"`). The CTA's `<a>` SHALL have `href="mailto:hello@pkubersua.com?subject=Booking: {event.title}&body=..."` (the `body` is pre-filled per the events spec). When `event.remainingSlots === 0`, the button SHALL render as `disabled` with the label "Kuota penuh" and `aria-disabled="true"`.
- [ ] 5.5 Create `src/lib/features/events/components/event-price-block.svelte`. The component SHALL accept `event: Event` and SHALL render the price block per the events spec "Price block supports free, normal, and promo pricing" requirement. Use `$lib/components/ui/currency-display` for currency rendering. When `priceNormal` is null, show a "GRATIS" label in the primary accent color.
- [ ] 5.6 Create `src/lib/features/events/components/event-quota-meter.svelte`. The component SHALL accept `event: Event` and SHALL render the quota line and the progress bar per the events spec "Quota display" requirement. When either `quota` or `remainingSlots` is null, the component SHALL render nothing. When `remainingSlots === 0`, the progress bar fill SHALL be the destructive color.
- [ ] 5.7 Add the new components to the public surface in `src/lib/features/events/index.ts`: `EventCard`, `EventList`, `EventDetailHero`, `EventBookingCta`, `EventPriceBlock`, `EventQuotaMeter`.

## 6. Primitive installs: card, sheet, skeleton, aspect-ratio

- [ ] 6.1 Fill the empty `src/lib/components/ui/card/` folder by adding the shadcn-svelte card primitives (`Card.Root`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`, `Card.Footer`) as separate files following the project's existing `card.svelte` is not present pattern (i.e., one file per subcomponent, with an `index.ts` that re-exports them grouped under a `Card` object). Use `pnpm dlx shadcn-svelte@latest add card --yes --overwrite`.
- [ ] 6.2 Add the shadcn-svelte `sheet/` primitives (`Sheet.Root`, `Sheet.Trigger`, `Sheet.Close`, `Sheet.Content`, `Sheet.Header`, `Sheet.Title`, `Sheet.Description`) via `pnpm dlx shadcn-svelte@latest add sheet --yes --overwrite`.
- [ ] 6.3 Add the shadcn-svelte `skeleton/` primitive via `pnpm dlx shadcn-svelte@latest add skeleton --yes --overwrite`.
- [ ] 6.4 Add the shadcn-svelte `aspect-ratio/` primitive via `pnpm dlx shadcn-svelte@latest add aspect-ratio --yes --overwrite`.
- [ ] 6.5 Verify that all four sets of primitives export from the top-level `src/lib/components/ui/index.ts` barrel (the `shadcn-svelte add` CLI does this automatically; confirm with a `git diff`).
- [ ] 6.6 Run `pnpm check && pnpm lint` after the installs; resolve any pre-existing prettier complaints on the generated files with `pnpm format`.

## 7. Homepage: rewrite `src/routes/+page.svelte`

- [ ] 7.1 Open `src/routes/+page.svelte`. Remove the existing typed const arrays (`featuredEvent`, `announcements`, `posts`) and all the section markup (hero with PKU Remote copy, featured event row, announcements list, recent posts list, about strip).
- [ ] 7.2 Add a `<svelte:head>` block at the top of the page that emits: `<title>PKUBersua — [TAGLINE_PKUBERSUA_TBD]</title>`, `<meta name="description" content="...">` (a 50–160 char description of the community), `<link rel="canonical" href="{PUBLIC_SITE_URL}/">`, the four Open Graph tags (`og:title`, `og:description`, `og:type=website`, `og:url`, `og:image`, `og:site_name=PKUBersua`, `og:locale=id_ID`), and the four Twitter Card tags (`twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`).
- [ ] 7.3 Read `PUBLIC_SITE_URL` from `$env/static/public` (already imported elsewhere in the project) and use it as the base for the canonical and OG URLs.
- [ ] 7.4 Render the sticky site header with the wordmark "PKUBersua" and a nav that links to `#event-akan-datang`, `#event-sebelumnya`, and a future "Tentang" anchor. The `<details>` mobile nav SHALL be preserved.
- [ ] 7.5 Render the hero section: `<h1>[TAGLINE_PKUBERSUA_TBD]</h1>`, one descriptive sentence ("Kabar terbaru komunitas Pekanbaru dalam satu tempat."), and a single primary `Button` labeled "Lihat semua event" linking to `#event-akan-datang`. Keep the existing `animate-fade-up` class on the `<h1>` and the `prefers-reduced-motion: reduce` override in `layout.css`.
- [ ] 7.6 Render the "Event Akan Datang" section: `<section id="event-akan-datang" aria-labelledby="event-akan-datang-heading">`, an `<h2 id="event-akan-datang-heading">Event Akan Datang</h2>`, an `EventList` of `getUpcomingEvents()`, or an `EmptyState` (title "Belum ada event yang akan datang", description "Pantau terus untuk kabar terbaru komunitas.") when the list is empty. The section SHALL have a 1px hairline top border (shadcn `Separator`).
- [ ] 7.7 Render the "Event Sebelumnya" section only when `getPastEvents().length > 0`. `<section id="event-sebelumnya" aria-labelledby="event-sebelumnya-heading">`, `<h2 id="event-sebelumnya-heading">Event Sebelumnya</h2>`, an `EventList` of `getPastEvents().slice(0, 6)`, and a "Lihat semua" link to `/events` if more than 6 past events exist. The section SHALL have a 1px hairline top border (shadcn `Separator`).
- [ ] 7.8 Render the footer: wordmark "PKUBersua", a small nav list, three community links (Discord, Telegram, Email with `mailto:hello@pkubersua.com`), and a bottom row with `© 2026 PKUBersua` in `.label-meta`. The footer SHALL have a 1px hairline top border.
- [ ] 7.9 Import `PUBLIC_SITE_URL` from `$env/static/public` at the top of the script block. Import `getUpcomingEvents` and `getPastEvents` from `$lib/features/events`. Import `EventList`, `EmptyState`, `Button`, `Separator` from `$lib/components/ui`.

## 8. Event detail page: `/events/[slug]`

- [ ] 8.1 Create `src/routes/events/[slug]/+page.server.ts` exporting a `load` function that calls `getEventBySlug(params.slug)` and returns either `{ event }` or `error(404, 'Event tidak ditemukan')`. The `load` function SHALL run on the server (this is the default for `+page.server.ts`).
- [ ] 8.2 Create `src/routes/events/[slug]/+page.svelte` rendering the event detail page. Import `page` from `$app/state` and `Event` from the feature.
- [ ] 8.3 Render `<svelte:head>` with: `<title>{event.title} — PKUBersua</title>`, `<meta name="description" content={event.excerpt.slice(0, 160)}>`, `<link rel="canonical" href="{PUBLIC_SITE_URL}/events/{event.slug}">`, the OG and Twitter Card tags (per the site-seo spec), and a `<script type="application/ld+json">` block with the Schema.org `Event` object (per the events spec). All tags use `PUBLIC_SITE_URL` for absolute URLs.
- [ ] 8.4 Render the page body: `<EventDetailHero event={event}>` at the top, then a 2-column grid (`<div class="lg:grid lg:grid-cols-3 lg:gap-12">`) with the event body in the 2/3 column and the booking panel in the 1/3 column.
- [ ] 8.5 In the 2/3 column: render the event body as plain text (the dummy data is plain prose; if a future iteration supports markdown, swap to a markdown renderer). The body SHALL be wrapped in `.measure-prose` and capped at `70ch`.
- [ ] 8.6 In the 1/3 column (sticky on desktop via `lg:sticky lg:top-24`): render `<EventPriceBlock event={event} />`, `<EventQuotaMeter event={event} />`, and `<EventBookingCta event={event} mode="desktop" />` in that order.
- [ ] 8.7 Render the mobile floating booking CTA: `<EventBookingCta event={event} mode="mobile" />` fixed at the bottom-right of the viewport, only visible below the `lg` breakpoint (use Tailwind `lg:hidden`). The mobile CTA SHALL NOT render when the event is sold out.
- [ ] 8.8 Reuse the same sticky site header and footer as the homepage (extract into `$lib/components/site-header.svelte` and `$lib/components/site-footer.svelte` if duplication becomes a maintenance issue; for this change, duplication is acceptable).
- [ ] 8.9 Confirm the page returns a 404 status for an unknown slug: run the dev server, navigate to `/events/does-not-exist`, and confirm the response code is 404.

## 9. SEO/SSR infrastructure: sitemap, robots, JSON-LD

- [ ] 9.1 Create `src/routes/sitemap.xml/+server.ts` exporting a `GET` function. The function SHALL return `new Response(xml, { headers: { 'Content-Type': 'application/xml' } })` where `xml` is a string built from the events list and the homepage. Each `<url>` SHALL include `<loc>` (absolute URL from `PUBLIC_SITE_URL`), `<lastmod>` (event `startsAt` for event pages, current date for the homepage), and `<changefreq>monthly</changefreq>`.
- [ ] 9.2 Create `src/routes/robots.txt/+server.ts` exporting a `GET` function. The function SHALL return `new Response('User-agent: *\nAllow: /\nSitemap: {PUBLIC_SITE_URL}/sitemap.xml\n', { headers: { 'Content-Type': 'text/plain' } })`.
- [ ] 9.3 Verify both endpoints manually: `pnpm dev` and `curl -i http://localhost:5173/sitemap.xml` and `curl -i http://localhost:5173/robots.txt`; confirm the Content-Type and the body.
- [ ] 9.4 Confirm the JSON-LD on the event detail page: `curl -s http://localhost:5173/events/{slug} | grep -A 30 'application/ld+json'`; confirm the `Event` schema is present with the required fields.
- [ ] 9.5 Confirm the canonical and OG tags on the homepage and an event detail page: `curl -s http://localhost:5173/ | grep canonical`; `curl -s http://localhost:5173/ | grep 'og:'`; same checks for an event detail URL.
- [ ] 9.6 Confirm lazy loading: `curl -s http://localhost:5173/ | grep '<img'` and confirm every match has `loading="lazy"` and `decoding="async"`.

## 10. Env example

- [ ] 10.1 In `.env.example`, add the `CONTACT_EMAIL=hello@pkubersua.com` line under a new `# --- Site ---` section header. Keep the existing `PUBLIC_SITE_URL=http://localhost:5173` line and add a comment documenting the production value `https://pkubersua.com`.
- [ ] 10.2 If `.env` (gitignored) currently has the old `PUBLIC_SITE_URL` or any pkuremote references, update them to the new values. Do NOT commit `.env`.

## 11. Login + myprofile `<title>` and wordmark

- [ ] 11.1 In `src/routes/login/+page.svelte`, update the `<title>` to `Masuk — PKUBersua` and any visible "PKU Remote" wordmark to "PKUBersua" (if present).
- [ ] 11.2 In `src/routes/myprofile/+page.svelte`, update the `<title>` to `Profil saya — PKUBersua` and any visible "PKU Remote" wordmark to "PKUBersua" (if present).

## 12. Verification

- [ ] 12.1 Run `pnpm check` and confirm 0 errors and 0 warnings.
- [ ] 12.2 Run `pnpm lint` and confirm prettier and eslint pass. (The project's 1 pre-existing eslint error in `src/lib/server/auth/oauth-callback.test.ts` is acceptable — it is referenced as a known issue in the archived `add-datepicker` change.)
- [ ] 12.3 Run `pnpm test:unit -- --run` and confirm all unit tests pass. (The new feature has no unit tests in this change; the dummy data is type-checked at build time.)
- [ ] 12.4 Run `pnpm dev` and screenshot the homepage at 360px, 768px, and 1280px viewports. Inspect: hero placeholder reads as one line on desktop, the event listing reads as 1 column on mobile and 2–3 columns on desktop, the footer wordmark reads "PKUBersua", the hairline dividers between sections are present, no horizontal overflow at 360px.
- [ ] 12.5 Open an event detail page (`/events/{slug}` for a known slug) in a browser. Verify: banner image is visible, title and date render, price block reads correctly, the booking CTA is visible (sticky on desktop, floating on mobile), clicking the CTA opens the mail client with the pre-filled subject and body. Open `/events/does-not-exist` and verify the 404 page renders.
- [ ] 12.6 Run a desktop Lighthouse audit on `/` and on a representative `/events/{slug}` URL. Confirm: SEO ≥ 90, Performance ≥ 80. (Use Chrome DevTools' Lighthouse panel or `npx lighthouse http://localhost:5173/ --preset=desktop --output=json`.)
- [ ] 12.7 Run the project-wide brand grep one more time: `git grep -in 'PKU Remote\|pku-remote\|pkuremote\|pekanbaru.dev' -- 'src' 'db' 'PRODUCT.md' 'DESIGN.md' 'AGENTS.md' 'openspec' 'static'`. Confirm zero matches.
- [ ] 12.8 Read the rendered HTML of `/` and one `/events/{slug}` page and confirm: every `<img>` has `loading="lazy"` and `decoding="async"`, the canonical link is present, the JSON-LD `<script type="application/ld+json">` block is present on the event page.

## 13. OpenSpec archive

- [ ] 13.1 After all 12 sections are checked, run `openspec archive slice-events-rebrand-pkubersua --yes` to move the change into `openspec/changes/archive/YYYY-MM-DD-slice-events-rebrand-pkubersua/` and promote the three new delta specs (`events`, `site-seo`, `brand-pkubersua`) plus the modified `landing-page` spec to canonical `openspec/specs/`.
- [ ] 13.2 Verify the archive directory contains the four artifacts (`proposal.md`, `design.md`, `tasks.md`, `specs/`).
- [ ] 13.3 Verify `openspec list` no longer shows `slice-events-rebrand-pkubersua` as an active change.
- [ ] 13.4 The three pre-existing empty placeholder changes (`home-events-ssr-seo`, `integrate-landing-page-card`, `slice-homepage-stitch`) are NOT touched by this archive step. They remain as placeholders for a future cleanup change.

## 14. Operator follow-up (not in repo)

- [ ] 14.1 Replace the literal `[TAGLINE_PKUBERSUA_TBD]` in `src/routes/+page.svelte` with the real tagline once the brand team supplies copy. Documented as a future one-line edit; no spec change required.
- [ ] 14.2 Update the Discord and Telegram handles in the footer (`discord.gg/pkuremote` and `t.me/pkuremote`) once the new handles exist out of band. Not in this change's scope.
- [ ] 14.3 Confirm `pkubersua.com` DNS is pointed at the deployment host before the production rollout.
