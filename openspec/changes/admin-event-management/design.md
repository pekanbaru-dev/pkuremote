## Context

The `events`, `categories`, and `event_categories` (M2M) tables exist with CHECK constraints (status ∈ upcoming/live/past, category enum, `pricePromo < priceNormal`, quota > 0, `remainingSlots ≥ 0`) and `ON DELETE CASCADE` FKs. `src/lib/server/events/db-events.ts` already exposes read functions (`getUpcomingEvents`, `getPastEvents`, `getEventBySlug`, `getAllCategories`, `getCategoryBySlug`, `getEventsByCategorySlug`). Data currently enters only via seed. `registrations.remainingSlots` bookkeeping is maintained transactionally by the booking flow.

## Goals / Non-Goals

**Goals:**
- Full admin CRUD for events and categories from `/admin`, with validation that mirrors the DB constraints.
- Server-only write services with typed errors, invoked from admin-gated actions.
- Reuse the existing read services, `Event` type, and admin shell/components.

**Non-Goals:**
- No public-facing changes to event listing/detail.
- No bulk import/export (future).
- No registration management/check-in here (separate change).
- No new columns or tables.

## Decisions

### Write services extend `src/lib/server/events/`; categories get their own module
Add `createEvent`, `updateEvent`, `deleteEvent`, and category-assignment helpers to the events server layer; add `src/lib/server/categories/` for category CRUD. All are server-only and return typed results/errors.

- **Why:** Co-locates writes with the existing reads under the same server barrel, consistent with the registrations service shape. Categories are a distinct entity with their own CRUD, so a separate module keeps concerns clean.
- **Alternatives considered:** A single `src/lib/server/admin/` grab-bag — rejected: blurs domain boundaries; the events/categories split mirrors the schema.

### Slug is auto-suggested but editable, and uniqueness is validated on write
The create form derives a slug from the title (slugify) as a suggestion; the admin can override it. `createEvent`/`updateEvent` validate uniqueness and return a typed `SLUG_TAKEN` error (surfaced on the field) on collision.

- **Why:** Slugs are user-facing URLs; auto-suggest saves effort while keeping admin control. DB has a unique index, but catching it as a typed error gives a clean field-level message instead of a 500.

### M2M categories via a select; assignment is diffed on update
The form uses the `select` (multi) to pick categories. `updateEvent` computes the added/removed `event_categories` rows and applies the diff in a transaction with the row update.

- **Why:** Diffing avoids delete-all-then-reinsert churn and keeps the write atomic. The primary `category` enum (for the card CTA label) is a separate single-select field, distinct from the M2M display list — consistent with the schema's documented split.

### `remainingSlots` initializes to `quota` on create; edits are guarded
On create, `remainingSlots := quota` (or null when quota is null). On edit, changing `quota` adjusts `remainingSlots` carefully so it never exceeds `quota` and never goes below already-booked count (`quota − remaining` booked); validation rejects a quota below the booked count with a typed error.

- **Why:** Keeps the booking invariant (`remainingSlots ≤ quota`, `≥ 0`) intact and prevents an admin edit from corrupting live registration counts.
- **Alternatives considered:** Letting admins set `remainingSlots` directly — rejected: too easy to desync from actual bookings; derive it from quota + booked count instead.

### Banner upload delegates to `admin-media-upload`; replace deletes the old
On create/edit with a new file, the action calls `uploadEventBanner`, stores the returned URL, and on replace calls `deleteEventBanner(oldUrl)` after the DB commit.

- **Why:** Isolates storage concerns in the media capability; keeps this change focused on domain CRUD.

### Delete uses a confirmation dialog and surfaces cascade impact
The list's delete action opens a `dialog` warning that deletion also removes the event's registrations (via cascade) before calling `deleteEvent`.

- **Why:** Deletion is destructive and cascades to attendee bookings; an explicit confirm prevents accidental data loss.

## Risks / Trade-offs

- **Editing quota below the booked count would break invariants.** → Mitigation: validate against booked count (`quota − remainingSlots`) and reject with a typed error.
- **Deleting an event silently destroys registrations.** → Mitigation: the confirm dialog states the cascade explicitly; consider a future soft-delete/archive if this proves too sharp.
- **Slug edits break existing shared links.** → Accepted for admin control; the edit form can warn when changing a slug on a non-draft event (nice-to-have).
- **Markdown body is free-form.** → Rendered by the existing detail-page markdown path; no new sanitization surface introduced here beyond what already renders event bodies.
- **Concurrent edits by two admins.** → Low risk at this scale (few admins); last-write-wins on the row update. A future optimistic-concurrency check is out of scope.

## Open Questions

- Should the event form support a `draft` status (not shown publicly) so admins can stage events? The schema's status CHECK is `upcoming|live|past` only — adding `draft` would be a schema change, so it's out of scope here; flag for a future change if staging is needed.
