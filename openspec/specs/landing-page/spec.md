# landing-page Specification

## Purpose

Defines the structure, content, design tokens, and behavior of the public landing page at `/` — its semantic sections, OKLCH color and typography system, reusable component classes, responsive layout, and motion rules.

## Requirements

### Requirement: Page renders seven semantic sections in order

The landing page at `/` SHALL render, in this order: a sticky site header, a hero, a featured next event, an announcements list, a recent posts list, an about strip, and a footer. Each section SHALL be a semantic landmark (`<header>`, `<main>` containing `<section>` blocks with `aria-labelledby`, `<footer>`).

#### Scenario: Visitor loads the landing page

- **WHEN** a visitor navigates to `/`
- **THEN** the page renders header, hero, next event, announcements, recent posts, about strip, and footer in that order, each as a distinct semantic region.

#### Scenario: Single level-one heading

- **WHEN** the page is parsed for heading structure
- **THEN** exactly one `<h1>` exists (the hero headline) and all section headings are `<h2>`.

### Requirement: Design token system defines OKLCH colors and typography

`src/routes/layout.css` SHALL define, via Tailwind v4 `@theme`, the color tokens canvas, surface, ink, muted, hairline, primary, and primary-hover in OKLCH; the font tokens display (Spectral) and body (Source Sans 3); the radius tokens card (12px) and pill (9999px); and the text-size tokens display, headline, title, body, and label as fluid `clamp()` values.

#### Scenario: Body text contrast against canvas

- **WHEN** the `ink` token is used for body text on the `canvas` background
- **THEN** the computed contrast ratio is at least 7:1.

#### Scenario: Muted text contrast against canvas

- **WHEN** the `muted` token is used for secondary text on the `canvas` background
- **THEN** the computed contrast ratio is at least 4.5:1.

#### Scenario: Primary accent stays within the One Voice budget

- **WHEN** the rendered page is analyzed for primary-accent surface coverage
- **THEN** the primary accent color occupies no more than 10% of the visible surface area at any viewport.

### Requirement: Reusable component classes are defined

`src/routes/layout.css` SHALL define the reusable classes `.container-page` (max-width 72rem, fluid horizontal padding via `clamp()`), `.measure-prose` (max-width 70ch), `.label-meta` (small uppercase-free meta text), and `.link-quiet` (hairline underline transitioning to primary on hover). The `.btn-primary` class is REMOVED; its role is filled by the shadcn Button component (see the `shadcn-components` spec). The 1px section dividers previously rendered via `border-t border-hairline` are now rendered via the shadcn Separator component. The header and footer navigation previously rendered as hand-rolled `<nav>` markup is now rendered via the shadcn NavigationMenu component.

#### Scenario: Primary button text color

- **WHEN** the shadcn Button (primary variant) is rendered
- **THEN** its text color is the `--primary-foreground` (canvas/white) token, not ink, because the primary fill is a saturated mid-luminance color where white text reads correctly under the Helmholtz-Kohlrausch effect.

#### Scenario: Quiet link hover

- **WHEN** a `.link-quiet` element is hovered or receives focus
- **THEN** its underline border and text color transition to the primary accent color.

#### Scenario: Section dividers render via shadcn Separator

- **WHEN** the landing page renders a divider between sections
- **THEN** it uses the shadcn Separator component with `orientation="horizontal"`, producing a 1px line in the `--border` color, visually equivalent to the previous `border-t border-hairline` rule.

### Requirement: Web fonts are loaded with preconnect

`src/app.html` SHALL include `<link rel="preconnect">` for `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (with `crossorigin`), and a stylesheet link to Google Fonts for Spectral (weights 400, 500, 600 plus italic 400, 500) and Source Sans 3 (weights 400, 500, 600, 700) with `display=swap`.

#### Scenario: Fonts load with fallback visible

- **WHEN** the page loads on a slow connection
- **THEN** text renders immediately in the fallback stack (Georgia for display, system-ui for body) and swaps to the web fonts once they arrive, without a flash of invisible text.

### Requirement: Header is sticky with wordmark and nav

The site header SHALL be `position: sticky; top: 0` with a 1px hairline bottom border. It SHALL contain the wordmark "PKU Remote" (Spectral 500) and a shadcn NavigationMenu with anchors to `#events`, `#announcements`, `#posts`. On viewports below 640px the nav SHALL collapse into a `<details>` disclosure; above 640px it SHALL display inline. The NavigationMenu's hover and focus states SHALL use the `--primary` accent, matching the previous hand-rolled nav treatment.

#### Scenario: Header stays visible while scrolling

- **WHEN** the visitor scrolls down the page
- **THEN** the header remains pinned to the top of the viewport with the hairline border dividing it from the content beneath.

#### Scenario: Keyboard focus on nav links

- **WHEN** a keyboard user tabs through the NavigationMenu
- **THEN** each link shows a visible focus ring in `--ring` (mapped to `--primary`).

### Requirement: Hero displays one headline, subcopy, and two actions

The hero section SHALL display one `<h1>` headline in Spectral at the `display` size, one sentence of subcopy in muted ink capped at 70ch, and two actions: a primary button linking to `#events`, and a quiet link to `#posts`.

#### Scenario: Hero headline animates once on load

- **WHEN** the page loads with `prefers-reduced-motion` unset
- **THEN** the hero headline fades and rises 8px over 0.6 seconds using an ease-out exponential curve, then remains static.

#### Scenario: Hero headline does not animate under reduced motion

- **WHEN** the page loads with `prefers-reduced-motion: reduce` set
- **THEN** the hero headline appears instantly with no animation.

### Requirement: Next event section features one upcoming event

The next event section SHALL render exactly one featured event with a date (Source Sans 3 600, primary color, tabular-nums), a title in Spectral at headline size, a meta row with location and time, a two-sentence excerpt, and an RSVP link. The layout SHALL be two-column on desktop (date column fixed at 8rem) and single-column on mobile with the date inline above the title. The section SHALL have a 1px hairline top border, no card border, and no shadow.

#### Scenario: Featured event renders without a card

- **WHEN** the next event section is rendered
- **THEN** the event appears as a two-column editorial row separated from the previous section by a 1px hairline, not enclosed in a bordered or shadowed card.

### Requirement: Announcements list renders dated entries

The announcements section SHALL render a section heading followed by a list of dated entries. Each entry SHALL have a date column (`.label-meta`, tabular-nums) and a headline with a one-line excerpt in muted ink. Entries SHALL be separated by 1px hairlines. The list SHALL render at least two and at most five entries.

#### Scenario: Announcements render as an editorial list, not a card grid

- **WHEN** the announcements section is rendered
- **THEN** entries appear as horizontal date-and-headline rows divided by hairlines, not as a grid of bordered cards.

### Requirement: Recent posts list renders reading-list entries

The recent posts section SHALL render a section heading followed by post entries. Each post SHALL have a serif title (Spectral 500) that is a `.link-quiet` on hover, a byline row (author, date, reading time in `.label-meta`), a two-line excerpt capped at 70ch, and a "Read →" link. Entries SHALL be separated by 1px hairlines with generous vertical rhythm. The section SHALL render exactly three posts.

#### Scenario: Post title hover state

- **WHEN** a visitor hovers a post title
- **THEN** the title's underline and text color transition to the primary accent.

### Requirement: About strip renders one paragraph and one link

The about strip SHALL render a section heading ("About the club") in Spectral at headline size, followed by one paragraph of body text capped at 70ch, and one `.link-quiet` to a future About page. No imagery, no card, no secondary actions.

#### Scenario: About strip is quiet

- **WHEN** the about strip is rendered
- **THEN** it contains exactly one heading, one paragraph, and one link, with no decorative elements, cards, or imagery.

### Requirement: Footer renders wordmark, nav, community links, and copyright

The footer SHALL render the wordmark, a small navigation list repeating the header nav plus an About link, one line of community links (Discord, Telegram, Email) as plain hairline-underline links, and a bottom row with `© 2026 PKU Remote` in `.label-meta`. The footer SHALL have a 1px hairline top border. No large CTA banner.

#### Scenario: Footer does not contain a call-to-action banner

- **WHEN** the footer is rendered
- **THEN** it contains only wordmark, nav, community links, and copyright — no full-width colored banner, button, or hero-style CTA.

### Requirement: Layout is responsive without breakpoint-specific markup

The page SHALL be mobile-first and use `clamp()` for container padding, fluid text sizes, and section vertical rhythm. Date columns SHALL collapse inline above the title on viewports below 640px. No breakpoint-specific class toggles beyond the header `<details>` disclosure.

#### Scenario: Page renders at 360px viewport

- **WHEN** the page is rendered at a 360px viewport width
- **THEN** no horizontal overflow occurs, all text remains readable, and the two-column date layouts collapse to a single inline column.

#### Scenario: Page renders at 1280px viewport

- **WHEN** the page is rendered at a 1280px viewport width
- **THEN** the content container centers with a max-width of 72rem and sections read with generous whitespace, not stretched edge-to-edge.

### Requirement: Motion respects reduced-motion preference

Every animation and transition on the page SHALL provide a `@media (prefers-reduced-motion: reduce)` alternative that disables animations and makes transitions effectively instant. The hero fade-up SHALL be the only entrance animation on the page; no scroll-triggered choreography SHALL exist.

#### Scenario: Reduced motion disables hero animation

- **WHEN** a visitor with `prefers-reduced-motion: reduce` loads the page
- **THEN** the hero headline appears immediately with no fade or transform animation.

#### Scenario: Hover transitions are effectively instant under reduced motion

- **WHEN** a visitor with `prefers-reduced-motion: reduce` hovers a `.link-quiet` or `.btn-primary`
- **THEN** the state change happens with a duration of effectively 0ms rather than the default 0.18s ease.

### Requirement: Dummy content is clearly sample data

The featured event, announcements, and posts SHALL use sample content defined as typed `const` arrays at the top of the page's `<script lang="ts">` block. The sample content SHALL be realistic (realistic event names, Pekanbaru place names, realistic post titles and authors) and structured so a content owner can replace the arrays without touching markup.

#### Scenario: Content owner inspects the page source

- **WHEN** a content owner opens `src/routes/+page.svelte`
- **THEN** the dummy event, announcements, and posts are visible as typed arrays at the top of the script block, clearly the single swap surface for real content.