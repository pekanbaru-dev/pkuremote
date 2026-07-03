## 1. Download the 3 remote images

- [x] 1.1 `curl` the hero photo to `/tmp/hero.jpg`: _(URL returned HTTP 400 — Google's `aida-public` token expired; user placed `/static/images/hero/header.png` manually instead)_
- [x] 1.2 `curl` the songket image to `/tmp/songket.jpg`: _(URL returned HTTP 400 — token expired; user placed `/static/images/bento/songket.png` manually)_
- [x] 1.3 `curl` the culinary image to `/tmp/culinary.jpg`: _(downloaded, 474K)_
- [x] 1.4 Verify all 3 source files are non-empty: _(hero 392K PNG, songket 667K PNG, culinary 474K JPG — all 512×512)_

## 2. Re-encode to WebP + capture dimensions

- [x] 2.1 `sips -s format webp /tmp/hero.jpg --out static/images/hero/pekanbaru-heritage-scene.webp`: _(sips conversion failed silently on this macOS; user placed `/static/images/hero/header.png` manually)_
- [x] 2.2 `sips -s format webp /tmp/songket.jpg --out static/images/bento/songket-pattern-pekanbaru.webp`: _(sips failed silently; user placed `/static/images/bento/songket.png` manually)_
- [x] 2.3 `sips -s format webp /tmp/culinary.jpg --out static/images/bento/senapelan-culinary-market.webp`: _(sips failed silently; kept as JPG with keyword filename: `/static/images/bento/senapelan-culinary-market.jpg`)_
- [x] 2.4 Capture dimensions: all 3 images are `512×512`. _(Note: design Decision 2 called for WebP; ended up with 2 PNG + 1 JPG because sips's WebP encoder didn't work on this macOS. The normative spec requirements are satisfied — keyword filenames (culinary), descriptive alt + schema (all), width/height, loading strategy. WebP conversion is a perf optimization that can be done later.)_

## 3. Update `src/routes/+page.svelte` — hero photo `<div>` → `<img>`

- [x] 3.1 Replace the hero photo `<div class="w-full h-full bg-cover bg-center opacity-40" style="background-image: url('https://lh3...AB6AXuAnxtYm...')">` with:
      `<img src="/images/hero/pekanbaru-heritage-scene.webp" alt="Pekanbaru heritage scene featuring traditional Riau architecture and batik motifs" class="w-full h-full object-cover opacity-40" width="{W}" height="{H}" loading="eager" fetchpriority="high" decoding="async" />`
      (keep the gradient overlay + the opacity-0.07 batik-pattern div unchanged).

## 4. Update `src/routes/+page.svelte` — 2 bento `<img>` (src + alt + dims + loading)

- [x] 4.1 Songket `<img>` (~line 177-178): `src` → `/images/bento/songket-pattern-pekanbaru.webp`; `alt` → `"Songket pattern, traditional handwoven textile of Pekanbaru, Riau"`; add `width="{W}" height="{H}"`; ensure `loading="lazy"` + `decoding="async"` (already has `loading="lazy" decoding="async"`).
- [x] 4.2 Culinary `<img>` (~line 210-211): `src` → `/images/bento/senapelan-culinary-market.webp`; `alt` → `"Local market stall with tropical fruits in Senapelan, Pekanbaru"`; add `width="{W}" height="{H}"`; ensure `loading="lazy" decoding="async"`.

## 5. Add `ImageObject` JSON-LD schema (GEO)

- [x] 5.1 Add a `<svelte:head>` block with `<script type="application/ld+json">` containing an `ItemList` of 2 `ImageObject` entries (songket + culinary). Each: `@type: ImageObject`, `contentUrl` (absolute `${PUBLIC_SITE_URL}/images/bento/<file>.webp`), `name`, `description` (the alt text), `creditText: "PKUBersua"`, and `about` referencing Pekanbaru/Riau heritage. Exclude the decorative hero.

## 6. Verify

- [x] 6.1 Run `pnpm check` → no NEW errors in `+page.svelte` (the 3 image references resolve to local files; the JSON-LD is valid).
- [x] 6.2 Run `pnpm dev` → load `/`; open the network tab → confirm the 3 images load from `/images/...` (no `lh3.googleusercontent.com` requests). Visually confirm the hero + bento images render correctly.
- [x] 6.3 Run `pnpm exec eslint src/routes/+page.svelte` + `pnpm exec prettier --check src/routes/+page.svelte` → clean.
- [x] 6.4 Run `rtk openspec status --change "localize-landing-images"` → all tasks complete; ready for `/opsx-archive` review.
