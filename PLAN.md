# Plan — PKU Remote Landing Page

## 1. Design tokens & base styles (`src/routes/layout.css`)

**Tokens (OKLCH, Tailwind v4 `@theme`):**

- `--color-canvas`: `oklch(1.000 0.000 0)` — pure white
- `--color-surface`: `oklch(0.985 0.005 110)` — hair of warmth toward brand hue
- `--color-ink`: `oklch(0.220 0.010 110)` — body text, ≥7:1 on canvas
- `--color-muted`: `oklch(0.520 0.012 110)` — secondary text, ≥4.5:1
- `--color-hairline`: `oklch(0.900 0.005 110)` — 1px dividers
- `--color-primary`: `oklch(0.720 0.135 95)` — goldenrod ochre (≤10% surface, One Voice Rule)
- `--color-primary-hover`: `oklch(0.660 0.140 95)`
- `--font-display`: Spectral, Georgia, serif
- `--font-body`: Source Sans 3, system-ui, sans
- `--radius-card`: 12px (cap), `--radius-pill`: 9999px

**Base layer:** body bg/margins, headings use display font + `text-wrap: balance` + `letter-spacing: -0.02em`, `p` uses `text-wrap: pretty`, focus-visible ring in primary, selection tint, reduced-motion block.

**Component layer:** `.container-page` (max 72rem, fluid padding), `.measure-prose` (70ch), `.label-meta`, `.link-quiet` (hairline underline → ochre on hover), `.btn-primary` (ochre fill, white text, pill, hover darken, active 1px dip).

## 2. Fonts (`src/app.html`)

Preconnect to `fonts.googleapis.com` + `fonts.gstatic.com`. Stylesheet link: Spectral (400/500/600 + italic 400/500) + Source Sans 3 (400/500/600/700), `display=swap`.

## 3. Landing page (`src/routes/+page.svelte`)

Single file, seven semantic sections, real (dummy) content.

### 3.1 Header

`<header class="container-page">` — sticky top, canvas bg, hairline bottom border on scroll.

- Wordmark: `PKU Remote` (Spectral 500, 1.125rem, no caps).
- Nav: Events · Announcements · Posts (Source Sans 3, 0.9375rem). Hairline underline on hover, ochre on active. Mobile: collapse to a `<details>` disclosure (no hamburger library).

### 3.2 Hero

`<section class="container-page">` — generous vertical padding (`clamp(4rem, 10vw, 7rem)` top/bottom).

- H1: "A quiet bulletin for Pekanbaru's remote workers." (Spectral, `var(--text-display)`, `text-wrap: balance`, `animate-fade-up` 0.6s).
- Subcopy: one sentence, 1.125rem, muted ink, `measure-prose`. "Events, announcements, and writing from a community that works from home and meets in the city."
- Actions: `.btn-primary` "See next event" + `.link-quiet` "Read the blog →".

### 3.3 Next event

`<section class="container-page" id="events">` — one featured event, not a card grid.

- Layout: two-column on desktop (date column 8rem + content). Single column on mobile.
- Date: `Thu 11 Jul` — Source Sans 3 600, primary color, 1.5rem, tabular-nums. This is the one place the accent concentrates.
- Title: "Coffee & Code — July Meetup" (Spectral 500, `var(--text-headline)`).
- Meta row: "Kopi Senja, Jalan Gajah · 18:30–21:00" (`.label-meta`).
- Excerpt: two sentences, body.
- RSVP: `.link-quiet` "Reserve a seat →".
- Visual separator: 1px hairline above the section, no card border, no shadow.

### 3.4 Announcements

`<section class="container-page" id="announcements">` — editorial list, 2–3 items, not cards.

- Section heading: "Announcements" (Spectral 500, `var(--text-headline)`).
- List: each item is a row with date column (8rem, `.label-meta`, tabular-nums) + headline (Source Sans 3 600, 1.0625rem) + one-line excerpt (muted). Hairline between items.
- Three dummy entries dated Jul 02 / Jun 24 / Jun 18.

### 3.5 Recent posts

`<section class="container-page" id="posts">` — Substack-list cadence, 3 entries.

- Section heading: "Recent writing".
- Each post: serif title (Spectral 500, 1.375rem, link-quiet on hover), byline row (`.label-meta`: author · date · reading time), excerpt (2 lines, body, `measure-prose`), "Read →" link (`.link-quiet`, ochre on hover).
- Separator: 1px hairline + generous vertical rhythm between posts.
- Three dummy posts by three different authors.

### 3.6 About strip

`<section class="container-page">` — quiet single paragraph.

- "About the club" (Spectral 500, `var(--text-headline)`).
- One paragraph (5–6 lines, `measure-prose`): what the community is, how often it meets, how to join.
- One link: "Read the full about →" (`.link-quiet`).

### 3.7 Footer

`<footer class="container-page">` — hairline top border, generous top padding.

- Wordmark + small nav repeat (Events · Announcements · Posts · About).
- One line of community links: Discord · Telegram · Email (plain links, hairline underline).
- Bottom row: `© 2026 PKU Remote` (`.label-meta`). No big CTA banner.

## 4. State coverage

- Hover/focus-visible on every interactive element (links, button, nav).
- Active state on nav item matching current section (ochre).
- Header hairline appears on scroll (CSS `scroll-driven` not used; simple scroll listener or CSS-only sticky-with-border via `position: sticky` + always-on hairline — preferred, no JS).
- Empty-state copy for future: if no events, "No events scheduled yet — check back soon." (not built now, but the data shape should support it).

## 5. Motion

- One `animate-fade-up` 0.6s `ease-out-expo` on hero H1 only. No scroll choreography, no stagger.
- All hover transitions: 0.18s ease.
- `@media (prefers-reduced-motion: reduce)`: animation disabled, transitions instant.

## 6. Responsive

- Breakpoints via `clamp()` and `auto-fit` only where grids exist. Most of this page is 1D flex/block, not grid.
- Mobile-first: single column, date column collapses inline above content.
- Container padding: `clamp(1.25rem, 4vw, 3rem)`.
- Test at 360px / 768px / 1280px after build.

## 7. Accessibility checklist

- Semantic landmarks: `<header>`, `<main>`, `<section>` with `aria-labelledby` for each heading, `<footer>`.
- One H1 only.
- All links have accessible names; no "click here".
- Focus-visible ring in primary on every interactive element.
- Date columns use `font-variant-numeric: tabular-nums` for alignment.
- Color contrast verified: ink ≥7:1, muted ≥4.5:1, primary-on-white for large text only (date is 1.5rem bold ≥3:1; primary button uses white text per Helmholtz-Kohlrausch).
- No color-only signals.

## 8. Verification plan after build

1. `pnpm check` — typecheck.
2. `pnpm lint` — prettier + eslint.
3. `pnpm dev` — start server, screenshot at 360 / 768 / 1280.
4. Inspect: hero spacing, event date alignment, list rhythm, footer balance, focus rings, overflow on small viewports.
5. Check `prefers-reduced-motion` in DevTools.
6. Run the impeccable detector on the new files.
7. Patch defects, re-screenshot, ship.

## 9. Files touched

- `src/routes/layout.css` — rewrite with tokens + base + components.
- `src/app.html` — add font links.
- `src/routes/+page.svelte` — full landing page.
- `src/routes/+layout.svelte` — unchanged (already imports layout.css).
- `PRODUCT.md` / `DESIGN.md` — already written, no changes.