# datepicker Specification

## Purpose

TBD - created by archiving change add-datepicker. Update Purpose after archive.

## Requirements

### Requirement: DatePicker accepts a `DateValue`

The `DatePicker` SHALL accept a `value` prop of type `DateValue` from `@internationalized/date` (where `DateValue = CalendarDate | CalendarDateTime | ZonedDateTime`). The component SHALL render the empty state when `value` is `undefined` and the formatted value when `value` is a `DateValue`. The component SHALL NOT internally convert a JS `Date` to a `DateValue`; the consumer is responsible for boundary conversion using the `fromDate` helper. Range selection is out of scope for this change (use a future `DateRangePicker` component, not this one).

#### Scenario: Single date selection

- **WHEN** the consumer passes `value={new CalendarDate(2026, 7, 11)}` and the user opens the popover
- **THEN** the calendar highlights July 11, 2026 and the trigger displays it in the locale's short format

#### Scenario: DateTime selection

- **WHEN** the consumer passes `value={new CalendarDateTime(2026, 7, 11, 14, 30)}` and the user opens the popover
- **THEN** the calendar highlights July 11, 2026, the trigger displays the date and time in the locale's short format, and the time segments are editable in the input

#### Scenario: Empty value

- **WHEN** `value` is `undefined`
- **THEN** the trigger displays the locale's default placeholder and no day is highlighted

### Requirement: DatePicker emits a typed `onValueChange` callback

The `DatePicker` SHALL emit value changes via an `onValueChange` callback. The callback SHALL receive a `DateValue | undefined` matching the same shape as the `value` prop (so the consumer can react to the picked date and convert it back to a JS `Date` if needed via `toDate(value.toDate(timeZone))` or a `CalendarDateTime`-aware conversion).

#### Scenario: Date pick

- **WHEN** the user clicks a day in the calendar
- **THEN** `onValueChange` is called with the picked `DateValue` and the popover closes (subject to `closeOnDateSelect`)

### Requirement: DatePicker supports locale, min, max, and disabled-date constraints

The `DatePicker` SHALL accept a `locale` prop (BCP-47 string, defaulting to the runtime locale, falling back to `'en-US'`), a `minValue` prop (`DateValue | undefined`), a `maxValue` prop (`DateValue | undefined`), and an `isDateDisabled` predicate (`(date: DateValue) => boolean`). Days outside `[minValue, maxValue]` or where `isDateDisabled` returns `true` SHALL be unselectable in the calendar. The trigger SHALL format the displayed date(s) using `Intl.DateTimeFormat` in the resolved locale.

#### Scenario: Locale formatting

- **WHEN** `locale="id-ID"` and the value is `new CalendarDate(2026, 7, 11)`
- **THEN** the trigger displays `11/07/26`

#### Scenario: Min constraint

- **WHEN** `minValue={new CalendarDate(2026, 7, 1)}` and the user opens the calendar
- **THEN** days before July 1, 2026 are visually disabled and unclickable

#### Scenario: Custom disabled predicate

- **WHEN** `isDateDisabled={(d) => d.day === 13}` and the user opens the calendar
- **THEN** all 13th days of every month are visually disabled and unclickable

### Requirement: DatePicker is accessible and keyboard-navigable

The `DatePicker` SHALL be navigable entirely by keyboard: Tab to focus the trigger, arrow keys to move the focused day, PageUp/PageDown to change month, Shift+PageUp/PageDown to change year, Home/End to move to the start/end of the week, Enter/Space to select. The popover SHALL close on Escape. The trigger SHALL have an `aria-label` derived from the resolved locale (e.g., "Pick a date" for `en-US`).

#### Scenario: Keyboard selection

- **WHEN** the trigger is focused and the user types a date directly into the input
- **THEN** the typed value is parsed and emitted via `onValueChange` (and a parse error is shown inline if the input is invalid)

#### Scenario: Escape closes the popover

- **WHEN** the popover is open and the user presses Escape
- **THEN** the popover closes, focus returns to the trigger, and the value is unchanged

### Requirement: DatePicker uses brand tokens and has size/intent variants

The `DatePicker` SHALL style the trigger using the project's OKLCH tokens (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-hairline`, `--color-destructive`). The component SHALL expose a `size` variant (`sm | default | lg`) and an `intent` variant (`primary | destructive`) via a `datePickerVariants` `tv({...})` config exported from the component file, matching the convention used by `button`, `input`, `textarea`, and other primitives in the library.

#### Scenario: Size variant

- **WHEN** `size="lg"`
- **THEN** the trigger height is `h-11` with `text-[1rem]`

#### Scenario: Destructive intent

- **WHEN** `intent="destructive"`
- **THEN** invalid state shows `border-destructive` and `ring-destructive/30`, matching the existing `input` destructive styling

### Requirement: DatePicker helpers convert between JS `Date` and `CalendarDate`

The component directory SHALL export a `fromDate(d: Date): CalendarDate` helper. `fromDate` SHALL read year/month/day in the runtime's local timezone so that "the user picked July 11" round-trips without shifting days. (`CalendarDateTime` and `ZonedDateTime` are constructed by the consumer from the `Date` directly via the `@internationalized/date` API, since the date-only `fromDate` helper intentionally does not pick a time or timezone.)

#### Scenario: Round-trip a date

- **WHEN** the consumer calls `fromDate(new Date(2026, 6, 11))` and uses that value as the `value` prop
- **THEN** the trigger displays `7/11/2026` (or the locale's equivalent) and no day shift occurs

### Requirement: DatePicker re-exports through the top-level component barrel

The `DatePicker` SHALL be re-exported from `src/lib/components/ui/index.ts` alongside the other components. Consumers SHOULD be able to `import { DatePicker, type DatePickerProps, fromDate } from '$lib/components/ui';` without a deeper path.

#### Scenario: Importing from the barrel

- **WHEN** a route imports `DatePicker` from `$lib/components/ui`
- **THEN** the import resolves and the component is tree-shaken if unused
