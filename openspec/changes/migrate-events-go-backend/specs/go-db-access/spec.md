## ADDED Requirements

### Requirement: goose owns all database DDL

Schema migrations SHALL live as plain SQL goose migrations in `api/migrations/`, and goose SHALL be the only tool that generates or applies DDL — for every table, including the auth tables still queried by the BFF. Migration zero SHALL be a baseline generated from a `pg_dump --schema-only` of a database at the current drizzle-migrated state (not hand-written). Databases already at that state SHALL adopt the baseline via goose's version bookkeeping without re-running DDL; empty databases SHALL reach the identical schema by running goose from zero. drizzle-kit SHALL never generate a migration again.

#### Scenario: Fresh database from goose alone

- **WHEN** goose runs from zero against an empty `postgres:16` database
- **THEN** the resulting schema is identical (tables, columns, constraints, indexes) to a schema produced by the retired drizzle migration history

#### Scenario: Existing database adopts the baseline

- **WHEN** goose runs against the existing dev/prod database that drizzle already migrated
- **THEN** the baseline is recorded as applied without executing its DDL, and subsequent migrations apply normally

#### Scenario: Schema drift is caught in CI

- **WHEN** CI spins up an empty Postgres, applies all goose migrations, and diffs the schema against the committed baseline expectation
- **THEN** any divergence fails the job

### Requirement: Go data access is ORM-free via sqlc and pgx

All Go database access SHALL go through hand-written SQL in `api/queries/*.sql` compiled by sqlc targeting pgx v5. No ORM SHALL be introduced in the Go service. sqlc generation SHALL be part of the documented codegen command, and CI SHALL verify committed sqlc output is in sync with the query sources.

#### Scenario: A query mismatch fails at generation time

- **WHEN** a query references a column that does not exist in the schema sqlc checks against
- **THEN** `sqlc generate` fails before any Go code compiles

#### Scenario: No ORM dependency exists

- **WHEN** `api/go.mod` is inspected
- **THEN** it contains pgx and sqlc-generated code dependencies but no ORM (no GORM, ent, etc.)

### Requirement: Booking runs in a single transaction preserving quota and uniqueness semantics

`BookEvent` SHALL execute as one SQL transaction that: decrements `events.remaining_slots` only when `remaining_slots > 0` (or quota is unlimited), inserts the registration, and relies on the database's unique `(user_id, event_id)` constraint and CHECK constraints as the final guard. Quota exhaustion, duplicate booking, closed registration, and past-event conditions SHALL map to distinct, stable error codes the BFF translates to the existing user-facing messages. Concurrent bookings for the last slot SHALL result in exactly one success.

#### Scenario: Concurrent last-slot bookings

- **WHEN** two booking requests race for an event with `remaining_slots = 1`
- **THEN** exactly one registration is created, `remaining_slots` ends at 0, and the loser receives the quota-exhausted error

#### Scenario: Duplicate booking is rejected

- **WHEN** a user who already has a registration for an event books it again
- **THEN** the transaction fails on the unique constraint and the BFF shows the existing already-registered message
