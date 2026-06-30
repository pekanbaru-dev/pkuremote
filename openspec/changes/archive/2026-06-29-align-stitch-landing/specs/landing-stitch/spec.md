# landing-stitch Specification (delta)

## Purpose

Defines the visual design system for the PKUBersua public landing page, derived from the Stitch design `projects/15775088065885956423/screens/201e2a86b11f4749a57a6d6ab46caff2` ("Pekanbaru Community - Home with Authentic Partner Logos"). Covers the hero composition (870px fixed height, hero-clip polygon, batik-pattern overlay, dual CTAs), the header (search bar, Login/Register pill button), the event-card style (category pills, talam-shadow, primary-container bottom border, calendar icon, Book Now CTA), the Upcoming Community Gatherings 3-column grid, the Empower Your Business CTA with the Community Impact metric card, the Trusted by Partners 4-logo grid (placeholder logos), the four-column footer with email input, and the supporting custom CSS classes and design tokens.

## ADDED Requirements

### Requirement: Hero is a fixed 870px section with batik pattern, hero-clip, and dual CTAs

The homepage hero SHALL render as a `<section>` with `class="relative w-full h-[870px] bg-surface overflow-hidden flex items-center hero-clip"`. Inside the section, in document order, the following elements SHALL be rendered: (1) an absolute-positioned `<div>` with `class="absolute inset-0 z-0 opacity-[0.07] pointer-events-none hero-pattern"` (batik pattern fill); (2) an absolute-positioned `<div>` containing a background image of the Great Mosque of An-Nur (Riau) at 40% opacity and a `bg-gradient-to-r from-surface via-surface/80 to-transparent` overlay; (3) a content container with `class="relative z-10 px-margin-desktop max-w-[1280px] mx-auto w-full"` containing a "Pekanbaru Heritage & Culture" pill badge (`bg-secondary-container text-on-secondary-container rounded-full font-label-lg`), the h1 "Celebrating the Heart of Riau's Local Heritage" (with "Riau's Local Heritage" rendered as a `<span class="text-secondary">`), one short descriptive sentence, and two CTAs ("Explore Events" filled `bg-primary-container` `rounded-lg`, "Learn History" outlined `border-2 border-primary text-primary` `rounded-lg`).

#### Scenario: Hero renders all elements

- **WHEN** a visitor loads the homepage
- **THEN** the page renders a hero with the batik pattern overlay, the background image, the gradient fade, the pill badge, the h1 with the secondary-color span, the descriptive sentence, and the two CTAs in that order.

#### Scenario: Hero has a fixed 870px height

- **WHEN** the hero is rendered at any viewport width
- **THEN** its computed height is 870px (not fluid `clamp()`), and the hero-clip polygon is applied to its bottom edge.

### Requirement: Header has a search bar and a Login/Register pill button

The site header SHALL contain, in addition to the existing wordmark and nav, a search bar (hidden below the `lg` breakpoint) using the Material Symbols `search` icon and an `<input type="text" placeholder="Search community...">`, and a `Login/Register` `<button>` with `class="bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg hover:opacity-90"`. Both elements SHALL be present at the `lg` breakpoint and above. Below the `lg` breakpoint, the search bar SHALL be hidden; the `Login/Register` button SHALL remain visible.

#### Scenario: Search bar is visible on desktop

- **WHEN** a visitor loads the homepage at a viewport ≥ 1024px (`lg`)
- **THEN** the header shows the search input with the `search` icon on the left, and the `Login/Register` pill button on the right.

#### Scenario: Search bar is hidden on mobile

- **WHEN** a visitor loads the homepage at a viewport < 1024px
- **THEN** the search input is not visible, and the `Login/Register` button remains visible.

### Requirement: Hero pattern is the Pucuk Rebung motif from Stitch

The `--hero-pattern` CSS custom property SHALL hold the Stitch batik-pattern data URI (Pucuk Rebung / Bamboo Shoot motif, stroke `#e9c46a`, stroke-widths 2/1.5/1, opacity 0.8/0.6/0.4/0.5, two circles at center and 40,70 / 60,70). The `.hero-pattern` utility class SHALL use this variable as a `background-image`, repeat-tiled at 100px × 100px. The class SHALL set `background-repeat: repeat` and `background-size: 100px 100px`.

#### Scenario: Pattern is visible in the hero

- **WHEN** the page is loaded
- **THEN** the hero section shows a subtle batik pattern at 7% opacity, tiled across the full section, in the primary-container golden color.

### Requirement: Hero clip is a polygon on the bottom edge

The `.hero-clip` utility class SHALL set `clip-path: polygon(0 0, 100% 0, 100% 90%, 0% 100%)`. The hero `<section>` SHALL apply this class, producing a slanted bottom edge that visually flows into the next section.

#### Scenario: Hero has a slanted bottom edge

- **WHEN** the hero section is rendered
- **THEN** its bottom-right corner is cut at 90% width × 0% height, and its bottom-left corner is cut at 0% width × 100% height, producing a diagonal edge between the two points.

### Requirement: Talam shadow is a soft golden drop shadow

The `.talam-shadow` utility class SHALL set `box-shadow: 0px 4px 20px rgba(233, 196, 106, 0.15)`. Event cards, the bento news tiles, the partnership-CTA metric card, and the partner-logo tiles SHALL apply this class.

#### Scenario: Talam shadow renders on event cards

- **WHEN** a visitor views an event card on the homepage
- **THEN** the card has a 20px-blur golden drop shadow at 15% opacity, with no shadow offset, on all four sides.

### Requirement: Talam gradient is a top-down cream-to-gold gradient

The `.talam-gradient` utility class SHALL set `background: linear-gradient(180deg, #FEFAE0 0%, #F5E386 100%)`. The class SHALL be available for any future section that wants the cream-to-gold fade, but no section in this change applies it (it is documented for completeness because the Stitch design uses it elsewhere).

#### Scenario: Talam gradient is a defined utility

- **WHEN** a developer applies `.talam-gradient` to any element
- **THEN** the element renders a vertical gradient from cream (`#FEFAE0`) at the top to soft gold (`#F5E386`) at the bottom.

### Requirement: Upcoming Community Gatherings is a 3-column event grid

The "Upcoming Community Gatherings" section SHALL render an `<h2>` "Upcoming Community Gatherings" with `font-headline-lg text-headline-lg text-primary`, a one-line subtitle, and a right-aligned "View All Events →" link using the Material Symbols `arrow_forward` icon. The events SHALL render in a 3-column responsive grid (`grid grid-cols-1 md:grid-cols-3 gap-gutter`) using the new Stitch-style `EventCard` component. The section SHALL be omitted entirely when no upcoming events exist.

#### Scenario: Three events render in a 3-column grid

- **WHEN** the dummy data has three upcoming events
- **THEN** the section renders a 3-column grid on viewports ≥ 768px, and a 1-column stack below that.

#### Scenario: View All Events link is present

- **WHEN** the section renders
- **THEN** a right-aligned "View All Events →" link is visible next to the section heading, regardless of the number of events.

#### Scenario: Section is omitted when no events are upcoming

- **WHEN** the dummy data has zero upcoming events
- **THEN** the section is omitted from the rendered HTML entirely.

### Requirement: Empower Your Business CTA section

The "Empower Your Business Through Community" section SHALL render a `rounded-3xl bg-primary-container` card containing (1) a decorative white/10 circle absolutely positioned in the top-right corner, (2) the h2 "Empower Your Business Through Community" in `text-on-primary-container`, (3) one descriptive paragraph, (4) two CTAs ("Become a Partner" filled `bg-on-primary-container text-white rounded-full`, "Sponsorship Kit" outline `bg-white/20 text-on-primary-container rounded-full border border-on-primary-container/30`), and (5) a `bg-white/40 backdrop-blur-md` "Community Impact" metric card listing three labeled numbers (New Members, Event Attendees, Partner Visibility).

#### Scenario: CTA renders with all elements

- **WHEN** a visitor scrolls to the Empower section
- **THEN** the page renders a gold rounded card with the h2, the paragraph, the two CTAs on the left, and the Impact metric card on the right (on desktop) or below (on mobile).

### Requirement: Trusted by Partners is a 4-logo grid with grayscale hover

The "Trusted by Local & Global Partners" section SHALL render an `<h2>` and a 4-logo grid (2 columns on mobile, 4 columns on desktop). Each logo tile SHALL be an `<img>` of one of the four placeholder partner logos at `/partners/logo-1.svg` through `/partners/logo-4.svg`, with `class="h-12 w-auto object-contain"`. The tile container SHALL use `grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer`. The four placeholder logos SHALL be committed to `static/partners/` as simple monochrome SVG wordmarks the operator can replace.

#### Scenario: Logos render in grayscale

- **WHEN** a visitor views the partners section at rest
- **THEN** each of the four logo tiles is rendered in grayscale at 40% opacity.

#### Scenario: Logo colorizes on hover

- **WHEN** a visitor hovers one of the four logo tiles
- **THEN** that tile transitions to full color at 100% opacity over 300ms, while the other three remain grayscale.

### Requirement: Footer is a 4-column layout with email input

The site footer SHALL render a 4-column grid (`grid grid-cols-1 md:grid-cols-4 gap-gutter`): (1) a brand column with the wordmark "PKUBersua", one tagline sentence, and three Material Symbols social-icon links (`public`, `alternate_email`, `share`); (2) a "The Community" nav column with at least three links; (3) a "Support & Partnership" nav column with at least three links; and (4) a "Stay Connected" column with one short paragraph and an email input + Join button (`<input type="email" placeholder="Your email">` + `<button>Join</button>` in a single `rounded-lg` container with `bg-surface-container border border-outline-variant`). The footer SHALL also render the `© 2026 PKUBersua` copyright line below the grid in `.label-meta`.

#### Scenario: Footer renders 4 columns on desktop

- **WHEN** a visitor loads the homepage at a viewport ≥ 768px
- **THEN** the footer renders brand + The Community + Support & Partnership + Stay Connected side by side.

#### Scenario: Email input is present

- **WHEN** the footer is rendered
- **THEN** the Stay Connected column shows a "Your email" `<input type="email">` next to a "Join" button in a single rounded container.

### Requirement: Material Symbols Outlined is loaded for the design's icon names

`src/app.html` SHALL include a Google Fonts request for `Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap` in addition to the Hanken Grotesk and Manrope requests. The icon names used in the homepage (`search`, `calendar_today`, `arrow_forward`, `trending_up`, `campaign`, `public`, `alternate_email`, `share`) SHALL resolve at runtime.

#### Scenario: Icons render at the correct size

- **WHEN** a Material Symbols `<span>` is rendered with `class="material-symbols-outlined"`
- **THEN** the icon glyph is loaded from the Google Fonts CSS and rendered at the size the surrounding text uses (default 24px via `font-size: inherit` or `text-3xl` for large icons).

### Requirement: New spacing and radius tokens are defined in `@theme`

`src/routes/layout.css` SHALL add, in addition to the existing tokens, the spacing tokens `--spacing-margin-mobile: 16px`, `--spacing-margin-desktop: 80px`, `--spacing-gutter: 24px`, `--spacing-xs: 4px`, `--spacing-sm: 12px`, `--spacing-base: 8px`, `--spacing-md: 24px`, `--spacing-lg: 40px`, `--spacing-xl: 64px`, and the border-radius tokens `--radius-card: 0.75rem` (12px) and `--radius-pill: 9999px` (already present, document the meaning). Tailwind v4 SHALL generate `p-margin-mobile`, `p-margin-desktop`, `gap-gutter`, `gap-xs/sm/base/md/lg/xl`, `rounded-card`, and `rounded-pill` utilities from these.

#### Scenario: Spacing tokens are usable as utilities

- **WHEN** a developer writes `class="p-margin-desktop gap-gutter rounded-card"`
- **THEN** Tailwind generates the corresponding CSS from the new tokens, and the rendered element has 80px padding, 24px gap, and 12px border-radius.
