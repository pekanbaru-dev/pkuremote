## Why

The `port-react-components` change (archived 2026-06-28) deferred the `datepicker` component because the React source's `react-date-picker` + `react-calendar` dependencies had no direct Svelte equivalents. Features that need date input (event scheduling, contribution dates, milestone tracking) currently have to roll their own calendar popovers, which fragments UX. We need a brand-aligned, accessible Svelte 5 datepicker that uses the project's existing `bits-ui` primitives and `@internationalized/date` (already in `devDependencies`) so feature work can stop reinventing date inputs.

## What Changes

- Add a Svelte 5 `DatePicker` component at `src/lib/components/ui/datepicker/`, built on `bits-ui` `DatePicker` + `Calendar` primitives (no new third-party dependencies).
- Support single-date and date-range selection, configurable locale, minimum/maximum date constraints, disabled date predicate, and brand-token styling.
- Compose the existing `Button`, `Input` (or styled trigger), and `Popover` (via `bits-ui`) for a consistent visual surface.
- Delete the `tmp/components/datepicker/` source once the conversion is verified.

## Capabilities

### New Capabilities

- `datepicker`: The brand-aligned, accessible Svelte 5 datepicker component for both single-date and date-range inputs, supporting `CalendarDate` / `CalendarDateRange` values from `@internationalized/date`, locale formatting, date constraints, and keyboard navigation.

### Modified Capabilities

- `component-library`: extend the existing capability with a new requirement covering the datepicker's variant set (size, intent), its event surface (`onValueChange`), and its required `bits-ui` dependency mapping. No existing requirement is removed or rewritten.

## Impact

- **New code**: ~10 files under `src/lib/components/ui/datepicker/` (Root, Trigger, Input, Calendar, Popover-style wrapper, helpers, index, type defs, test).
- **Dependencies**: none added. `@internationalized/date` (already `devDependencies`) and `bits-ui` (already `dependencies`) cover the calendar and date math.
- **Removed**: `tmp/components/datepicker/` directory after migration.
- **Documentation**: brief README or JSDoc on the component covering `CalendarDate` vs `Date` trade-off (the component accepts `CalendarDate` from `@internationalized/date` for timezone-safe values; consumers convert from/to JS `Date` at the boundary).
- **Design system**: still bound by the "Quiet Bulletin" rules — no new shade-scale tokens, ochre accent usage remains bounded by the One Voice Rule.
