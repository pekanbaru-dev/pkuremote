## MODIFIED Requirements

### Requirement: The sidebar navigation lists admin sections with an active-menu indicator and a collapse-to-icon-only mode

The admin shell SHALL render a sidebar navigation listing the admin sections (Dashboard, Events, Kategori, Artikel, Pengaturan), each as a link with a label and an icon. The navigation SHALL indicate the active section: an item SHALL be marked active when the current path equals its target path or begins with its target path followed by `/`. The active item SHALL receive a visually distinct treatment (accent fill or bold label) that respects the design system's accent-restraint rule; inactive items SHALL render as quiet links.

On desktop, the sidebar SHALL support a collapsed **icon-only** state: when collapsed, the sidebar narrows (icon-only) and only icons are shown (labels hidden, with a tooltip revealing the label on hover); when expanded, the sidebar shows full width with labels. The collapsed state SHALL be toggled by a burger-menu control in the top bar and SHALL persist across navigations within the admin area.

#### Scenario: The current section is highlighted

- **WHEN** an administrator is on `/admin/events`
- **THEN** the "Events" nav item is rendered in its active treatment and the other items are rendered as inactive quiet links

#### Scenario: A nested route keeps its parent section active

- **WHEN** an administrator is on `/admin/events/new` (a child of the Events section)
- **THEN** the "Events" nav item is still marked active (prefix match)

#### Scenario: The nav item list is the single source for desktop and mobile

- **WHEN** the shell renders the sidebar on desktop and the mobile drawer
- **THEN** both render the same set of nav items from a single definition

#### Scenario: Desktop sidebar collapses to icon-only via the burger menu

- **WHEN** an administrator toggles the burger-menu control on desktop
- **THEN** the sidebar narrows to icon-only (labels hidden, tooltips shown on hover); toggling again returns it to full width with labels

#### Scenario: The collapsed state persists across admin navigations

- **WHEN** an administrator collapses the sidebar and navigates to another admin page
- **THEN** the sidebar remains collapsed on the new page

### Requirement: The shell is responsive across desktop and mobile

The admin shell SHALL show a persistent sidebar at the `desktop:` breakpoint and above. Below `desktop:`, the sidebar SHALL be hidden and a hamburger toggle in the top bar SHALL open the navigation in a slide-over `sheet` (the existing shadcn `sheet` component). Selecting a nav item in the mobile sheet SHALL navigate and close the sheet. Only the semantic breakpoint variants (`mobile:` / `tablet:` / `desktop:`) SHALL be used; the default Tailwind breakpoints SHALL NOT appear.

On desktop, the hamburger/burger control SHALL toggle the sidebar's collapsed (icon-only) state rather than opening the mobile sheet; the mobile sheet SHALL only appear below the `desktop:` breakpoint.

#### Scenario: Desktop shows a persistent sidebar

- **WHEN** the viewport is at or above the `desktop:` breakpoint
- **THEN** the sidebar is rendered as a persistent left column; the burger control toggles its collapsed/expanded state and does not open the mobile sheet

#### Scenario: Mobile shows a hamburger that opens the sheet

- **WHEN** the viewport is below the `desktop:` breakpoint and the administrator taps the hamburger toggle
- **THEN** the navigation opens in a slide-over sheet containing the nav items; tapping an item navigates and closes the sheet
