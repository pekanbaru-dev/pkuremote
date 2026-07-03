## ADDED Requirements

### Requirement: Landing page images are local static assets optimized for SEO and GEO

The landing page (`src/routes/+page.svelte`) SHALL render every image from a local static asset under `/static/images/` (served at `/images/...`) — it SHALL NOT reference any remote (cross-origin) image URL (e.g. `lh3.googleusercontent.com`) for rendered imagery. Each image SHALL be encoded as WebP and SHALL carry explicit native `width` and `height` attributes (to reserve aspect-ratio box and prevent CLS). Each image SHALL have a keyword-rich, lowercase, hyphenated filename and descriptive `alt` text that names the subject and the local entities (Pekanbaru, Riau, Senapelan, songket, batik) where the image depicts local-heritage subject matter. The hero (LCP) image SHALL use `loading="eager"` and `fetchpriority="high"`; below-fold images SHALL use `loading="lazy"`. All images SHALL use `decoding="async"`. Content images (not decorative backgrounds) SHALL be rendered as `<img>` elements (not CSS `background-image`) so they are crawlable and indexable. The landing page SHALL include an `ImageObject` JSON-LD block (in `<svelte:head>`) for content images, each naming `contentUrl`, `name`, `description`, and `creditText`, to signal local-heritage subject matter to generative engines (GEO). Purely decorative background imagery (e.g. the opacity-0.07 batik-pattern overlay) is exempt from the `<img>`/alt/schema requirements and may remain as CSS.

#### Scenario: No remote image URLs on the landing page

- **WHEN** the rendered landing page HTML is inspected
- **THEN** every `src` attribute and `background-image` URL resolves to a local path under `/images/...` (or `/partners/...` for the existing partner logos), and no `lh3.googleusercontent.com` or other cross-origin image URL appears.

#### Scenario: Hero image is a crawlable img with LCP-priority loading

- **WHEN** the hero section is rendered
- **THEN** the hero photo is an `<img>` element (not a CSS `background-image`) with a descriptive `alt`, `loading="eager"`, `fetchpriority="high"`, `decoding="async"`, and explicit `width`/`height`, served from `/images/hero/`.

#### Scenario: Below-fold images are lazy-loaded with dimensions

- **WHEN** a below-fold bento image is rendered
- **THEN** it carries `loading="lazy"`, `decoding="async"`, explicit `width`/`height`, a keyword-rich local filename, and descriptive `alt` naming the local-heritage subject.

#### Scenario: Content images expose ImageObject schema

- **WHEN** a crawler or generative engine reads the landing page's JSON-LD
- **THEN** it finds an `ImageObject` entry for each content image (not the decorative hero) with `contentUrl`, `name`, `description`, and `creditText`, identifying the images as Pekanbaru/Riau local-heritage subject matter.

#### Scenario: Images do not cause layout shift

- **WHEN** the landing page loads on a slow connection
- **THEN** no cumulative layout shift is caused by images, because each `<img>` reserves its aspect-ratio box via native `width`/`height` before the file arrives.
