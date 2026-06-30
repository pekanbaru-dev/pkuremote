# site-seo Specification (delta)

## Purpose

Defines the site-wide SEO/SSR infrastructure that makes the public pages of PKUBersua discoverable on Google, ChatGPT, Gemini, Perplexity, and other search and answer engines — per-page meta tags, Open Graph and Twitter Card tags, JSON-LD `Event` structured data (covered in the `events` spec), dynamic `sitemap.xml`, dynamic `robots.txt`, lazy-loaded images, and Lighthouse SEO ≥ 90 / Performance ≥ 80 verification.

## ADDED Requirements

### Requirement: Every public page has a unique title, description, and canonical URL

Every public page (the homepage `/`, the event detail page `/events/[slug]`, and any future public page) SHALL render, inside its `<svelte:head>`, a unique `<title>`, a `meta name="description"` (max 160 chars), and a `link rel="canonical"` whose `href` is the absolute URL of the page built from `PUBLIC_SITE_URL`. The homepage title SHALL be `"PKUBersua — {tagline placeholder}"`. The event detail title SHALL be `"{event title} — PKUBersua"`. No two public pages SHALL share a `<title>` or a `meta description`.

#### Scenario: A search engine crawler parses the homepage

- **WHEN** the crawler fetches `/` and inspects the HTML head
- **THEN** it finds a `<title>` beginning with "PKUBersua", a `meta name="description"` between 50 and 160 characters, and a `<link rel="canonical">` whose `href` starts with the `PUBLIC_SITE_URL` value and ends with `/`.

#### Scenario: A search engine crawler parses an event detail page

- **WHEN** the crawler fetches `/events/{slug}` and inspects the HTML head
- **THEN** it finds a `<title>` of the form `"{event title} — PKUBersua"`, a `meta name="description"` derived from the event excerpt, and a `<link rel="canonical">` whose `href` is the absolute URL of the event.

#### Scenario: Two pages are checked for uniqueness

- **WHEN** a reviewer runs `pnpm exec ... <grep>` across the rendered HTML of `/` and `/events/{slug}`
- **THEN** the `<title>` and the `meta name="description"` differ between the two pages.

### Requirement: Every public page emits Open Graph and Twitter Card tags

Every public page SHALL emit, in `<svelte:head>`, the Open Graph tags `og:title`, `og:description`, `og:type` (`website` for `/`, `article` for `/events/[slug]`), `og:url` (absolute URL from `PUBLIC_SITE_URL`), `og:image` (the page's hero image or the default OG image), `og:site_name = "PKUBersua"`, and `og:locale = "id_ID"`. Every public page SHALL also emit the Twitter Card tags `twitter:card = "summary_large_image"`, `twitter:title`, `twitter:description`, and `twitter:image` (mirroring `og:image`).

#### Scenario: A social-media link preview is generated for the homepage

- **WHEN** a visitor pastes `https://pkubersua.com/` into a chat app that supports Open Graph
- **THEN** the preview shows the homepage title, the homepage description, the homepage image, and the site name "PKUBersua".

#### Scenario: A social-media link preview is generated for an event detail page

- **WHEN** a visitor pastes `https://pkubersua.com/events/{slug}` into a chat app
- **THEN** the preview shows the event title, the event excerpt, the event banner image, and the site name "PKUBersua".

### Requirement: The site serves a dynamic `sitemap.xml` listing all public pages

The project SHALL expose a `GET /sitemap.xml` endpoint implemented at `src/routes/sitemap.xml/+server.ts`. The endpoint SHALL return `Content-Type: application/xml`, with a `<urlset>` containing one `<url>` per public page: the homepage `/`, and one `<url>` per event detail page (`/events/{slug}`) returned by `getUpcomingEvents` and `getPastEvents`. Each `<url>` SHALL include `<loc>` (absolute URL), `<lastmod>` (the event's `startsAt` for event pages, the current date for the homepage), and `<changefreq>monthly</changefreq>`.

#### Scenario: A search engine fetches the sitemap

- **WHEN** a crawler requests `https://pkubersua.com/sitemap.xml`
- **THEN** the response is `200 OK` with `Content-Type: application/xml` and a body listing the homepage and every event detail page with absolute URLs and `lastmod` values.

#### Scenario: A new event is added to the dummy data

- **WHEN** a developer adds a new event to `features/events/services/dummy-events.ts`
- **THEN** the next request to `/sitemap.xml` includes a new `<url>` entry for the new event without any rebuild step (the sitemap is generated at request time).

### Requirement: The site serves a `robots.txt` that points at the sitemap

The project SHALL expose a `GET /robots.txt` endpoint implemented at `src/routes/robots.txt/+server.ts`. The endpoint SHALL return `Content-Type: text/plain`, with a body of at least two lines: `User-agent: *` followed by `Allow: /` (or a more specific allow list), and `Sitemap: {PUBLIC_SITE_URL}/sitemap.xml`.

#### Scenario: A crawler fetches robots.txt

- **WHEN** a crawler requests `https://pkubersua.com/robots.txt`
- **THEN** the response is `200 OK` with `Content-Type: text/plain` and a body that names the user-agent policy and points at the sitemap URL.

### Requirement: All public content is server-rendered (SSR) — no JS-only rendering

The homepage and the event detail page SHALL be fully server-rendered: the HTML response from the server SHALL include the page text, the event titles, dates, locations, prices, the meta tags, the JSON-LD, and the canonical link — without requiring JavaScript execution. The only client-side enhancement permitted is progressive (lazy images, focus management, the mobile FAB repositioning); no content SHALL be hidden behind a class-triggered reveal that never fires on hidden tabs or on a JS-disabled client.

#### Scenario: A visitor disables JavaScript and opens the homepage

- **WHEN** a visitor visits `/` with JavaScript disabled
- **THEN** the page renders the hero, the "Event Akan Datang" section, and the "Event Sebelumnya" section with all event titles, dates, and locations visible in the initial HTML response.

#### Scenario: A view-source check on an event detail page

- **WHEN** a reviewer views the page source of `/events/{slug}` with JavaScript disabled
- **THEN** the source contains the event title, the date, the location, the price, the meta tags, the JSON-LD block, and the canonical link in the static HTML, with no `<script>`-gated content.

### Requirement: Images use lazy loading and modern formats

Every `<img>` element on public pages (event banners, OG preview images) SHALL include `loading="lazy"` and `decoding="async"`. The image source SHALL prefer a modern format (WebP or AVIF) when the asset supports it. The image SHALL have an explicit `width` and `height` attribute (or an `aspect-ratio` wrapper) to prevent layout shift.

#### Scenario: A visitor scrolls the homepage

- **WHEN** the visitor scrolls past the first viewport
- **THEN** off-screen event banner images begin loading only when they approach the viewport, not on initial page load.

#### Scenario: A reviewer checks the rendered HTML for image attributes

- **WHEN** a reviewer greps the homepage HTML for `<img`
- **THEN** every match includes `loading="lazy"` and `decoding="async"`.

### Requirement: Lighthouse audits meet the documented budgets

The homepage and a representative event detail page SHALL pass a manual Lighthouse audit (run via `npx lighthouse` or Chrome DevTools) with a SEO score of at least 90 and a Performance score of at least 80. The verification step is documented in `tasks.md` and is part of the change's Definition of Done.

#### Scenario: A reviewer runs Lighthouse on the homepage

- **WHEN** a reviewer runs Lighthouse against `/` on a desktop profile
- **THEN** the SEO score is ≥ 90 and the Performance score is ≥ 80.

#### Scenario: A reviewer runs Lighthouse on an event detail page

- **WHEN** a reviewer runs Lighthouse against `/events/{slug}` on a desktop profile
- **THEN** the SEO score is ≥ 90 and the Performance score is ≥ 80.

### Requirement: The base URL is read from `PUBLIC_SITE_URL` everywhere

The `PUBLIC_SITE_URL` environment variable (already used for `sitemap.xml` and canonical links) SHALL be the single source of truth for the site's absolute URL. The homepage, the event detail page, the sitemap endpoint, the robots endpoint, and the JSON-LD `organizer.url` SHALL all read from this variable. The variable's value in production is `https://pkubersua.com`; the value in local dev is `http://localhost:5173`. The `.env.example` file SHALL document both values.

#### Scenario: A developer changes `PUBLIC_SITE_URL` to a staging host

- **WHEN** a developer sets `PUBLIC_SITE_URL=https://staging.pkubersua.com` and rebuilds
- **THEN** the canonical URLs, the sitemap entries, the robots.txt `Sitemap:` line, and the JSON-LD `organizer.url` all point at the staging host.

#### Scenario: A reviewer checks the rendered canonical link

- **WHEN** a reviewer fetches `/` with `PUBLIC_SITE_URL=http://localhost:5173`
- **THEN** the `<link rel="canonical">` `href` is `http://localhost:5173/`.
