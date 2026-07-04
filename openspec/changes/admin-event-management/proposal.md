## Why

Issue #20's core feature is Event Management. Today events, categories, and their M2M links only enter the database via SQL/seed — there is no way to create, edit, or delete an event from the app, and no way to manage the categories events are tagged with. This change adds admin CRUD for both, so an administrator can run the event lifecycle end-to-end from `/admin`.

## What Changes

- **Event list** at `/admin/events`: a table of all events (title, date, status, quota/remaining, categories) with actions to create, edit, and delete.
- **Event create/edit** forms (`/admin/events/new`, `/admin/events/[id]/edit`) covering every editable field: title, slug (auto-suggested from title, editable, uniqueness-validated), starts/ends, location, excerpt, markdown body, banner (uploaded via `admin-media-upload`), status, quota, priceNormal/pricePromo, primary `category` enum, `registrationClosesAt`, and the M2M `categories` assignment.
- **Delete** via a confirmation dialog; deletion cascades to `event_categories` and `registrations` per the existing FK `ON DELETE CASCADE`.
- **Category management** at `/admin/categories`: list, create, edit, delete categories (name + slug), used to populate the event category picker.
- **Server-only write services**: extend `src/lib/server/events/` with `createEvent`, `updateEvent`, `deleteEvent`, and category assignment; add `src/lib/server/categories/` with category CRUD. Every service is invoked only from admin-gated actions.
- Server-side validation mirrors the DB constraints (unique slug, `pricePromo < priceNormal`, `remainingSlots ≤ quota`, positive quota, valid status/category enums); on create, `remainingSlots` initializes to `quota`.

## Capabilities

### New Capabilities
- `admin-event-management`: Admin CRUD for events (list/create/edit/delete, banner upload, category assignment) and categories (CRUD), the server-only write services behind them, and the validation rules enforced on write.

### Modified Capabilities
<!-- None. The public `events` read capability is unchanged; this adds admin write paths that live in server services and admin routes. -->

## Impact

- **New routes**: `src/routes/admin/events/` (`+page` list, `new/`, `[id]/edit/`), `src/routes/admin/categories/`, each with `+page.server.ts` actions guarded by `requireAdmin`.
- **New/extended server code**: `src/lib/server/events/` (write functions added alongside existing read functions), `src/lib/server/categories/` (new).
- **Depends on**: `add-admin-access-gate` (`requireAdmin`), `admin-shell` (renders inside it), `admin-components` (table/dialog/select), `admin-media-upload` (banner).
- **Reuses**: existing `events`, `categories`, `event_categories` tables and the `Event` type. **No schema change.**
- **Cascade behavior**: deleting an event removes its `event_categories` and `registrations` rows (existing FKs); the delete confirmation dialog surfaces this consequence.
