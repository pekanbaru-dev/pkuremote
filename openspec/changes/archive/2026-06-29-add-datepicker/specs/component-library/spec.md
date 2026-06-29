## ADDED Requirements

### Requirement: DatePicker component is part of the component library

The component library SHALL include a `DatePicker` component at `src/lib/components/ui/datepicker/`, registered in the top-level barrel (`src/lib/components/ui/index.ts`) and exposing a `DatePicker` named export, a `DatePickerProps` type, and a `datePickerVariants` `tv({...})` config. The component SHALL be usable in single-date and date-range modes, accept `CalendarDate | CalendarDateRange` from `@internationalized/date`, and SHALL NOT introduce any new third-party dependency (it builds on `bits-ui` `DatePicker` + `Calendar` which are already in `package.json`).

#### Scenario: DatePicker is importable from the barrel

- **WHEN** a route imports `DatePicker` from `$lib/components/ui`
- **THEN** the import resolves and the component is bundled in the route's chunk.

#### Scenario: DatePicker is brand-token compliant

- **WHEN** the `DatePicker` is reviewed for brand consistency
- **THEN** every color class in its TV config and inline class lists maps to an `@theme` token (e.g., `bg-canvas`, `text-ink`, `border-hairline`, `text-destructive`); no raw Tailwind palette utilities (e.g., `bg-blue-500`) are used.
