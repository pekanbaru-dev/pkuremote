## MODIFIED Requirements

### Requirement: Header has a search bar and a Login/Register pill button

The site header SHALL contain, in addition to the existing wordmark and nav, a search bar (hidden below the `desktop` breakpoint) using the Material Symbols `search` icon and an `<input type="text" placeholder="Search community...">`, and a `Login/Register` `<button>` with `class="bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg hover:opacity-90"`. Both elements SHALL be present at the `desktop` breakpoint and above. Below the `desktop` breakpoint, the search bar SHALL be hidden; the `Login/Register` button SHALL remain visible.

#### Scenario: Search bar is visible on desktop

- **WHEN** a visitor loads the homepage at a viewport ≥ 1024px (`desktop`)
- **THEN** the header shows the search input with the `search` icon on the left, and the `Login/Register` pill button on the right.

#### Scenario: Search bar is hidden on mobile

- **WHEN** a visitor loads the homepage at a viewport < 1024px
- **THEN** the search input is not visible, and the `Login/Register` button remains visible.

### Requirement: Upcoming Community Gatherings is a 3-column event grid

The "Upcoming Community Gatherings" section SHALL render an `<h2>` "Upcoming Community Gatherings" with `font-headline-lg text-headline-lg text-primary`, a one-line subtitle, and a right-aligned "View All Events →" link using the Material Symbols `arrow_forward` icon. The events SHALL render in a 3-column responsive grid (`grid grid-cols-1 tablet:grid-cols-3 gap-gutter`) using the new Stitch-style `EventCard` component. The section SHALL be omitted entirely when no upcoming events exist.

#### Scenario: Three events render in a 3-column grid

- **WHEN** the dummy data has three upcoming events
- **THEN** the section renders a 3-column grid on viewports ≥ 768px, and a 1-column stack below that.

#### Scenario: View All Events link is present

- **WHEN** the section renders
- **THEN** a right-aligned "View All Events →" link is visible next to the section heading, regardless of the number of events.

#### Scenario: Section is omitted when no events are upcoming

- **WHEN** the dummy data has zero upcoming events
- **THEN** the section is omitted from the rendered HTML entirely.

### Requirement: Footer is a 4-column layout with email input

The site footer SHALL render a 4-column grid (`grid grid-cols-1 tablet:grid-cols-4 gap-gutter`): (1) a brand column with the wordmark "PKUBersua", one tagline sentence, and three Material Symbols social-icon links (`public`, `alternate_email`, `share`); (2) a "The Community" nav column with at least three links; (3) a "Support & Partnership" nav column with at least three links; and (4) a "Stay Connected" column with one short paragraph and an email input + Join button (`<input type="email" placeholder="Your email">` + `<button>Join</button>` in a single `rounded-lg` container with `bg-surface-container border border-outline-variant`). The footer SHALL also render the `© 2026 PKUBersua` copyright line below the grid in `.label-meta`.

#### Scenario: Footer renders 4 columns on desktop

- **WHEN** a visitor loads the homepage at a viewport ≥ 768px
- **THEN** the footer renders brand + The Community + Support & Partnership + Stay Connected side by side.

#### Scenario: Email input is present

- **WHEN** the footer is rendered
- **THEN** the "Stay Connected" column contains an `<input type="email" placeholder="Your email">` and a `<button>Join</button>` inside a `rounded-lg` container with `bg-surface-container border border-outline-variant`.
