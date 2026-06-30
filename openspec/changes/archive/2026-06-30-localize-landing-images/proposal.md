## Why

The landing page (`src/routes/+page.svelte`) renders 3 images from remote `lh3.googleusercontent.com` URLs (the hero background photo, the bento "Songket pattern" feature, and the "Senapelan culinary gems" market photo). Remote images are (1) slow — they add a cross-origin dependency and a round-trip Google's CDN on every visit, delaying LCP; (2) not reliably crawlable or indexable by search engines or generative engines (Google indexes `lh3.googleusercontent.com/aida-public/` images poorly, and they carry no semantic filename or local context); and (3) out of the project's control — if Google prunes the `aida-public` path, the landing page loses its imagery. Localizing them as static assets under `/static/images/` with SEO- and GEO-oriented filenames, alt text, dimensions, modern format, and `ImageObject` schema makes them fast, crawlable, and identifiable as Pekanbaru/Riau local-heritage content.

## What Changes

- Download the 3 remote images to `/static/images/{hero,bento}/` (subfolders already exist) with SEO/GEO keyword-rich filenames:
  - hero background → `/static/images/hero/pekanbaru-heritage-scene.webp`
  - bento songket feature → `/static/images/bento/songket-pattern-pekanbaru.webp`
  - bento culinary market → `/static/images/bento/senapelan-culinary-market.webp`
- Re-encode each as **WebP** (smaller, modern; evergreen-browser target — no fallback needed) and record native `width`/`height` (CLS prevention).
- Update `+page.svelte`:
  - hero background photo (currently a CSS `background-image` on a `<div>`) → converted to a local `<img>` with descriptive alt (so it is crawlable/indexable for SEO, not invisible as CSS bg), `loading="eager"` + `fetchpriority="high"` (LCP), `decoding="async"`, absolute local `src`. The purely-decorative batik-pattern overlay (opacity 0.07) stays as CSS.
  - the 2 content `<img>` (songket, culinary) → local `src`, enriched alt text with local entity keywords (Pekanbaru, Riau, Senapelan, songket), `width`/`height`, `loading="lazy"` (below-fold), `decoding="async"`.
- Add `ImageObject` JSON-LD schema for the 2 content images (GEO — helps generative engines identify the images as Pekanbaru/Riau local-heritage subject matter). The decorative hero image is `role="presentation"` (not schema'd as content).
- (Related, out-of-scope but flagged) The `og-default.png` OG meta image is referenced as `${PUBLIC_SITE_URL}/og-default.png` but is not at `/static/og-default.png`; a separate change should land a real OG image. This change does not touch the OG meta.

## Capabilities

### New Capabilities

<!-- None. Image handling is a landing-page concern. -->

(none)

### Modified Capabilities

- `landing-page`: add a requirement that the landing page's images SHALL be local static assets under `/static/images/` (no remote URLs), encoded as WebP with keyword-rich filenames, descriptive alt text carrying local entity keywords (Pekanbaru/Riau/Senapelan/songket/batik), explicit `width`/`height`, a lazy/eager loading strategy tied to above/below the fold, and `ImageObject` JSON-LD schema for content images (GEO). The existing behavioral requirements (sections, tokens, header, hero, lists, footer) are unchanged.

## Impact

- `static/images/hero/pekanbaru-heritage-scene.webp` — new (downloaded + re-encoded).
- `static/images/bento/songket-pattern-pekanbaru.webp` — new.
- `static/images/bento/senapelan-culinary-market.webp` — new.
- `src/routes/+page.svelte` — 3 image references rewritten (hero CSS-bg `<div>` → local `<img>`; 2 `<img>` `src` + alt + dimensions); `ImageObject` JSON-LD added (a `<svelte:head>` `<script type="application/ld+json">`).
- No new dependencies (download via `curl`; re-encode via macOS `sips` or a `sharp` one-off script — no runtime dep added to the app).
- No spec behavior changes beyond the new image-asset requirement.
- Depends on the active `rebuild-landing-with-primitives` change (which established the current `+page.svelte` the images live in); apply this change after that one is stable.
