## ADDED Requirements

### Requirement: `events` table carries the full shape the UI renders

The `events` table SHALL have the following columns in addition to the existing `id`, `title`, `startsAt`, `location`, `excerpt`, `body`, `createdAt`: `slug` (text, NOT NULL, UNIQUE), `endsAt` (timestamp with timezone, NULL), `bannerUrl` (text, NULL), `status` (text, NOT NULL, default `'upcoming'`, CHECK constraint in `'upcoming' | 'live' | 'past'`), `quota` (integer, NULL, positive), `remainingSlots` (integer, NULL, non-negative, SHALL be ≤ `quota` when both are set), `priceNormal` (integer, NULL, in IDR), `pricePromo` (integer, NULL, in IDR, SHALL be < `priceNormal` when both are set), `category` (text, NULL, CHECK constraint in `'workshop' | 'talk' | 'meetup' | 'social' | 'other'`). The `events` schema file at `db/schema/events.ts` SHALL declare all of these columns and export the Drizzle table object.

#### Scenario: A new event is inserted with the full shape

- **WHEN** a developer inserts a row into `events` with all fields populated
- **THEN** the insert succeeds, the `slug` is unique across the table, `pricePromo < priceNormal` when both are set, `remainingSlots <= quota` when both are set, and the row is queryable via Drizzle with the correct inferred TypeScript shape.

#### Scenario: A CHECK constraint rejects an invalid status

- **WHEN** a developer attempts to insert a row with `status = 'invalid'`
- **THEN** Postgres rejects the insert with a CHECK constraint violation error.

#### Scenario: A new migration captures the column additions

- **WHEN** a developer edits `db/schema/events.ts` to add a new column and runs `pnpm db:generate`
- **THEN** a new SQL file is created under `db/migrations/` adding the column with the right type and constraints, and `pnpm db:migrate` applies it without error.

### Requirement: `categories` table exists with `id`, `name`, `slug`

The Drizzle schema SHALL define a `categories` table at `db/schema/categories.ts` with three columns: `id` (uuid, primary key, default `gen_random_uuid()`), `name` (text, NOT NULL, UNIQUE), `slug` (text, NOT NULL, UNIQUE). The schema index SHALL re-export the `categories` table from `db/schema/index.ts`. A new Drizzle migration SHALL create the table on `pnpm db:migrate`.

#### Scenario: A category is inserted and queried

- **WHEN** a developer inserts a row into `categories` with `name = "Workshop"` and `slug = "workshop"`
- **THEN** the row is queryable via Drizzle, the `name` and `slug` are both unique, and the inferred TypeScript type matches the columns.

#### Scenario: A duplicate slug is rejected

- **WHEN** a developer attempts to insert two rows into `categories` with the same `slug`
- **THEN** Postgres rejects the second insert with a unique-constraint violation error.

### Requirement: `event_categories` join table enables M2M between events and categories

The Drizzle schema SHALL define an `event_categories` join table at `db/schema/event-categories.ts` with three columns: `eventId` (uuid, NOT NULL, foreign key to `events.id` with `ON DELETE CASCADE`), `categoryId` (uuid, NOT NULL, foreign key to `categories.id` with `ON DELETE CASCADE`), and a composite primary key on `(eventId, categoryId)`. The schema index SHALL re-export the `eventCategories` table from `db/schema/index.ts`. A new Drizzle migration SHALL create the table on `pnpm db:migrate`.

#### Scenario: An event is tagged with two categories

- **WHEN** a developer inserts two rows into `event_categories` for the same `eventId` with different `categoryId`s
- **THEN** both rows persist, the event's M2M categories list (joined via the `event_categories` and `categories` tables) contains both categories, and a query that filters by one of the `slug`s returns the event.

#### Scenario: Deleting an event cascades to its `event_categories` rows

- \*\*WHEN` a developer deletes an event row
- **THEN** Postgres also deletes every `event_categories` row that referenced that event (via the `ON DELETE CASCADE` foreign key), and no orphan `event_categories` rows remain.

#### Scenario: Deleting a category cascades to its `event_categories` rows

- \*\*WHEN` a developer deletes a category row
- **THEN** Postgres also deletes every `event_categories` row that referenced that category, and no orphan `event_categories` rows remain.

#### Scenario: A query joins events to categories through the join table

- \*\*WHEN`the events service issues a Drizzle query that joins`events`→`eventCategories`→`categories`
- **THEN** the result set includes every (event, category) pair where the event is tagged with that category, and an event with N categories produces N rows in the join result.
