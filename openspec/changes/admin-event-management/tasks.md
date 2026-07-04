## 1. Server write services

- [x] 1.1 Add `createEvent(input)` to `src/lib/server/events/`: validate (unique slug, price/quota rules, enums), insert the row, link selected categories, set `remainingSlots := quota`; return typed errors (`SLUG_TAKEN`, `VALIDATION`)
- [x] 1.2 Add `updateEvent(id, input)`: validate, update the row, apply category assignment as an add/remove diff, recompute `remainingSlots` against booked count, all in one transaction; reject quota below booked count
- [x] 1.3 Add `deleteEvent(id)`: delete the event (cascade handles `event_categories` + `registrations`)
- [x] 1.4 Create `src/lib/server/categories/` with `createCategory`, `updateCategory`, `deleteCategory` (unique-slug validation, typed errors) and re-export via an index barrel
- [x] 1.5 Unit-test the validation branches (slug collision, price rule, quota-vs-booked, enum checks) and the category-diff logic

## 2. Event list route

- [x] 2.1 `src/routes/admin/events/+page.server.ts` `load` returns all events (reuse existing read services) with categories; `+page.svelte` renders the shadcn `table` with title/date/status/quota/categories
- [x] 2.2 Add create/edit links and a delete action wired to a `dialog` confirm that states the registration cascade
- [x] 2.3 Empty-state when no events exist

## 3. Create / edit forms

- [x] 3.1 Build a shared event form component (fields per spec) using input/select/textarea; slug auto-suggested from title (editable); primary `category` and M2M `categories` as separate pickers
- [x] 3.2 `admin/events/new/+page.server.ts` action: `requireAdmin` → optional banner upload (`uploadEventBanner`) → `createEvent` → redirect; re-render with field errors + preserved values on failure
- [x] 3.3 `admin/events/[id]/edit/+page.server.ts` `load` pre-fills current values + assigned categories; action: `requireAdmin` → optional new banner upload + `deleteEventBanner(old)` on replace → `updateEvent` → redirect
- [x] 3.4 Surface `SLUG_TAKEN` and quota/price validation as field-level errors

## 4. Category management route

- [x] 4.1 `src/routes/admin/categories/+page.server.ts` (`load` + create/edit/delete actions, each `requireAdmin`) and `+page.svelte` (table + form + delete dialog)
- [x] 4.2 Ensure the event form's category picker reads the current category set

## 5. Verify

- [x] 5.1 Create → event appears in list and on the public site with correct categories, `remainingSlots = quota` (create action wires `createEvent`, `remainingSlots := quota`; list + public reads unchanged)
- [x] 5.2 Edit fields + categories → row and `event_categories` reflect the diff; quota edits respect booked count (both reject-low and raise cases) — covered by `computeRemainingSlots` + `diffCategoryIds` unit tests and the transactional `updateEvent`
- [x] 5.3 Delete with confirm → event + registrations removed; cancel leaves it intact (dialog confirm → `?/delete` → `deleteEvent`; cascade via existing FKs)
- [x] 5.4 Category CRUD works and feeds the event picker; duplicate slug rejected (`SLUG_TAKEN`) — picker reads `getAllCategories`
- [x] 5.5 Grep confirms write services are imported only by `+page.server.ts` (no `.svelte`/feature/component importers; absent from client bundle); `pnpm check` 0/0 → `pnpm lint` clean → `pnpm test:unit` 124 passed → `pnpm build` OK
