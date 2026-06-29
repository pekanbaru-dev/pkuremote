## 1. DatePicker component scaffolding

- [x] 1.1 Create `src/lib/components/ui/datepicker/datepicker.svelte` with a `<script lang="ts" module>` block exporting `datePickerVariants = tv({...})` (size: sm | default | lg; intent: primary | destructive) and a `DatePickerProps` type extending `bits-ui` `DatePicker.RootProps` (i.e. `DateValue | undefined` for `value`, `OnChangeFn<DateValue | undefined>` for `onValueChange`, plus `locale`, `minValue`, `maxValue`, `isDateDisabled`, `placeholder` as the public API; range is explicitly NOT in this change).
- [x] 1.2 Add the component's instance `<script lang="ts">` block composing `bits-ui` `DatePicker.Root`, `DatePicker.Input`, `DatePicker.Content`, `DatePicker.Calendar` (the popover wrapping is provided by `DatePicker.Content`, no separate `Popover` is needed), and the `Calendar` subcomponents (`Calendar.Header`, `Calendar.Grid`, `Calendar.GridBody`, `Calendar.GridRow`, `Calendar.HeadCell`, `Calendar.Day`, `Calendar.PrevButton`, `Calendar.NextButton`, `Calendar.Heading`). (`DatePicker.Trigger` is not used — the trigger surface is the `DateField.Input` segment-group inside the `DatePicker.Root`.)
- [x] 1.3 Apply brand-token styling to every element: `bg-canvas`, `text-ink`, `border-hairline`, `text-primary` for selected day, `text-destructive` for invalid state. The trigger uses `border-hairline bg-canvas` with `focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30`. The calendar header uses `border-hairline`. The selected day uses `bg-primary text-primary-foreground`. The disabled day uses `text-muted-foreground opacity-50`.
- [x] 1.4 Create `src/lib/components/ui/datepicker/date-helpers.ts` exporting `fromDate(d: Date): CalendarDate` (reads year/month/day in local time so that "user picks July 11" round-trips without shifting days). The `toDate(cd: CalendarDate): Date` helper is intentionally NOT exported here — consumers should use `cd.toDate(timeZone)` for the canonical `bits-ui`/`@internationalized/date` flow, which takes a timezone. Keeping the helpers file minimal (one function) avoids re-exporting thin wrappers.
- [x] 1.5 Create `src/lib/components/ui/datepicker/index.ts` barrel re-exporting `Root as DatePicker`, `DatePickerProps`, `datePickerVariants`, `fromDate`.

## 2. Barrel integration

- [x] 2.1 Update `src/lib/components/ui/index.ts` to add `export { DatePicker, datePickerVariants, fromDate, type DatePickerProps } from './datepicker/index.js';` (matching the existing `format X, XVariants, type XProps` pattern).

## 3. Smoke test

- [x] 3.1 Create `src/lib/components/ui/datepicker/datepicker.svelte.test.ts` with at least two scenarios: (a) renders the locale-default placeholder when `value` is `undefined`; (b) renders a single-date trigger when `value={fromDate(new Date(2026, 6, 11))}`. Use `vitest-browser-svelte`'s `render` and `page.getByRole('group', { name: 'Start date' })` to assert the trigger's presence. (Note: bits-ui's `DateField.Input` renders as `role="group"`, not a button — the test queries that role.)

## 4. Verify and clean up

- [x] 4.1 Run `pnpm check` and confirm 0 errors and 0 warnings. (Done — 0/0.)
- [x] 4.2 Run `pnpm test:unit -- --run` and confirm 30 tests pass (28 existing + 2 new in `datepicker.svelte.test.ts`).
- [x] 4.3 Run `pnpm lint` and confirm the new files don't introduce new errors (the project's 1 pre-existing error in `src/lib/server/auth/oauth-callback.test.ts` is acceptable).
- [x] 4.4 Delete `tmp/components/datepicker/`.
- [x] 4.5 Confirm `tmp/components/` still contains the three other deferred sources (`map`, `select`, `text-editor`); do not touch them.
- [x] 4.6 (Manual, post-archive) Visually verify the datepicker at `pnpm dev` by adding a temporary `/dev/datepicker` route, picking a date, and checking that the calendar grid, locale formatting, and keyboard navigation work as expected. Remove the temporary route after verification. (DEFERRED to user.)
