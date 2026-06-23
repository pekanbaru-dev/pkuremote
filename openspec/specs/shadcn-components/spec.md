# shadcn-components Specification

## Purpose

Defines how shadcn-svelte is initialized and configured in the project, how its CSS variables map to the OKLCH theme tokens, and which shadcn components (Button, Separator, NavigationMenu) are installed and used on the landing page.

## Requirements

### Requirement: shadcn-svelte is initialized with a components.json

The project SHALL contain a `components.json` at the repo root, produced by `shadcn-svelte init`, configured with the CSS path `src/routes/layout.css`, the lib alias `$lib`, the components alias `$lib/components`, the utils alias `$lib/utils`, the hooks alias `$lib/hooks`, and the ui alias `$lib/components/ui`. The base color SHALL be `neutral`.

#### Scenario: shadcn-svelte CLI reads the project config

- **WHEN** a shadcn-svelte CLI command (e.g. `shadcn-svelte add button`) is run in the project
- **THEN** it reads `components.json` and resolves all aliases and the CSS path without prompting.

### Requirement: shadcn CSS variables map to the OKLCH theme tokens

The shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--border`, `--muted`, `--muted-foreground`, `--ring`) SHALL be defined in `src/routes/layout.css` and each SHALL reference the corresponding OKLCH token from the `@theme` block via `var(--color-*)`, so the `@theme` tokens remain the single source of truth for color values.

#### Scenario: Changing a theme token updates shadcn components

- **WHEN** the `--color-primary` token in `@theme` is changed
- **THEN** every shadcn component that uses `--primary` reflects the new value without any edit to the component files.

#### Scenario: No duplicate color definitions

- **WHEN** the project is audited for color sources
- **THEN** each brand color appears exactly once as an OKLCH value in the `@theme` block, and the shadcn CSS variables reference those tokens by `var()` rather than redefining the OKLCH value.

### Requirement: Button component is installed and configured

The shadcn `button` component SHALL be installed under `$lib/components/ui/button/`. It SHALL expose a variant matching the previous `.btn-primary`: ochre (`--primary`) fill, canvas/white (`--primary-foreground`) text, pill radius, 0.75rem 1.5rem padding, hover darken to `--primary-hover`, active 1px dip, 0.18s transitions. No `ghost`, `outline`, `secondary`, or `destructive` variants SHALL be shipped in this change.

#### Scenario: Primary button renders with white text on ochre fill

- **WHEN** the shadcn Button (primary variant) is rendered
- **THEN** its background is the `--primary` (ochre) token, its text color is the `--primary-foreground` (canvas/white) token, and its radius is the pill value.

#### Scenario: Primary button hover darkens

- **WHEN** the shadcn Button (primary variant) is hovered
- **THEN** its background transitions to `--primary-hover` over 0.18s.

### Requirement: Separator component is installed

The shadcn `separator` component SHALL be installed under `$lib/components/ui/separator/`. It SHALL render a 1px horizontal line using the `--border` (hairline) color. It replaces the `border-t border-hairline` dividers between sections on the landing page.

#### Scenario: Separator renders a hairline

- **WHEN** the shadcn Separator is rendered with `orientation="horizontal"`
- **THEN** it draws a 1px line in the `--border` color, visually equivalent to the previous `border-t border-hairline` rule.

### Requirement: NavigationMenu component is installed

The shadcn `navigation-menu` component SHALL be installed under `$lib/components/ui/navigation-menu/`. It SHALL render the site nav (Events, Announcements, Posts, About) with hover and focus states using the `--primary` accent for the active/hover underline, matching the previous hand-rolled nav treatment.

#### Scenario: Nav link hover shows ochre underline

- **WHEN** a visitor hovers a NavigationMenu link
- **THEN** the link's underline and text color transition to `--primary` over 0.18s.

#### Scenario: Keyboard focus on nav links

- **WHEN** a keyboard user tabs through the NavigationMenu
- **THEN** each link shows a visible focus ring in `--ring` (mapped to `--primary`).

### Requirement: shadcn runtime dependencies are installed

The project SHALL have `tailwind-merge`, `clsx`, and `tailwind-variants` (and any per-component dependencies the installed primitives require) added to `package.json` via `pnpm`, as a result of the `shadcn-svelte add` commands.

#### Scenario: pnpm install resolves all shadcn deps

- **WHEN** `pnpm install` is run after the shadcn components are added
- **THEN** the install completes with no missing-dependency warnings and `pnpm check` passes.
