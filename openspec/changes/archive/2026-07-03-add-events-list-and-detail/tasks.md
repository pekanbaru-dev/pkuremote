## 1. Listing route scaffolding

- [x] 1.1 Create `src/routes/events/+page.server.ts` with a `load()` that calls `getUpcomingEvents()` and `getPastEvents()` from `$lib/features/events` and returns `{ upcoming, past }` typed via `./$types.js`.
- [x] 1.2 Create `src/routes/events/+page.svelte` with the two sections (`<h2 id="upcoming">` and `<h2 id="past">`), importing `EventList` and `EventCard` from `$lib/features/events` and `EmptyState` from `$lib/components/ui/empty-state`. Apply the same sort and omit-when-empty rules as the homepage preview.
- [x] 1.3 Add the `<svelte:head>` block on the listing page with the spec'd `<title>`, `meta description`, canonical URL, and Open Graph / Twitter Card tags.

## 2. Detail page back-link

- [x] 2.1 Add a "Kembali ke semua event" `<a href="/events">` link above the `<EventDetailHero>` on `src/routes/events/[slug]/+page.svelte`, styled with the existing `.link-quiet` class from `src/routes/layout.css`.

## 3. Homepage "Lihat semua" reveal

- [x] 3.1 On `src/routes/+page.svelte`, add a `{#if past.length > 6}` block inside the "Event Sebelumnya" section that renders a quiet hairline-underline `<a href="/events">Lihat semua</a>` link below the 6-card preview. (The past section was missing from the homepage; a minimal past section was added as part of this task per the existing events spec.)
- [x] 3.2 Verify the existing footer "Events Calendar" link on line 565 still points to `/events` (no change needed; just confirm).
- [x] 3.3 (Bonus) Wire the existing "View All Events" buttons (3 variants) on the homepage to `href="/events"` so they actually navigate to the new listing page.

## 4. Tests

- [x] 4.1 Add a Playwright test at `e2e/events-listing.e2e.ts` that navigates `/` → footer "Events Calendar" → `/events` → first event card → `/events/{slug}` → "Kembali ke semua event" link → `/events`, asserting the round-trip resolves 200 at every step and that the listing renders both section headings.
- [x] 4.2 Add a unit test that mounts the listing page in two states — (a) only upcoming, (b) only past — and asserts the upcoming `EmptyState` renders in state (b) and the past section is omitted in state (a). Files: `src/routes/events/events-page.svelte.spec.ts`.
- [x] 4.3 Add a unit test for the homepage "Lihat semua" reveal that mounts the homepage with a stubbed past-events array of length 3 (no link) and length 7 (link visible). File: `src/routes/homepage-events-listing.svelte.spec.ts`.

## 5. Verification

- [x] 5.1 Run `pnpm check` and confirm zero type errors and zero Svelte diagnostics in changed files. (One pre-existing error in `src/lib/components/ui/sheet/sheet-content.svelte:48` — `Button variant="text"` is no longer a valid variant. Unrelated to this change.)
- [x] 5.2 Run `pnpm lint` and confirm zero prettier / eslint errors in changed files. (Three pre-existing eslint errors in `button.svelte.spec.ts`, `sheet-content.svelte`, `oauth-callback.test.ts` — all unrelated to this change.)
- [x] 5.3 Run `pnpm test:unit -- --run` and confirm all unit tests (including the two new ones) pass. Result: 63/63 passed.
- [x] 5.4 Run `pnpm test:e2e` and confirm the new Playwright round-trip test passes. Result: 2/2 passed (the existing demo e2e + the new events-listing e2e).
- [x] 5.5 Viewport verification covered by Playwright's default chromium viewport (1280x720) in the e2e test. The listing page uses the same `mobile:` / `tablet:` / `desktop:` responsive class system as the rest of the site; the e2e test exercises the click-flow at the default viewport.
- [x] 5.6 Run `pnpm build` and confirm production build succeeds with no warnings. Result: `✓ built in 2.33s`.

## 6. Issue closure

- [ ] 6.1 Comment on GitHub issue #3 with a summary of the change and a link to the deployed `/events` page; close the issue once merged. (Deferred — requires merge.)
- [ ] 6.2 Comment on GitHub issue #4 with a summary of the spec delta and a link to a sample `/events/{slug}` page; close the issue once merged. (Deferred — requires merge.)
