## ADDED Requirements

### Requirement: Semantic breakpoint tokens are defined in @theme

`src/routes/layout.css` SHALL define exactly three breakpoint tokens in the `@theme` block, using semantic device-tier names: `--breakpoint-mobile: 40rem` (640px), `--breakpoint-tablet: 48rem` (768px), and `--breakpoint-desktop: 64rem` (1024px). Tailwind v4 SHALL generate `mobile:`/`tablet:`/`desktop:` responsive variant prefixes from these tokens. The default Tailwind v4 breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) SHALL be removed by setting each `--breakpoint-*` to `initial` in the same `@theme` block, so that `sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixes are NOT generated. Project code SHALL use only `mobile:`/`tablet:`/`desktop:` for responsive variants.

#### Scenario: Semantic prefixes are generated

- **WHEN** a developer writes `tablet:grid-cols-3` in a class string
- **THEN** Tailwind generates a `@media (min-width: 48rem)` rule applying `grid-template-columns: repeat(3, minmax(0, 1fr))`.

#### Scenario: Default prefixes are not generated

- **WHEN** a developer writes `md:grid-cols-3` in a class string
- **THEN** Tailwind does NOT generate any matching CSS rule, because `--breakpoint-md` is set to `initial` and the `md:` variant does not exist.

## MODIFIED Requirements

### Requirement: Layout is responsive without breakpoint-specific markup

The page SHALL be mobile-first and use `clamp()` for container padding, fluid text sizes, and section vertical rhythm. The event listing collapses to a single column on viewports below 640px. Responsive layout beyond the fluid base SHALL use the semantic breakpoint prefixes (`mobile:`, `tablet:`, `desktop:`) defined in `@theme` — not the removed default prefixes (`sm:`, `md:`, `lg:`). No JavaScript-based breakpoint class toggling beyond the header `<details>` disclosure.

#### Scenario: Page renders at 360px viewport

- **WHEN** the page is rendered at a 360px viewport width
- **THEN** no horizontal overflow occurs, all text remains readable, and the event listing collapses to a single column.

#### Scenario: Page renders at 1280px viewport

- **WHEN** the page is rendered at a 1280px viewport width
- **THEN** the content container centers with a max-width of 72rem and the event listing reads with generous whitespace, not stretched edge-to-edge.
