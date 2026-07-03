## ADDED Requirements

### Requirement: `registrations` table exists with booking + ownership + status columns

The Drizzle schema SHALL define a `registrations` table at `db/schema/registrations.ts` with the following columns: `id` (uuid, primary key, default `gen_random_uuid()`), `userId` (uuid, NOT NULL, foreign key to `profiles.id` with `ON DELETE CASCADE`), `eventId` (uuid, NOT NULL, foreign key to `events.id` with `ON DELETE CASCADE`), `registrationNumber` (text, NOT NULL, UNIQUE), `attendeeName` (text, NOT NULL — the per-event attendee name), `attendeePhone` (text, NOT NULL — the per-event attendee phone), `status` (text, NOT NULL, default `'confirmed'`, CHECK constraint in `'confirmed' | 'cancelled' | 'attended' | 'no_show'`), `createdAt` (timestamptz, NOT NULL, default now()), `updatedAt` (timestamptz, NOT NULL, default now()). A unique constraint SHALL be enforced on `(userId, eventId)`. The schema index SHALL re-export the `registrations` table from `db/schema/index.ts`. A new Drizzle migration SHALL create the table on `pnpm db:migrate`.

#### Scenario: A registration is inserted

- **WHEN** a developer inserts a row into `registrations` with `userId`, `eventId`, and a unique `registrationNumber`
- **THEN** the insert succeeds, the `userId` references an existing profile, the `eventId` references an existing event, the `status` defaults to `'confirmed'`, the `createdAt` and `updatedAt` default to now.

#### Scenario: A duplicate `(userId, eventId)` is rejected

- **WHEN** a developer attempts to insert two `registrations` rows with the same `(userId, eventId)`
- **THEN** the second insert fails with a unique-constraint violation; only the first row persists.

#### Scenario: Deleting a user cascades to their registrations

- **WHEN** a developer deletes a `profiles` row
- **THEN** Postgres also deletes every `registrations` row that referenced that user (via the `ON DELETE CASCADE` foreign key), and no orphan `registrations` rows remain.

#### Scenario: Deleting an event cascades to its registrations

- **WHEN** a developer deletes an `events` row
- **THEN** Postgres also deletes every `registrations` row that referenced that event (via the `ON DELETE CASCADE` foreign key), and no orphan `registrations` rows remain.

### Requirement: `events` table gains `registrationClosesAt` column

The Drizzle schema SHALL add a `registrationClosesAt` column to the `events` table: type `timestamp with timezone`, NULL allowed, no default. The new column is added to the existing `events` table via a Drizzle migration (the migration is auto-generated and applied on `pnpm db:migrate`).

#### Scenario: An event is created without a registration deadline

- **WHEN** a developer inserts a row into `events` without specifying `registrationClosesAt`
- **THEN** the column is `NULL` in the database and the event is bookable up to its `startsAt`.

#### Scenario: An event is created with a registration deadline

- **WHEN** a developer inserts a row into `events` with `registrationClosesAt = "2026-10-20T23:59:00+07:00"`
- **THEN** the column is set to that value; the booking action rejects bookings with `registrationClosesAt` in the past.
