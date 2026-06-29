## Why

The PKU Remote club site has no public surface yet — only a fresh SvelteKit scaffold. The community (remote-working people in Pekanbaru) needs a single landing page that surfaces upcoming events, announcements, and recent blog posts so members can see what's happening and prospective members can see the community is active. PRODUCT.md and DESIGN.md already define the brand ("The Quiet Bulletin" — calm, minimal, focused, editorial reading-first, Substack-adjacent), so this change builds the first real page against that established direction.

## What Changes

- Add a landing page at `/` (`src/routes/+page.svelte`) with seven semantic sections: sticky header, hero, next featured event, announcements list, recent posts list, about strip, footer.
- Rewrite `src/routes/layout.css` with the OKLCH design token system (canvas, surface, ink, muted, hairline, primary ochre accent), typography tokens (Spectral display + Source Sans 3 body), base styles (headings, focus ring, selection, reduced-motion), and reusable component classes (`.container-page`, `.measure-prose`, `.label-meta`, `.link-quiet`, `.btn-primary`).
- Add Google Fonts preconnect + stylesheet links for Spectral and Source Sans 3 to `src/app.html`.
- Use clearly-marked dummy content for the featured event, announcements, and posts so the structure and visual rhythm are real and reviewable while content owners fill in real entries.

## Capabilities

### New Capabilities

- `landing-page`: The single public landing page — the community's front door. Covers the page composition (header, hero, featured event, announcements list, posts list, about strip, footer), the design-token system that styles it, the responsive layout rules, and the motion/reduced-motion behavior.

### Modified Capabilities

<!-- None. This is a greenfield surface; no existing specs are modified. -->

## Impact

- **Code:** `src/routes/+page.svelte` (new full page), `src/routes/layout.css` (rewrite), `src/app.html` (font links added). `src/routes/+layout.svelte` unchanged (already imports `layout.css`). Demo routes under `src/routes/demo/` remain for now and can be removed in a follow-up change.
- **Dependencies:** No new runtime dependencies. Fonts loaded via Google Fonts CDN (preconnect + stylesheet link in `app.html`). Tailwind v4 already installed; tokens defined via `@theme` in `layout.css`.
- **Design system:** Establishes the project's first real visual tokens and component classes. Later features (event detail pages, post pages, about page) will reuse `.container-page`, `.measure-prose`, `.link-quiet`, `.btn-primary`, and the OKLCH color tokens defined here.
- **Content:** Dummy content only. A separate future change will wire the page to real event/announcement/post data (likely markdown content or a CMS); this change ships the visual and structural foundation.
