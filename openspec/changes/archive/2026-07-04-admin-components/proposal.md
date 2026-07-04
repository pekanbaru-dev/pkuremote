## Why

The admin panel's management screens need UI building blocks the project doesn't have yet: a **data table** (event/registration lists), a **dialog** (delete/confirm prompts), and a **select** (status, category, and category-assignment pickers). Today `src/lib/components/ui/` has only button, card, empty-state, input, and sheet. Adding these three shadcn-svelte components as a dedicated change keeps the event-management change focused on domain logic instead of absorbing component installation.

## What Changes

- Install the shadcn-svelte **`table`**, **`dialog`**, and **`select`** components into `src/lib/components/ui/` via `pnpm dlx shadcn-svelte@latest add table dialog select --yes --overwrite` (using the existing `components.json`; init is not re-run).
- Audit the generated component source for default Tailwind breakpoints (`sm:` / `md:` / `lg:` / `xl:` / `2xl:`) and convert any occurrences to the project's semantic breakpoints (`mobile:` / `tablet:` / `desktop:`), since the defaults produce no CSS in this project.
- Verify the generated components resolve `$lib/utils.js` and the OKLCH theme tokens correctly and that `bits-ui` (their headless dependency) is present.
- Export the new components from the `src/lib/components/ui/index.ts` barrel consistent with the existing pattern.

## Capabilities

### New Capabilities

<!-- None. These are additions to the existing shadcn-components capability. -->

### Modified Capabilities

- `shadcn-components`: Adds three new "component is installed and configured" requirements — Table, Dialog, and Select — to the managed shadcn component set.

## Impact

- **Modified code**: `src/lib/components/ui/` (new `table/`, `dialog/`, `select/` folders), `src/lib/components/ui/index.ts` (barrel exports).
- **Dependencies**: `bits-ui` (already used by other shadcn components) backs `dialog` and `select`; confirm it's installed. No new top-level dependency expected beyond what shadcn pulls.
- **Consumed by**: `admin-event-management` (table for lists, dialog for delete confirms, select for status/category pickers) and later admin screens.
- **No database change.**
