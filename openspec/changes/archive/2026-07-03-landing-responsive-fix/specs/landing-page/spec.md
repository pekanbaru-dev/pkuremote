## MODIFIED Requirements

### Requirement: Layout is responsive with mobile-first breakpoint overrides

The page SHALL be mobile-first and use `clamp()` for container padding, fluid text sizes, and section vertical rhythm. The event listing collapses to a single column below 640px. All responsive layout overrides — for side margin, hero height, section padding, font sizes, bento grid, and mobile navigation — SHALL use the semantic breakpoint prefixes (`mobile:`, `tablet:`, `desktop:`) defined in `@theme` — not the removed default prefixes (`sm:`, `md:`, `lg:`). The side-margins, hero, and section paddings SHALL follow the "mobile-first base + tablet/desktop override" pattern: base class applies at all viewports, and a `tablet:` or `desktop:` override raises the value at the larger breakpoint. JavaScript-based menu toggling is permitted ONLY for the mobile hamburger navigation (sheet/drawer open-state); no other JS-driven breakpoint toggling exists.

#### Scenario: Page renders at 360px viewport

- **WHEN** the page is rendered at a 360px viewport width
- **THEN** no horizontal overflow occurs, all text remains readable, and the event listing collapses to a single column. The side margins of each section SHALL be 16px (`px-margin-mobile`), not the desktop 80px.

#### Scenario: Page renders at 768px viewport (tablet)

- **WHEN** the page is rendered at a 768px viewport width
- **THEN** the side margins of each section SHALL be 80px (`tablet:px-margin-desktop`), the hero height SHALL be 870px, and the events grid SHALL be 3 columns.

#### Scenario: Page renders at 1280px viewport

- **WHEN** the page is rendered at a 1280px viewport width
- **THEN** the content container centers with a max-width of 72rem and the event listing reads with generous whitespace, not stretched edge-to-edge.

## ADDED Requirements

### Requirement: Side margin is mobile-first with tablet override

Every section on the landing page (`header`, hero, `#events`, `#blog`, `#partnership`, `#partners`, `footer`) SHALL render with `px-margin-mobile` (16px) as its base class and `tablet:px-margin-desktop` (80px) as its tablet-and-up override. No section SHALL use `px-margin-desktop` without the `px-margin-mobile` base — otherwise narrow viewports are crushed by the 80px margin.

#### Scenario: Section side margin scales with viewport

- **WHEN** a section is rendered on a 360px mobile viewport
- **THEN** the content has 16px horizontal padding. When the same section is rendered on a 1024px desktop viewport, it has 80px horizontal padding. The two values come from the same class string (`px-margin-mobile tablet:px-margin-desktop`), not from two different sections.

### Requirement: Mobile hamburger navigation opens a sheet drawer

The site header SHALL render a hamburger button (`<Button>` with `menu` Material Symbols icon) that is visible only below the `tablet` breakpoint (`tablet:hidden`) and absent at tablet+. The desktop nav links (Home, Events, Blog, Partnership) remain `hidden tablet:flex` (unchanged). Tapping the hamburger button SHALL open a shadcn `Sheet` (drawer) anchored to the right edge containing the same four nav links plus the Login/Register button, stacked vertically. The sheet SHALL trap focus, close on the Escape key, close when an anchor-link is tapped, and render an `aria-label="Menu navigasi"` attribute. A sheet backdrop `bg-ink/40` covers the page.

#### Scenario: Hamburger button appears on narrow viewports

- **WHEN** a visitor loads the homepage at a viewport < 768px
- **THEN** the header renders a hamburger `<Button>` with the `menu` Material Symbols icon; the desktop nav links are NOT visible.

#### Scenario: Hamburger button is hidden on tablet and wider

- **WHEN** a visitor loads the homepage at a viewport ≥ 768px
- **THEN** the hamburger button is NOT visible, and the desktop nav links render as the default navigation.

#### Scenario: Drawer opens and contains all nav links

- **WHEN** a mobile visitor taps the hamburger button
- **THEN** a sheet drawer slides in from the right edge with `aria-label="Menu navigasi"`, an `×` close button in the top-right, and five stacked actionable rows (Home, Events, Blog, Partnership, Login/Register). The background is covered by a `bg-ink/40` backdrop.

#### Scenario: Drawer closes on Escape or link tap

- **WHEN** the sheet is open and the visitor presses Escape OR taps any link row
- **THEN** the sheet closes and the backdrop is removed. Link taps additionally navigate to the target section/page.

### Requirement: Hero is fluid on mobile, 870px on tablet+

The hero section SHALL render with `h-auto min-h-[870px]` as its base (so on narrow viewports its height expands to contain the content) and `tablet:h-[870px]` as the tablet-and-up override (restoring the fixed 870px height from the Stitch design). The hero headline SHALL render at `text-headline-lg` (32px) base and override to `tablet:text-headline-xl` (48px) at tablet+. The hero body paragraph SHALL render at `font-body-md` base and `tablet:font-body-lg` at tablet+.

#### Scenario: Hero resizes fluidly below tablet

- **WHEN** a visitor loads the homepage at a 360px viewport
- **THEN** the hero height is determined by its content (not a fixed 870px), its headline is 32px, and no headline text overflows or truncates.

#### Scenario: Hero is 870px on tablet and wider

- **WHEN** a visitor loads the homepage at a 768px+ viewport
- **THEN** the hero height is fixed at 870px and the headline scales to 48px, matching the Stitch design.

### Requirement: Section headings and internal paddings scale at tablet

Section h2 headings ("Upcoming Community Gatherings", "Latest News & Stories", "Empower Your Business Through Community", "Trusted by Local & Global Partners") SHALL render at `text-headline-md` (24px) base and override to `tablet:text-headline-lg` (32px) at tablet+. Section vertical rhythm SHALL render at `py-md mb-md` base and override to `tablet:py-xl tablet:mb-xl` at tablet+. The Empower CTA section SHALL render at `p-md` base and override to `tablet:p-xl` at tablet+.

#### Scenario: Section heading on mobile

- **WHEN** a mobile viewport (< 768px) renders an h2 section heading
- **THEN** the heading is 24px (`text-headline-md`), not the desktop 32px.

#### Scenario: Section heading on tablet+

- **WHEN** a tablet or desktop viewport (≥ 768px) renders an h2 section heading
- **THEN** the heading is 32px (`tablet:text-headline-lg`), matching the Stitch design.

#### Scenario: CTA card padding on mobile

- **WHEN** the Empower CTA card is rendered on a 360px mobile viewport
- **THEN** its internal padding is `p-md` (24px), reduced from the desktop `p-xl` (64px), so content does not overflow horizontally.

### Requirement: Bento blog grid stacks cleanly on mobile

The "Latest News & Stories" bento grid SHALL render as `grid grid-cols-1 h-auto` base (`tablet:grid-cols-4 grid-rows-2 tablet:h-[600px]`). Each bento `<Card>` SHALL have a fluid mobile height (no fixed `h-[600px]` bleed through) and override to `tablet:col-span-*` placements on tablet+. The hero bento card and the "Local Guide" card's internal `flex-row gap-md` layout SHALL retain their horizontal arrangement on mobile (since they are wide cards); the narrow sponsorship + volunteer cards SHALL stack vertically on mobile.

#### Scenario: Bento tiles stack as a column below tablet

- **WHEN** a mobile visitor (< 768px) scrolls to the blog section
- **THEN** the 4 tiles render as a vertical column with `gap-gutter` spacing, each tile sizing to its content height.

#### Scenario: Bento tiles form a 4-col mosaic on tablet+

- **WHEN** a tablet visitor (≥ 768px) scrolls to the blog section
- **THEN** the tiles form the original 4-column × 2-row mosaic with the hero card spanning 2×2, matching the Stitch design.
