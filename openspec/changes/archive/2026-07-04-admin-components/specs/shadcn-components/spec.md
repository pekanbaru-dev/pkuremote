## ADDED Requirements

### Requirement: Table component is installed and configured

The shadcn-svelte **Table** component SHALL be installed under `src/lib/components/ui/table/` via `shadcn-svelte add` against the existing `components.json`, exported from the `ui` barrel, and free of default Tailwind breakpoints — any `sm:`/`md:`/`lg:`/`xl:`/`2xl:` in the generated source SHALL be converted to the semantic breakpoints (`mobile:`/`tablet:`/`desktop:`). On viewports narrower than its content, the table SHALL remain usable via a horizontally scrollable container rather than relying on a disabled default breakpoint.

#### Scenario: Table is importable from the ui barrel

- **WHEN** a route or component imports the Table parts from `$lib/components/ui`
- **THEN** the import resolves to the installed `ui/table/` component

#### Scenario: Table source uses no disabled breakpoints

- **WHEN** a reviewer greps `src/lib/components/ui/table/` for `sm:`/`md:`/`lg:`/`xl:`/`2xl:`
- **THEN** no matches appear (all responsive variants use `mobile:`/`tablet:`/`desktop:`)

### Requirement: Dialog component is installed and configured

The shadcn-svelte **Dialog** component SHALL be installed under `src/lib/components/ui/dialog/` via `shadcn-svelte add`, backed by `bits-ui`, exported from the `ui` barrel, resolving `$lib/utils.js` and the OKLCH theme tokens, and free of default Tailwind breakpoints (converted to the semantic set where present).

#### Scenario: Dialog is importable and opens

- **WHEN** a component imports Dialog from `$lib/components/ui` and triggers it
- **THEN** the dialog opens with focus trapped and can be dismissed via the close control or Escape

#### Scenario: Dialog source uses no disabled breakpoints

- **WHEN** a reviewer greps `src/lib/components/ui/dialog/` for default Tailwind breakpoints
- **THEN** no matches appear

### Requirement: Select component is installed and configured

The shadcn-svelte **Select** component SHALL be installed under `src/lib/components/ui/select/` via `shadcn-svelte add`, backed by `bits-ui`, exported from the `ui` barrel, resolving `$lib/utils.js` and the OKLCH theme tokens, and free of default Tailwind breakpoints (converted to the semantic set where present).

#### Scenario: Select is importable and selectable

- **WHEN** a component imports Select from `$lib/components/ui` and renders options
- **THEN** the select opens a listbox, a value can be chosen with keyboard and pointer, and the chosen value is reflected in the trigger

#### Scenario: Select source uses no disabled breakpoints

- **WHEN** a reviewer greps `src/lib/components/ui/select/` for default Tailwind breakpoints
- **THEN** no matches appear
