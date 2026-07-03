## Context

The project is a fresh SvelteKit + TypeScript + Tailwind v4 scaffold with no real UI yet. PRODUCT.md defines the brand ("The Quiet Bulletin" — calm, minimal, focused, for Pekanbaru remote workers) and DESIGN.md defines the visual system (restrained color strategy, goldenrod ochre accent ≤10%, Spectral serif display + Source Sans 3 body, flat-by-default elevation, responsive motion). The landing page is the first real surface built against that established direction.

Current state: `src/routes/+page.svelte` is the default SvelteKit welcome page. `src/routes/layout.css` imports Tailwind but defines no tokens. `src/app.html` has no web font links. No design tokens, component classes, or semantic page structure exist yet.

Constraints:

- Tailwind v4 is already installed; tokens MUST be defined via `@theme` in `layout.css` (Tailwind v4's native mechanism), not a `tailwind.config.js`.
- Fonts load via Google Fonts CDN (preconnect + stylesheet link). No `@fontsource` package; the project has no runtime font dependency yet and the CDN path is the lightest for a single-page surface.
- Svelte 5 runes mode (`$props`, `$state`) is the project default; components use the runes API.

## Goals / Non-Goals

**Goals:**

- Build the landing page at `/` as a single `+page.svelte` with seven semantic sections (header, hero, next event, announcements, recent posts, about strip, footer).
- Establish the design-token system (OKLCH colors, typography, radii) in `layout.css` via Tailwind v4 `@theme`, reusable across future pages.
- Define reusable component classes (`.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet`, `.btn-primary`) so future pages compose without restyling.
- Ship responsive, accessible, reduced-motion-aware markup with real semantic landmarks.
- Use clearly-marked dummy content that content owners can swap without touching structure.

**Non-Goals:**

- Real content wiring (CMS, markdown sources, database). Dummy data only.
- Event detail pages, full About page, individual post pages. Those are follow-up changes that will reuse the tokens and classes established here.
- Dark mode. The brand scene (daytime, reading-first, Pekanbaru community) lands on light mode; dark mode is a separate decision.
- A component library split. Everything lives in `+page.svelte` and `layout.css` for now; extraction into `$lib/components/` happens when a second page needs the same pieces.
- Removing the demo routes (`src/routes/demo/`). Out of scope; a later cleanup change will handle that.
- Scroll-spy nav, animated section entrances, or any scroll-driven choreography. Motion is responsive (hover/focus + one page-load fade on the hero), not choreographed.

## Decisions

### D1: Tokens in Tailwind v4 `@theme` (not a config file)

**Choice:** Define all color, font, radius, and size tokens via `@theme { --color-* --font-* --radius-* --text-* }` in `src/routes/layout.css`.

**Why over alternatives:** Tailwind v4's native mechanism is `@theme`, and the project already has `@import 'tailwindcss'` in `layout.css`. A separate `tailwind.config.js` would reintroduce the v3 pattern v4 explicitly replaced. `@theme` also emits the tokens as CSS custom properties on `:root`, so hand-written component classes can reference them via `var(--color-ink)` without a build step. Alternatives considered: (a) plain `:root { --token: ... }` without `@theme` — works but loses Tailwind utility generation (e.g. `bg-canvas`, `text-ink`); (b) a `tokens.css` file imported separately — one more file for a single-page surface, premature split.

### D2: Single `+page.svelte`, not a component split

**Choice:** Write the entire landing page in `src/routes/+page.svelte`. No `$lib/components/` extraction in this change.

**Why:** Only one page exists. Extracting `Header.svelte`, `EventCard.svelte`, etc. before a second page exists is speculative abstraction. The page is long but readable as one file because the sections are structurally distinct. When the About page or an event detail page lands and needs the same header/footer, that follow-up change extracts them — informed by real reuse, not guessed reuse.

### D3: Dummy content as literal data inside `+page.svelte`

**Choice:** Define the featured event, announcements, and posts as Svelte `const` arrays at the top of `<script lang="ts">`, rendered with `{#each}`.

**Why over alternatives:** This keeps structure and content together for the first surface, makes the data shape visible to whoever wires real content later, and avoids inventing a content-loading contract (CMS? markdown? API?) before one is chosen. The arrays act as the implicit content schema. Alternatives considered: (a) a `$lib/data/` module with typed content — premature; the types would be invented without a real source. (b) Loading from `+page.ts` / `+page.server.ts` — no source exists to load from. (c) Markdown files in `src/content/` — a real option later, but this change doesn't pick the content strategy.

### D4: Google Fonts CDN (preconnect + stylesheet link)

**Choice:** Add `<link rel="preconnect">` for `fonts.googleapis.com` and `fonts.gstatic.com` plus a single stylesheet `<link>` for Spectral + Source Sans 3 in `src/app.html`.

**Why over alternatives:** Lightest path for a single-page surface. No new runtime dependency, no `@fontsource` package install, no font files copied into `static/`. `display=swap` avoids FOIT and keeps text visible during load. Alternatives considered: (a) `@fontsource/spectral` + `@fontsource/source-sans-3` — self-hosted, removes a network dependency, but adds two packages and build complexity for a landing page; a reasonable follow-up if performance audits later flag the CDN. (b) System fonts only — abandons the Spectral/Source Sans 3 pairing that DESIGN.md specifies. (c) Font subset generation — premature optimization for one page.

### D5: Component classes in `@layer components`, not utility-only

**Choice:** Define `.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet`, `.btn-primary` in `@layer components` inside `layout.css`. Use them in the markup. Use Tailwind utilities for one-off spacing/layout.

**Why:** Reusable patterns get a named class; one-offs use utilities. This keeps the page markup readable (`class="container-page"` vs `class="max-w-72rem mx-auto px-[clamp(...)]"`) and makes the design system's primitives visible in one place. `@layer components` keeps Tailwind's utility specificity correct so utilities in markup can override component-class defaults when needed.

### D6: Header is sticky with an always-on hairline border

**Choice:** `<header>` uses `position: sticky; top: 0; border-bottom: 1px solid var(--color-hairline)` with no scroll-triggered border toggle.

**Why over alternatives:** No JavaScript needed. The hairline is subtle enough on a pure-white canvas that it reads as a divider, not a heavy chrome bar. A scroll-triggered appearing/disappearing border adds JS complexity and a layout-shift risk for zero aesthetic gain on a calm editorial surface. The brand is "quiet," so the header is quiet.

## Risks / Trade-offs

- **[Risk] Google Fonts CDN is a network dependency and a flash of unstyled text.** → Mitigation: `display=swap` keeps text visible and readable in the fallback stack (Georgia / system-ui) during load. If performance audits later flag it, migrate to `@fontsource` self-hosting in a follow-up change; the `--font-display` / `--font-body` tokens won't change.
- **[Risk] Dummy content ships to production if no one swaps it.** → Mitigation: The content is clearly sample-shaped (a content owner can see the data arrays at the top of the script block and replace them). A follow-up change to wire real content should land before this goes public. The data arrays make the swap surface obvious.
- **[Risk] Single `+page.svelte` becomes hard to maintain if the page grows.** → Mitigation: Acceptable for the landing page's current scope (seven sections, no interactivity beyond hover/focus and a disclosure nav). When a second page needs the header/footer, that change extracts them — the structure is already section-shaped, so extraction is mechanical.
- **[Trade-off] No dark mode in this change.** → The brand scene sentence (Pekanbaru community reading events in daylight) picks light mode. Adding dark mode would double the token surface and force design decisions (ochre on dark, muted-ink on dark) that belong to a dedicated pass, not the first page.
- **[Trade-off] No scroll-spy or active-section detection on the nav.** → The nav anchors to section IDs; the "active" state is ochre on hover only. Scroll-spy adds JS and a re-render loop for a quiet page where the user scrolls once. A future change can add it if usage shows it's needed.
