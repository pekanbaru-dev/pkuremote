## Context

The `port-react-components` change shipped 32 Svelte 5 components under `src/lib/components/ui/`. Four sources were deferred, including `datepicker`, which the React source implemented with `react-date-picker` + `react-calendar` (no direct Svelte port). Feature work that needs date input (event scheduling, contribution dates, milestone tracking) currently rolls its own calendar popovers, fragmenting UX and accessibility.

`bits-ui` 2.18.1 already ships a `DatePicker` primitive that wraps a `Calendar` in a `Popover`, plus `DateField` for the input surface, all built on `@internationalized/date`. Both are already in `package.json`. The Svelte-side build is a composition problem: lay `bits-ui` over a brand-aligned trigger and surface, reusing the project's `cn` helper, `bits-ui` Calendar grid subcomponents, and the same `input` / `button` primitive conventions established by the other components in `src/lib/components/ui/`.

Stakeholders:

- The events feature (event scheduling) — first consumer.
- The contrib feature (contribution dates) — second consumer.
- The landing-page hero card (no date use yet, but date formatting for blog post dates is plausible).

## Goals / Non-Goals

**Goals:**

- A Svelte 5 `DatePicker` component under `src/lib/components/ui/datepicker/` that exposes single-date and date-range selection.
- The component accepts `CalendarDate | CalendarDateRange | undefined` from `@internationalized/date` (timezone-safe) and emits changes via an `onValueChange` callback.
- Locale-aware formatting via the `locale` prop (defaults to the user's runtime locale, falls back to `en-US`).
- Min/max date constraints, `isDateDisabled` predicate, and a `placeholder` for the empty state.
- Keyboard navigation (arrow keys, PageUp/PageDown for month, Home/End for week edges, Enter to select) is provided by `bits-ui` Calendar; we don't reimplement it.
- All visuals bound to the project's OKLCH tokens (`--color-canvas`, `--color-ink`, `--color-primary`, `--color-hairline`, `--color-destructive`); no new shade-scale tokens.
- A single-file component (no per-subcomponent file split) since the public API is a single named export; the per-sub complexity is owned by `bits-ui` internally.

**Non-Goals:**

- A time picker (out of scope; if needed later, the `bits-ui` `TimeField` primitive can be added in a follow-up change).
- A date-time picker (same as above; `bits-ui` has no combined primitive).
- A range-of-ranges or multi-month picker.
- Persisting user locale to a cookie/localStorage (handled at the app shell layer, not the component).
- Server-side rendering of the open calendar (the popover only renders in the browser; SSR is unaffected).

## Decisions

### D1. Build on `bits-ui` `DatePicker` + `Calendar`, not a custom grid

`bits-ui` 2.18.1 ships `DatePicker`, `DateField`, `Calendar`, `RangeCalendar`, `DateRangePicker`, plus the `Calendar` sub-components (`Calendar.Grid`, `Calendar.GridBody`, `Calendar.Day`, `Calendar.Header`, etc.) and `@internationalized/date` integration. The Calendar subcomponents are headless — we own the visual treatment by applying Tailwind classes via the project's `cn()` helper. Writing a custom grid (e.g., on top of `Popover` + a hand-rolled `CalendarDate` math loop) would re-implement keyboard nav, focus management, and locale-aware month labels that `bits-ui` already provides and tests. **Alternative considered**: hand-roll the grid with `@internationalized/date` only (used in `date-picker-style` from `@internationalized/date` docs). Rejected: re-implements ~300 lines of accessibility-critical code we don't need to own.

### D2. Value type: `DateValue` from `@internationalized/date`

`@internationalized/date`'s `DateValue` is the union `CalendarDate | CalendarDateTime | ZonedDateTime`. It's the right primitive for "the user picked July 11" — there's timezone-safe handling for date-only and date-time values. JS `Date` introduces timezone ambiguity. The component accepts and emits `DateValue | undefined`; consumers convert at the boundary (`cd.toDate(timeZone)` for a JS `Date`, or `cd.toZoned(dateTime, tz)` if they need a real instant). The component's `value` is the bits-ui-native `DateValue` shape, and the `fromDate(d: Date): CalendarDate` helper does the date-only conversion. **Alternative considered**: accept JS `Date` and convert internally. Rejected: forces the component to make timezone choices on the consumer's behalf; consumers lose precision (e.g., a user in Jakarta picking "July 11" gets a different `Date` than one in San Francisco).

### D3. Single-file component, no per-subcomponent file split

The component's public surface is a single named export (`DatePicker`). The internal `Root / Trigger / Input / Calendar` composition is owned by `bits-ui` and is an implementation detail. Splitting into `datepicker-trigger.svelte`, `datepicker-calendar.svelte`, etc. would mirror the dialog/dropdown split from `port-react-components` and create 7+ files for one component. **Alternative considered**: match the `dialog` / `dropdown` compound split. Rejected: those are user-facing composites (the consumer can write `<Dialog.Content>` etc.). The datepicker has no such user-facing composite; consumers don't compose sub-parts. **Future option**: split if a need arises (e.g., a "DatePickerRange" with shared internals).

### D4. Trigger: a styled `bits-ui` `DateField.Input`, not a `Button`

`bits-ui` ships a `DateField` primitive that renders an editable input with locale-aware segment formatting. The user can type a date directly (e.g., `7/11/2026`) and the calendar opens on focus or when the user clicks the trailing icon. This is the standard pattern for `bits-ui` `DatePicker`. **Alternative considered**: a click-to-open `Button` trigger with the selected date rendered inside (like `react-date-picker`). Rejected: loses the direct-typing affordance and requires an extra click to focus the input.

### D5. Single-date only; range is a separate component

`bits-ui` 2.18.1's `DatePicker` primitive accepts only `DateValue` (single). Range selection is a **separate primitive** — `DateRangePicker` — which accepts `DateRange = { start: DateValue; end: DateValue }`. The two primitives use different subcomponents (`Calendar` vs `RangeCalendar`, `DateField` vs `DateRangeField`) and different value bindings. Folding both into a single component would require runtime detection of the value type and conditionally rendering different bits-ui trees, which complicates the type surface and the test surface. **Decision**: this change ships `DatePicker` (single-date) only. A future `add-date-range-picker` change will ship the range variant as a separate `DateRangePicker` component. The two will share `date-helpers.ts` (`fromDate`, `toDate`) and the brand-token styling conventions. **Alternative considered**: single component with discriminated `value: DateValue | DateRange | undefined`. Rejected: the underlying primitives don't share a subcomponent tree, so a unified wrapper would either fork internally (one `<DatePicker>` or one `<DateRangePicker>` rendered) — at which point the consumer-facing API is two components anyway — or attempt to wrap both in a single `bits-ui` `Root` slot, which `bits-ui` does not support.

### D6. No CSS reset import; rely on `bits-ui`'s default styles

`react-date-picker` required `import "react-date-picker/dist/DatePicker.css"`. `bits-ui` Calendar is unstyled by default (we own the visual layer via Tailwind classes). **No CSS import needed** for the datepicker.

### D7. Use `tailwind-variants` (TV) for the trigger size / intent variants

The existing `src/lib/components/ui/` convention (button, input, textarea, etc.) is to define a `tv({...})` config in a `<script lang="ts" module>` block and export the resulting `<name>Variants` const. The datepicker trigger mirrors this: a TV config exposing `size` (`sm | default | lg`) and `intent` (`primary | destructive`) variants. **Alternative considered**: hardcoded classes. Rejected: breaks the variant API used by every other component in the library.

## Risks / Trade-offs

- **Risk**: `bits-ui` `DatePicker` value-binding is `Writable<CalendarDate | CalendarDateRange | undefined>` — using a discriminated union for the prop is fine, but consumers who pass a `Date` will hit a type error. → **Mitigation**: document the `CalendarDate` requirement in the component's JSDoc; provide a `fromDate` / `toDate` helper file at `src/lib/components/ui/datepicker/date-helpers.ts` for boundary conversion.
- **Risk**: SSR of the open popover content (`bits-ui` `Content` vs `ContentStatic`) — if the page is server-rendered with the popover open (shouldn't happen, but possible if a consumer sets `open={true}` on first render), the popover content might not portal correctly. → **Mitigation**: default to `ContentStatic` is not appropriate (it's static, no positioning); use the regular `Content` (which renders on demand, opens via Popper). Document `open` as a controlled prop, defaulting to `undefined` (uncontrolled).
- **Risk**: `@internationalized/date` adds bundle weight (~15kb gzipped) to client bundles. → **Mitigation**: it's a peer of `bits-ui` Calendar; the bundle already includes it transitively. No new top-level dep.
- **Risk**: the existing `input.svelte` accepts a `value: string`; consumers will want to pass a `CalendarDate`-formatted string back. → **Mitigation**: the datepicker doesn't use the `input` primitive; it uses `bits-ui` `DateField.Input` directly, bypassing the existing `input` prop shape.
- **Trade-off**: we don't expose a `formatDisplay` prop for custom date formatting (e.g., "11 Jul 2026" vs "07/11/2026"). The consumer can format the `CalendarDate` themselves with `Intl.DateTimeFormat` if they need a different display. The trigger always uses the locale's default `Intl.DateTimeFormat({ dateStyle: 'short' })`.

## Migration Plan

1. Create `src/lib/components/ui/datepicker/datepicker.svelte` (single file) composing `bits-ui` `DatePicker.Root`, `DatePicker.Trigger`, `DatePicker.Input`, `DatePicker.Calendar`, and the Calendar subcomponents.
2. Create `src/lib/components/ui/datepicker/date-helpers.ts` with `fromDate(d: Date): CalendarDate` and `toDate(cd: CalendarDate): Date` (timezone-naive round-trip in local time).
3. Create `src/lib/components/ui/datepicker/index.ts` barrel re-exporting `DatePicker`, `DatePickerProps`, `datePickerVariants`.
4. Add `DatePicker` + `datePickerVariants` + `DatePickerProps` to the top-level `src/lib/components/ui/index.ts` barrel.
5. Add a `datepicker.svelte.test.ts` smoke render test using `vitest-browser-svelte`.
6. Delete `tmp/components/datepicker/`.
7. Verify: `pnpm check` (0 errors), `pnpm test:unit -- --run` (29 tests pass — 28 + 1 new), `pnpm lint` (no new errors).

**Rollback**: revert the change. Since this is a new file, the rollback is `git rm` + revert of the barrel update.

## Open Questions

- **Should the datepicker support `placeholder` for individual segments** (e.g., "DD/MM/YYYY" vs the locale default)? `bits-ui` `DateField` accepts a `placeholder` prop, but the default is locale-aware. Decided: use the locale default; document the option for consumers who need a custom placeholder.
- **Range picker in a single calendar (start + end on the same grid) or two calendars**? `bits-ui` `DatePicker` does a single calendar for ranges. Decided: single calendar (standard, mobile-friendly).
- **Should the popover close on selection of a single date**? `bits-ui` default is to close; for ranges, it stays open until the second date is selected. We don't override.
- **Future**: should the datepicker integrate with the existing `currency-display` / `currency-input` (e.g., a "due date + amount" composite)? Out of scope; composite components live in `src/lib/components/` (feature folder) when needed.
