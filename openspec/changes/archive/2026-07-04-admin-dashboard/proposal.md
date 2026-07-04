## Why

Issue #20 lists a Dashboard as the admin panel's landing view. After the gate, shell, and event management exist, `/admin` should open on an at-a-glance summary of the community's activity — how many events, how many registrations, how full events are — instead of the bare placeholder. This change turns `/admin` into that dashboard.

## What Changes

- Replace the placeholder `/admin/+page.svelte` with a dashboard showing key metrics as stat tiles: total events, upcoming events, total confirmed registrations, and overall capacity fill (booked ÷ quota across events with a quota).
- Show a short "recent registrations" list (most recent bookings: attendee name, event, date) and an "upcoming events" quick list linking into event management.
- Add a server-only dashboard metrics service that computes the aggregates with efficient SQL (counts/sums), not by loading all rows into memory.
- The dashboard renders inside the admin shell and is admin-gated (inherits the `/admin` gate).

## Capabilities

### New Capabilities

- `admin-dashboard`: The `/admin` dashboard view — the metric stat tiles, the recent-registrations and upcoming-events lists, and the server-only aggregate-metrics service behind them.

### Modified Capabilities

<!-- None at spec level. This change supersedes the placeholder /admin page introduced by add-admin-access-gate at the implementation level; that capability's placeholder requirement is reconciled when this change is archived (its base spec does not exist until add-admin-access-gate is archived first). -->

## Impact

- **Modified route**: `src/routes/admin/+page.svelte` (placeholder → dashboard) and its `+page.server.ts` (`load` returns metrics). This supersedes the placeholder page from `add-admin-access-gate`; reconcile the placeholder requirement in `openspec/specs/admin-access/` when archiving (after `add-admin-access-gate` is archived).
- **New server code**: a dashboard metrics service under `src/lib/server/` (e.g. `src/lib/server/admin/dashboard.ts` or `src/lib/server/dashboard/`).
- **Depends on**: `add-admin-access-gate` (gate + placeholder it supersedes), `admin-shell` (renders inside it). Reads are richer once `admin-event-management` exists but the dashboard works against whatever data is present.
- **Reuses**: existing `events`, `registrations` tables and the `card` primitive for stat tiles. **No schema change.**
