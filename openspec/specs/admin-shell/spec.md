# admin-shell Specification

## Purpose
TBD - created by archiving change admin-shell. Update Purpose after archive.
## Requirements
### Requirement: The `/admin` route group renders inside an admin shell layout

The system SHALL provide `src/routes/admin/+layout.svelte` that renders every `/admin/*` route inside an admin shell composed of a sidebar navigation, a top bar, and a content region. The routed page SHALL render in the content region via `{@render children()}`. The shell components SHALL live in the admin feature slice `src/lib/features/admin/` and be consumed through its `index.ts` barrel (no deep imports).

#### Scenario: An admin page renders within the shell

- **WHEN** an administrator navigates to any `/admin/*` route
- **THEN** the page content renders inside the shell's content region, with the sidebar navigation and top bar present around it

#### Scenario: The shell is consumed through the feature barrel

- **WHEN** `src/routes/admin/+layout.svelte` imports the shell component
- **THEN** it imports from `$lib/features/admin` (the barrel), not from a nested `components/` path

### Requirement: The sidebar navigation lists admin sections with an active-menu indicator

The admin shell SHALL render a sidebar navigation listing the admin sections (initially **Dashboard** targeting `/admin` and **Events** targeting `/admin/events`), each as a link with a label and an icon. The navigation SHALL indicate the active section: an item SHALL be marked active when the current path equals its target path or begins with its target path followed by `/`. The active item SHALL receive a visually distinct treatment (accent fill or bold label) that respects the design system's accent-restraint rule; inactive items SHALL render as quiet links.

#### Scenario: The current section is highlighted

- **WHEN** an administrator is on `/admin/events`
- **THEN** the "Events" nav item is rendered in its active treatment and the other items are rendered as inactive quiet links

#### Scenario: A nested route keeps its parent section active

- **WHEN** an administrator is on `/admin/events/new` (a child of the Events section)
- **THEN** the "Events" nav item is still marked active (prefix match)

#### Scenario: The nav item list is the single source for desktop and mobile

- **WHEN** the shell renders the sidebar on desktop and the mobile drawer
- **THEN** both render the same set of nav items from a single definition

### Requirement: The shell is responsive across desktop and mobile

The admin shell SHALL show a persistent sidebar at the `desktop:` breakpoint and above. Below `desktop:`, the sidebar SHALL be hidden and a hamburger toggle in the top bar SHALL open the navigation in a slide-over `sheet` (the existing shadcn `sheet` component). Selecting a nav item in the mobile sheet SHALL navigate and close the sheet. Only the semantic breakpoint variants (`mobile:` / `tablet:` / `desktop:`) SHALL be used; the default Tailwind breakpoints SHALL NOT appear.

#### Scenario: Desktop shows a persistent sidebar

- **WHEN** the viewport is at or above the `desktop:` breakpoint
- **THEN** the sidebar is rendered as a persistent left column and no hamburger toggle is shown

#### Scenario: Mobile shows a hamburger that opens the sheet

- **WHEN** the viewport is below the `desktop:` breakpoint and the administrator taps the hamburger toggle
- **THEN** the navigation opens in a slide-over sheet containing the nav items; tapping an item navigates and closes the sheet

### Requirement: The top bar shows the admin identity and a sign-out action

The admin shell top bar SHALL display the signed-in administrator's identity (display name and/or avatar from the existing session/profile) and a sign-out control. The sign-out control SHALL reuse the existing sign-out form action; submitting it SHALL clear the session and redirect out of the admin area.

#### Scenario: The top bar shows who is signed in

- **WHEN** an administrator views any admin page
- **THEN** the top bar displays their display name and/or avatar

#### Scenario: The admin signs out from the shell

- **WHEN** the administrator activates the sign-out control in the top bar
- **THEN** the existing sign-out action runs, the session is cleared, and the browser is redirected to `/`

