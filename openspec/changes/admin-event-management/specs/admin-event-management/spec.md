## ADDED Requirements

### Requirement: The admin event list shows all events with management actions

The system SHALL provide `/admin/events` rendering a table of all events (upcoming and past) with, per row: title, start date/time, status, quota/remaining slots, and assigned categories. The table SHALL provide actions to create a new event, edit an existing event, and delete an event. The route SHALL be admin-gated (inherits the `/admin` gate) and render inside the admin shell.

#### Scenario: An admin views the event list

- **WHEN** an administrator opens `/admin/events`
- **THEN** the page renders a table of all events with title, date, status, quota/remaining, and categories, plus create/edit/delete actions

#### Scenario: The list is empty

- **WHEN** an administrator opens `/admin/events` and no events exist
- **THEN** the page renders an empty state with a prompt to create the first event

### Requirement: An admin can create an event

The system SHALL provide an event create form (`/admin/events/new`) collecting: title, slug (auto-suggested from the title, editable), starts-at, ends-at (optional), location, excerpt, markdown body, banner image (uploaded), status, quota (optional), priceNormal (optional), pricePromo (optional), primary `category` (optional enum), `registrationClosesAt` (optional), and M2M `categories`. On submit, an admin-gated action SHALL validate the input and call the server-only `createEvent` service, which inserts the event row, links the selected categories, and initializes `remainingSlots` to `quota` (or null when quota is null). On success the admin is redirected to the event list (or the new event's edit page).

#### Scenario: A valid event is created

- **WHEN** an administrator submits the create form with valid fields for a unique slug
- **THEN** a new event row is inserted, its selected categories are linked in `event_categories`, `remainingSlots` equals `quota`, and the admin is redirected to the event list

#### Scenario: Creation with a duplicate slug is rejected

- **WHEN** an administrator submits the create form with a slug that already exists
- **THEN** the action returns a typed `SLUG_TAKEN` failure, the form re-renders with a field-level error and the previously-entered values preserved, and no row is inserted

### Requirement: An admin can edit an event

The system SHALL provide an event edit form (`/admin/events/[id]/edit`) pre-filled with the event's current values, including its assigned categories. On submit, an admin-gated action SHALL validate and call `updateEvent`, which updates the row and applies the category assignment as a diff (add newly selected, remove deselected) atomically. Changing `quota` SHALL keep the booking invariant intact: the new `quota` MUST NOT be below the already-booked count (`quota − remainingSlots`), and `remainingSlots` SHALL be recomputed so it never exceeds the new quota nor drops below zero.

#### Scenario: An admin edits event fields and categories

- **WHEN** an administrator changes the title, body, and category assignment and submits
- **THEN** the event row is updated and `event_categories` reflects exactly the selected categories (added/removed as needed), in a single transaction

#### Scenario: Lowering quota below the booked count is rejected

- **WHEN** an event has `quota = 50` and `remainingSlots = 10` (40 booked) and an administrator submits `quota = 30`
- **THEN** the action returns a typed validation failure, the row is not updated, and the form re-renders with an explanatory error

#### Scenario: Raising quota increases remaining slots consistently

- **WHEN** an event has `quota = 50` and `remainingSlots = 10` and an administrator submits `quota = 60`
- **THEN** `remainingSlots` becomes 20 (booked count 40 preserved) and the row is updated

### Requirement: An admin can delete an event with confirmation

The system SHALL let an administrator delete an event from the list via a confirmation dialog that states deletion also removes the event's registrations (via the existing `ON DELETE CASCADE`). On confirm, an admin-gated action SHALL call `deleteEvent`, removing the event and cascading to `event_categories` and `registrations`.

#### Scenario: An admin confirms deletion

- **WHEN** an administrator clicks delete on an event and confirms in the dialog
- **THEN** the event row is deleted, its `event_categories` and `registrations` rows are removed by cascade, and the list refreshes without the event

#### Scenario: An admin cancels deletion

- **WHEN** an administrator opens the delete dialog and cancels
- **THEN** no deletion occurs and the event remains in the list

### Requirement: An admin can manage categories

The system SHALL provide `/admin/categories` to list, create, edit, and delete categories (name + slug). An admin-gated action SHALL call the server-only category CRUD service; category slugs SHALL be unique (a duplicate returns a typed error). The category set SHALL populate the event form's category picker.

#### Scenario: An admin creates a category

- **WHEN** an administrator submits a new category with a unique name and slug
- **THEN** a `categories` row is inserted and the category appears in the event form's picker

#### Scenario: An admin deletes a category in use

- **WHEN** an administrator deletes a category that is assigned to events
- **THEN** the category row is deleted and its `event_categories` links are removed by cascade; the affected events simply show one fewer category

#### Scenario: Duplicate category slug is rejected

- **WHEN** an administrator submits a category whose slug already exists
- **THEN** the action returns a typed failure and no row is inserted

### Requirement: Write services are server-only and admin-gated

The event and category write services (`createEvent`, `updateEvent`, `deleteEvent`, category CRUD, and category-assignment helpers) SHALL live under `src/lib/server/` and be invoked only from `+page.server.ts` actions that call `requireAdmin(locals)` first. They SHALL NOT be importable from client components. Validation performed in these services SHALL mirror the database constraints (unique slug, `pricePromo < priceNormal` when both set, `quota > 0`, `remainingSlots` within `[0, quota]`, valid status and category enum values).

#### Scenario: A reviewer greps for client imports of the write services

- **WHEN** a reviewer greps `src/lib/features/`, `src/lib/components/`, and `**/+page.svelte` for imports of the event/category write services
- **THEN** no matches appear — they are imported only by `+page.server.ts` files

#### Scenario: Service-level validation mirrors DB constraints

- **WHEN** a write service receives input violating a constraint (e.g. `pricePromo ≥ priceNormal`)
- **THEN** it returns a typed validation error before hitting the database, rather than surfacing a raw constraint-violation exception
