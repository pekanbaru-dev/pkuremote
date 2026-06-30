## MODIFIED Requirements

### Requirement: Reusable component classes are defined

`src/routes/layout.css` SHALL define the reusable classes `.container-page` (max-width 72rem, fluid horizontal padding via `clamp()`), `.measure-prose` (max-width 70ch), `.label-meta` (small uppercase-free meta text using the label font and label size from the Stitch fontSize table), and `.link-quiet` (hairline underline transitioning to primary on hover). The `.btn-primary` class is REMOVED; its role is filled by the shadcn Button component (see the `shadcn-components` spec).

On the landing page, all interactive buttons and CTAs SHALL render via the shadcn `<Button>` component using the project variants defined in the `shadcn-components` spec (`login`, `hero-primary`, `hero-outline`, `view-all`, `become-partner`, `sponsorship-kit`, `join`) — no raw `<button>` elements SHALL remain in `src/routes/+page.svelte`. The bento grid card containers and the CTA stats panel SHALL render via the shadcn `<Card>` component using the `bento`, `bento-primary`, and `stats` variants — no card-like `<div>` containers with hand-rolled `bg-surface-container-lowest talam-shadow` class strings SHALL remain. The hero pill badge SHALL render via the shadcn `<Badge variant="pill">` component — no raw `<span>` pill SHALL remain. The header search input and the footer email input SHALL render via the shadcn `<Input>` component with a per-usage `class` override that defeats the stock input styling (`border-none bg-transparent rounded-none p-0 h-auto focus-visible:ring-0`).

The 1px section dividers, when rendered, SHALL use the shadcn Separator component. (The landing page currently uses background-color transitions between sections rather than explicit dividers, so Separator is not instantiated on the landing page in this change; it remains available.)

The header and footer navigation links SHALL remain raw `<a>` elements — the shadcn NavigationMenu component is explicitly NOT used on the landing page (per `AGENTS.md`, its `hover:bg-muted` background-fill treatment conflicts with the editorial nav aesthetic). This corrects the previous spec text that claimed NavigationMenu renders the header and footer navigation.

#### Scenario: All landing buttons use the shadcn Button component

- **WHEN** the landing page is rendered
- **THEN** every button instance (header Login/Register, hero Explore Events + Learn History, events View All, CTA Become a Partner + Sponsorship Kit, footer Join) renders as `<Button variant="...">` with the corresponding project variant, and no raw `<button>` element exists in `src/routes/+page.svelte`.

#### Scenario: Bento and stats containers use the shadcn Card component

- **WHEN** the landing page's blog bento grid and CTA stats panel are rendered
- **THEN** the 5 card-like containers render as `<Card variant="bento|bento-primary|stats">` with grid-placement and internal-layout classes passed via `class`, and no hand-rolled `bg-surface-container-lowest talam-shadow` `<div>` card container exists in `src/routes/+page.svelte`.

#### Scenario: Hero pill uses the shadcn Badge component

- **WHEN** the hero section's "Pekanbaru Heritage & Culture" pill is rendered
- **THEN** it renders as `<Badge variant="pill">`, not a raw `<span>`.

#### Scenario: Search and email inputs use the shadcn Input component

- **WHEN** the header search field and footer email field are rendered
- **THEN** they render as `<Input class="...">` with per-usage overrides that defeat the stock input border/background/ring, reproducing the pre-migration bare-input-in-custom-container layout.

#### Scenario: NavigationMenu is not used on the landing page

- **WHEN** the landing page's header and footer nav are inspected
- **THEN** they consist of raw `<a>` elements (not shadcn NavigationMenu), consistent with the `AGENTS.md` ban.

#### Scenario: Quiet link hover

- **WHEN** a `.link-quiet` element is hovered or receives focus
- **THEN** its underline border and text color transition to the primary accent color.

#### Scenario: Pixel-equivalence to pre-migration visual

- **WHEN** the post-migration landing page is compared visually to the pre-migration version
- **THEN** no visual difference is detectable — all colors, typography, spacing, radii, shadows, and hover/active states are identical, because the shadcn component variants reproduce the exact pre-migration Tailwind class strings.
