## 1. Design tokens & base styles

- [x] 1.1 Rewrite `src/routes/layout.css` with the OKLCH color tokens (canvas, surface, ink, muted, hairline, primary, primary-hover) in Tailwind v4 `@theme`
- [x] 1.2 Add the font tokens (display = Spectral, body = Source Sans 3), radius tokens (card = 12px, pill = 9999px), and fluid text-size tokens (display, headline, title, body, label) to `@theme`
- [x] 1.3 Add base layer: body bg/margins, heading font + `text-wrap: balance` + `letter-spacing: -0.02em`, `p` `text-wrap: pretty`, focus-visible ring in primary, selection tint
- [x] 1.4 Add component layer: `.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet`, `.btn-primary` in `@layer components`
- [x] 1.5 Add the hero `animate-fade-up` keyframe in `@layer utilities` and the `prefers-reduced-motion: reduce` block disabling animations and transitions

## 2. Fonts

- [x] 2.1 Add `<link rel="preconnect">` for `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (with `crossorigin`) to `src/app.html`
- [x] 2.2 Add the Google Fonts stylesheet `<link>` for Spectral (400, 500, 600 + italic 400, 500) and Source Sans 3 (400, 500, 600, 700) with `display=swap` to `src/app.html`

## 3. Landing page — content data

- [x] 3.1 In `src/routes/+page.svelte` `<script lang="ts">`, define a typed `const featuredEvent` object (date, title, location, time, excerpt, rsvpHref) with realistic dummy Pekanbaru content
- [x] 3.2 Define a typed `const announcements` array (2–5 entries, each with date, headline, excerpt) with realistic dummy content
- [x] 3.3 Define a typed `const posts` array (exactly 3 entries, each with title, author, date, readingTime, excerpt, href) with realistic dummy content

## 4. Landing page — sections

- [x] 4.1 Build the sticky `<header>` with wordmark and nav (Events, Announcements, Posts), hairline bottom border, `<details>` disclosure below 640px
- [x] 4.2 Build the `<section>` hero with one `<h1>`, muted subcopy capped at 70ch, `.btn-primary` to `#events`, `.link-quiet` to `#posts`, `animate-fade-up` on the h1
- [x] 4.3 Build the `#events` section: two-column layout (8rem date column + content), date in primary tabular-nums, Spectral headline, `.label-meta` meta row, excerpt, RSVP `.link-quiet`, 1px hairline top border, no card/shadow
- [x] 4.4 Build the `#announcements` section: section heading, `{#each}` list with date column + headline + one-line excerpt, 1px hairline separators
- [x] 4.5 Build the `#posts` section: section heading, `{#each}` over 3 posts with serif title (`.link-quiet` on hover), `.label-meta` byline row, excerpt capped at 70ch, "Read →" link, hairline + vertical rhythm between entries
- [x] 4.6 Build the about strip: section heading, one paragraph capped at 70ch, one `.link-quiet` to a future About page, no imagery
- [x] 4.7 Build the `<footer>` with hairline top border: wordmark, repeated nav + About link, community links (Discord, Telegram, Email) as hairline-underline links, `© 2026 PKU Remote` in `.label-meta`

## 5. Responsive & accessibility pass

- [x] 5.1 Verify date columns collapse inline above content below 640px (no breakpoint class toggles beyond the header disclosure)
- [x] 5.2 Add `aria-labelledby` to each `<section>` pointing at its heading id
- [x] 5.3 Verify one `<h1>` only; all section headings are `<h2>`
- [x] 5.4 Verify every interactive element has a visible focus ring in primary and an accessible name (no "click here")
- [x] 5.5 Confirm no horizontal overflow at 360px and content centers with max-width 72rem at 1280px

## 6. Verification

- [x] 6.1 Run `pnpm check` (svelte-check + tsc) and fix any type errors
- [x] 6.2 Run `pnpm lint` (prettier + eslint) and `pnpm format` if needed
- [x] 6.3 Run `pnpm dev` and screenshot the page at 360px, 768px, and 1280px
- [x] 6.4 Inspect screenshots: hero spacing, event date alignment, list rhythm, footer balance, focus rings, overflow
- [x] 6.5 Toggle `prefers-reduced-motion: reduce` in DevTools and verify the hero animation is disabled and transitions are instant
- [x] 6.6 Run the impeccable detector on `src/routes/+page.svelte` and `src/routes/layout.css`; patch any material defects
- [x] 6.7 Re-screenshot after fixes and confirm the page meets the brief before marking the change complete
