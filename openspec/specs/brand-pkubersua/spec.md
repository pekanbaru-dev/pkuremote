# brand-pkubersua Specification

## Purpose

TBD - created by archiving change slice-events-rebrand-pkubersua. Update Purpose after archive.

## Requirements

### Requirement: The public brand name is "PKUBersua" everywhere it appears in the codebase

Every tracked file that references the old brand name SHALL be updated to use "PKUBersua" (one word, capitalised B) in the brand-name position. The wordmark in the site header and footer SHALL read "PKUBersua". The `<title>` suffix on every page SHALL be `" — PKUBersua"`. The seed data in `db/seed.ts` SHALL use the new name. The `PRODUCT.md` register SHALL use the new name.

#### Scenario: A reviewer greps the codebase for the old brand name

- **WHEN** a reviewer greps the repo for `PKU Remote` (case-insensitive)
- **THEN** zero matches appear in any tracked file under `src/`, `db/`, `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `openspec/`, or `static/`.

#### Scenario: A visitor loads the homepage

- **WHEN** a visitor loads `/`
- **THEN** the visible wordmark in the header reads "PKUBersua", the visible wordmark in the footer reads "PKUBersua", and the copyright line reads "© 2026 PKUBersua".

#### Scenario: A search engine crawls the homepage

- **WHEN** a crawler parses the homepage HTML
- **THEN** the `<title>` ends with " — PKUBersua", the `og:site_name` is "PKUBersua", and the JSON-LD `organizer.name` is "PKUBersua".

### Requirement: The public surface URL is `pkubersua.com`

The canonical public URL of the site SHALL be `https://pkubersua.com`. This URL is the value of `PUBLIC_SITE_URL` in production, the value of the canonical link on every public page, the host portion of every URL in `sitemap.xml`, and the host portion of the `Sitemap:` line in `robots.txt`. The local dev value remains `http://localhost:5175`. The `.env.example` file SHALL list both values.

#### Scenario: A developer sets up local dev

- **WHEN** a developer copies `.env.example` to `.env` and starts the dev server
- **THEN** `PUBLIC_SITE_URL=http://localhost:5175` and the homepage's canonical link points at `http://localhost:5175/`.

#### Scenario: A production deploy happens

- **WHEN** the production environment sets `PUBLIC_SITE_URL=https://pkubersua.com`
- **THEN** the rendered HTML, the sitemap, and the robots.txt all reference `https://pkubersua.com`.

### Requirement: The booking contact email is `hello@pkubersua.com`

The booking CTA on every event detail page SHALL open `mailto:hello@pkubersua.com` (with the event title pre-filled in the subject line). The footer contact list SHALL include an "Email" link to `mailto:hello@pkubersua.com`. The `.env.example` file SHALL document `CONTACT_EMAIL=hello@pkubersua.com` as a configurable value (with the default matching the public brand).

#### Scenario: A visitor clicks the booking CTA

- **WHEN** a visitor clicks the "Booking Sekarang" button on an event detail page
- **THEN** their default mail client opens a new compose window addressed to `hello@pkubersua.com` (read from the public brand contract, not the `CONTACT_EMAIL` env var, since the public URL is fixed).

#### Scenario: A reviewer audits the contact email in the footer

- **WHEN** a reviewer greps the homepage HTML for the contact email
- **THEN** the footer "Email" link is `mailto:hello@pkubersua.com`.

### Requirement: The design palette is the Stitch Material-3 golden palette

The project SHALL adopt the Material-3 golden palette from the Stitch design system as the canonical design tokens. The tokens SHALL be defined in `src/routes/layout.css` under `@theme` in OKLCH, with both the brand-name family (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-primary-container`, `--color-on-primary-container`, `--color-secondary`, `--color-tertiary`, `--color-outline`, `--color-surface-*`) and the shadcn-mapped family (`--color-background`, `--color-foreground`, `--color-primary-foreground`, `--color-secondary-foreground`, `--color-muted-foreground`, `--color-border`, `--color-ring`, `--color-input`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-popover`, `--color-popover-foreground`, `--color-card`, `--color-card-foreground`). The canvas SHALL be cream (`oklch(0.981 0.034 100)` — derived from `#fefae0`). The primary accent SHALL be deep amber (`oklch(0.483 0.097 87)` — derived from `#765a05`).

#### Scenario: A reader inspects the design tokens

- **WHEN** a reader opens `src/routes/layout.css` and reads the `@theme` block
- **THEN** they find the full Material-3 family for the golden palette in OKLCH, with both brand-name and shadcn-name tokens defined.

#### Scenario: A component author uses the canvas token

- **WHEN** a component renders a page background using `bg-canvas`
- **THEN** the rendered background is the cream value `#fefae0` (or its OKLCH equivalent), not pure white.

#### Scenario: A component author uses the primary token

- **WHEN** a component renders an accent (e.g., a primary button fill) using `bg-primary`
- **THEN** the rendered fill is the deep-amber value `#765a05` (or its OKLCH equivalent), not the previous ochre `oklch(0.72 0.135 95)`.

### Requirement: Typography is Hanken Grotesk (display + body) and Manrope (label)

The project SHALL load Hanken Grotesk for display headings and body text, and Manrope for label/meta text, via Google Fonts with preconnect. The font tokens SHALL be defined in `src/routes/layout.css` as `--font-display: "Hanken Grotesk", system-ui, sans-serif`, `--font-body: "Hanken Grotesk", system-ui, sans-serif`, and `--font-label: "Manrope", system-ui, sans-serif`. The `<link rel="preconnect">` tags in `src/app.html` SHALL cover `https://fonts.googleapis.com` and `https://fonts.gstatic.com`. The Google Fonts stylesheet link SHALL request the weights documented in the Stitch `fontSize` table (headline-xl 800, headline-lg 600, headline-md 600, body-lg 400, body-md 400, label-lg 600 with letter-spacing 0.05em, label-md 500).

#### Scenario: A reader inspects the font tokens

- **WHEN** a reader opens `src/routes/layout.css`
- **THEN** they find `--font-display`, `--font-body`, and `--font-label` defined with the Stitch font families and a system-ui fallback stack.

#### Scenario: A visitor loads the homepage

- **WHEN** the page loads on a slow connection
- **THEN** text renders immediately in the system fallback (`system-ui`, sans-serif) and swaps to Hanken Grotesk / Manrope once the web fonts arrive, with no flash of invisible text.

### Requirement: `DESIGN.md` is updated to reflect the new brand and palette

`DESIGN.md` SHALL be rewritten so the palette section describes the Stitch golden palette as canonical, the typography section names Hanken Grotesk + Manrope, the "True Neutral Rule" and the "no warm cream" prohibition SHALL be explicitly retired (with a note that the canvas is intentionally warm cream as a brand decision), and the `Don't` list SHALL be updated to reflect what the new design system no longer prohibits.

#### Scenario: A reviewer reads DESIGN.md

- **WHEN** a reviewer reads the `DESIGN.md` palette section
- **THEN** they find the Stitch golden palette documented as the canonical palette, and the previous "True Neutral Rule" is no longer present.

#### Scenario: A reviewer reads DESIGN.md don't list

- **WHEN** a reviewer reads the "Don't" section
- **THEN** the prohibition on warm cream backgrounds is absent, and the prohibition on gradient text / ghost cards / generic community templates is preserved.

### Requirement: `PRODUCT.md` is updated to reflect the new brand and positioning

`PRODUCT.md` SHALL be rewritten so the register names "PKUBersua", the users section describes the cross-profession Pekanbaru community (not only remote workers), the product purpose describes a community-of-events (not a remote-worker club), and the brand personality is adjusted to match the new positioning while keeping the "calm, minimal, focused" three-word personality.

#### Scenario: A reviewer reads PRODUCT.md

- **WHEN** a reviewer reads the `PRODUCT.md` register and users section
- **THEN** they find the brand name "PKUBersua", the audience described as a cross-profession Pekanbaru community, and the product purpose centered on event discovery and registration.

#### Scenario: A reviewer greps PRODUCT.md for the old brand name

- **WHEN** a reviewer greps `PRODUCT.md` for `PKU Remote` (case-insensitive)
- **THEN** zero matches appear.

### Requirement: Tagline is a placeholder for follow-up copy

The hero on the homepage SHALL render the tagline text `[TAGLINE_PKUBERSUA_TBD]` (with surrounding context "Kabar terbaru komunitas Pekanbaru dalam satu tempat") as a visible placeholder, until the brand team supplies a final tagline. The placeholder SHALL be a literal string in the source (not a prop or env var) so that a follow-up PR replaces it with a one-line edit.

#### Scenario: A visitor loads the homepage

- **WHEN** a visitor loads `/` and reads the hero
- **THEN** the visible tagline is the placeholder `[TAGLINE_PKUBERSUA_TBD]` followed by a small descriptive line about the community.

#### Scenario: A developer replaces the placeholder

- **WHEN** a developer opens `src/routes/+page.svelte`, finds the literal `"[TAGLINE_PKUBERSUA_TBD]"`, and replaces it with a real tagline
- **THEN** the new tagline renders on the homepage without any other change, and `pnpm check && pnpm lint` remain green.
