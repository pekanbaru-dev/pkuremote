## Context

The landing page (`src/routes/+page.svelte`) renders 3 images from remote `lh3.googleusercontent.com/aida-public/` URLs. The static folder already follows a `/static/images/<section>/` convention — subfolders `hero/`, `bento/`, `events/`, `partners/` exist under `/static/images/` (the `hero/` and `bento/` folders are prepared but the 3 landing images are not yet local). The 4 partner logos are already local SVGs at `/partners/*.svg`. The page's hero composes the remote photo as a CSS `background-image` on an opacity-40 `<div>` behind a cream-to-transparent gradient; the 2 bento images are `<img>` elements with short alt text.

| #   | current             | current alt                               | location in `+page.svelte`              |
| --- | ------------------- | ----------------------------------------- | --------------------------------------- |
| 1   | remote URL (Google) | none (CSS `background-image`)             | hero photo layer (~line 102)            |
| 2   | remote URL (Google) | "Songket pattern background"              | bento large feature `<img>` (~line 178) |
| 3   | remote URL (Google) | "Local market stall with tropical fruits" | bento small story `<img>` (~line 211)   |

## Goals / Non-Goals

**Goals:**

- Move all 3 remote images to local static assets under `/static/images/{hero,bento}/`.
- Re-encode as WebP with native `width`/`height`.
- Apply SEO + GEO: keyword-rich filenames, descriptive alt text carrying local entity keywords (Pekanbaru, Riau, Senapelan, songket, batik), `ImageObject` JSON-LD schema for content images.
- Convert the hero photo from CSS `background-image` to a crawlable `<img>` (CSS bg images are not indexed).
- Correct loading strategy: hero (LCP) eager + `fetchpriority="high"`; below-fold lazy.

**Non-Goals:**

- Touching the 4 partner logos (already local SVG, already have alt).
- Touching the `og-default.png` OG meta image (referenced but not visible in the page body; flagged as a separate concern).
- Responsive `srcset`/multiple sizes (single WebP per image; `srcset` is a possible follow-up if Lighthouse flags it).
- Re-encoding the decorative batik-pattern overlay (opacity 0.07 CSS bg) — purely decorative, stays as-is.
- Changing the page's visual design — the images keep their position/opacity/crop; only the source + markup semantics change.

## Decisions

### Decision 1: Local static under `/static/images/<section>/` (follow existing convention)

**Choice:** `hero/` → `/static/images/hero/`, bento images → `/static/images/bento/`. Served at `/images/hero/...` and `/images/bento/...`.

**Rationale:** the subfolders already exist; matches the partner-logo pattern (`/partners/`). Keeps landing imagery grouped by section.

### Decision 2: WebP, no fallback

**Choice:** Re-encode each as `.webp`. No `<picture>`/JPEG fallback.

**Rationale:** SvelteKit targets evergreen browsers (all support WebP since 2020). WebP is ~25-35% smaller than JPEG at equivalent quality. A fallback adds markup + a second asset for ~0% of traffic.

### Decision 3: Hero CSS-bg → `<img>` (SEO crawlability)

**Choice:** Replace the hero photo `<div style="background-image:url(...)">` with an `<img>` carrying a descriptive `alt`, `loading="eager"`, `fetchpriority="high"`, `decoding="async"`, absolute local `src`. Keep the opacity-40 + object-cover via classes. The gradient overlay + the decorative batik-pattern div stay.

**Rationale:** CSS `background-image` is not crawled/indexed by search engines or generative engines. The hero photo is a real Pekanbaru scene — converting to `<img>` with descriptive alt makes it indexable (SEO) and identifiable as local-heritage subject matter (GEO). `loading="eager"` + `fetchpriority="high"` because it's the LCP candidate.

**Alternatives considered:**

- _Keep hero as CSS bg, just localize the URL_ — rejected: the user asked for an SEO approach; a CSS bg image is invisible to crawlers, defeating the SEO goal for the page's largest image.
- _Empty `alt=""` (decorative)_ — rejected for SEO (descriptive alt carries keywords); the image is a real scene, not pure ornament. The opacity-40 atmospheric treatment is a visual concern, not an a11y-decorative signal.

### Decision 4: Filename + alt keyword strategy (SEO + GEO)

**Choice:** lowercase, hyphenated, keyword-rich filenames; alt text that names the subject + local entities.

| #   | local path                                     | alt text                                                                            |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | `/images/hero/pekanbaru-heritage-scene.webp`   | "Pekanbaru heritage scene featuring traditional Riau architecture and batik motifs" |
| 2   | `/images/bento/songket-pattern-pekanbaru.webp` | "Songket pattern, traditional handwoven textile of Pekanbaru, Riau"                 |
| 3   | `/images/bento/senapelan-culinary-market.webp` | "Local market stall with tropical fruits in Senapelan, Pekanbaru"                   |

**Rationale:** Filenames + alt are the two strongest on-image SEO signals. Local entity keywords (Pekanbaru, Riau, Senapelan, songket) signal geographic + cultural relevance to both classic search and generative engines (GEO). Alt stays factual (no keyword stuffing).

### Decision 5: `width`/`height` + loading strategy (CLS + LCP)

**Choice:** Every `<img>` carries native `width`/`height` (the pixel dimensions of the WebP, determined after re-encode). Loading: hero → `loading="eager" fetchpriority="high"` (LCP); 2 bento images → `loading="lazy" decoding="async"` (below-fold). All carry `decoding="async"`.

**Rationale:** `width`/`height` prevents layout shift (CLS) by reserving the aspect-ratio box before the image loads. Eager + high-priority on the hero LCP candidate; lazy on below-fold avoids wasting bandwidth on first paint.

### Decision 6: `ImageObject` JSON-LD schema (GEO)

**Choice:** Add a `<svelte:head>` `<script type="application/ld+json">` with an `ItemList` of 2 `ImageObject` entries (the songket + culinary content images), each with `contentUrl`, `name`, `description`, `creator`/`creditText` (PKUBersua), and `about` referencing Pekanbaru/Riau heritage. The decorative hero is not schema'd as content (it's `role="presentation"`).

**Rationale:** Generative engines parse JSON-LD to understand entity-relevant media. Marking the 2 content images as `ImageObject` about Pekanbaru/Riau heritage increases the chance they (and the page) are cited for local-heritage queries. The decorative hero is excluded to keep the schema truthful (it's atmospheric, not content).

**Alternatives considered:**

- _Schema all 3 images_ — rejected: the hero is opacity-40 atmospheric background, not content; schema'ing it as an `ImageObject` would misrepresent the page's media.
- _No schema (alt + filename only)_ — rejected: the user asked for a GEO approach; JSON-LD is the primary GEO signal.

### Decision 7: Conversion tooling (no runtime dep)

**Choice:** Download via `curl` to a temp `.jpg`; re-encode to WebP via macOS `sips -s format webp` (available on the dev machine); read dimensions via `sips -g pixelWidth -g pixelHeight`. No `sharp`/ImageMagick dependency added to the app — conversion is a one-off build step, not runtime.

**Rationale:** `sips` is pre-installed on macOS (the dev environment); no `npm install`. If `sips` is unavailable, fall back to a one-off `sharp` script (`pnpm dlx sharp`). The WebP files are committed to `/static/images/` — no runtime image processing.

## The image map (current → after)

```
+page.svelte IMAGE MAP
═══════════════════════════════════════════════════════════════════════

1. HERO PHOTO (LCP)
   was:  <div class="...opacity-40" style="background-image:url('https://lh3...AB6AXuAnxtYm...')">
   now:  <img src="/images/hero/pekanbaru-heritage-scene.webp"
              alt="Pekanbaru heritage scene featuring traditional Riau architecture and batik motifs"
              class="w-full h-full object-cover opacity-40"
              width="{W}" height="{H}"
              loading="eager" fetchpriority="high" decoding="async" />
   (gradient overlay + batik-pattern div unchanged)

2. BENTO SONGKET (below-fold)
   was:  <img alt="Songket pattern background" src="https://lh3...AB6AXuBwy1DZg...'" ...>
   now:  <img src="/images/bento/songket-pattern-pekanbaru.webp"
              alt="Songket pattern, traditional handwoven textile of Pekanbaru, Riau"
              width="{W}" height="{H}"
              loading="lazy" decoding="async" ... />

3. BENTO CULINARY (below-fold)
   was:  <img alt="Local market stall with tropical fruits" src="https://lh3...AB6AXuBDFXsAc...'" ...>
   now:  <img src="/images/bento/senapelan-culinary-market.webp"
              alt="Local market stall with tropical fruits in Senapelan, Pekanbaru"
              width="{W}" height="{H}"
              loading="lazy" decoding="async" ... />

JSON-LD (new <svelte:head>):
  ItemList of 2 ImageObject (songket + culinary), about Pekanbaru/Riau heritage
```

## Risks / Trade-offs

- **[Risk: Google prunes `aida-public` URLs before download]** — if the remote URLs 404 during apply, the download fails.
  → **Mitigation:** download all 3 first (fail fast); if any 404s, pause and ask the user for an alternate source. The whole point of localizing is to remove this dependency.
- **[Risk: `sips` not on PATH]** — `sips` is macOS-only; CI/non-Mac devs won't have it.
  → **Mitigation:** the WebP files are committed (one-off conversion); future re-encodes can use `sharp`. Note in tasks: if `sips` missing, use `pnpm dlx sharp` via a one-off script.
- **[Trade-off: descriptive alt on an opacity-40 hero]** — the hero image is atmospheric (40% opacity behind a gradient); a screen reader will announce the descriptive alt at the page top.
  → **Mitigation:** the alt is factual and concise; the hero IS a real Pekanbaru scene, so announcing it is acceptable. If a11y review objects, switch hero to `alt=""` (decorative) and rely on filename + JSON-LD for SEO — but lose the alt-keyword signal.
- **[Trade-off: no responsive `srcset`]** — single WebP per image; large viewports download the full-size file.
  → **Mitigation:** acceptable for 3 images; add `srcset` later if Lighthouse flags image payload.

## Migration Plan

1. Download the 3 remote URLs to `/tmp` via `curl`; verify each succeeded (non-zero bytes).
2. Re-encode each to WebP at `/static/images/{hero,bento}/<filename>.webp` via `sips`; capture `width`/`height`.
3. Update `+page.svelte`: hero photo `<div>` → `<img>`; 2 bento `<img>` `src` + alt + dimensions + loading attrs.
4. Add the `ImageObject` JSON-LD `<svelte:head>` block.
5. Verify: `pnpm check` clean on `+page.svelte`; `pnpm dev` → confirm the 3 images render locally (no `lh3.googleusercontent.com` requests in the network tab); `pnpm lint` scoped to `+page.svelte`.

**Rollback:** revert the commit + delete the 3 WebP files; `+page.svelte` returns to the remote URLs (the remote images still work unless Google pruned them).

## Open Questions

1. **Hero alt a11y vs SEO** — descriptive alt (SEO win) or empty `alt=""` (a11y decorative)? _Current proposal: descriptive alt (the image is a real scene)._
2. **`og-default.png` missing** — referenced in the OG meta but not at `/static/og-default.png`. Out of scope here, but should be fixed in a follow-up (social-share SEO).
3. **Responsive `srcset`** — generate 2x/3x variants? _Current proposal: no (single WebP); revisit if Lighthouse flags._
4. **Image `creator`/`creditText`** — are the Google `aida-public` images AI-generated (no human author) or licensed? _Current proposal: `creditText: "PKUBersua"` placeholder; update if there's a real attribution._
