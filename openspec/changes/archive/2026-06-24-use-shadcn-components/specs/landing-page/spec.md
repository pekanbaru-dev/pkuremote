## MODIFIED Requirements

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

### Requirement: Header is sticky with wordmark and nav

The site header SHALL be `position: sticky; top: 0` with a 1px hairline bottom border. It SHALL contain the wordmark "PKU Remote" (Spectral 500) and a shadcn NavigationMenu with anchors to `#events`, `#announcements`, `#posts`. On viewports below 640px the nav SHALL collapse into a `<details>` disclosure; above 640px it SHALL display inline. The NavigationMenu's hover and focus states SHALL use the `--primary` accent, matching the previous hand-rolled nav treatment.

#### Scenario: Header stays visible while scrolling

- **WHEN** the visitor scrolls down the page
- **THEN** the header remains pinned to the top of the viewport with the hairline border dividing it from the content beneath.

#### Scenario: Keyboard focus on nav links

- **WHEN** a keyboard user tabs through the NavigationMenu
- **THEN** each link shows a visible focus ring in `--ring` (mapped to `--primary`).