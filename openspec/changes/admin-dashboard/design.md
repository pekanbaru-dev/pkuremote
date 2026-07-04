## Context

`add-admin-access-gate` left `/admin` as a placeholder page; `admin-shell` wraps it in the admin chrome. The `events` table carries `status`, `quota`, and `remainingSlots`; `registrations` carries `status` and `createdAt` with indexes on `eventId` and `userId`. The `card` primitive supports stat-tile layouts. The data-viz guidance applies if any chart is added.

## Goals / Non-Goals

**Goals:**

- Turn `/admin` into a useful landing dashboard with a few high-signal metrics and two short lists.
- Compute metrics with efficient aggregate SQL, server-side.

**Non-Goals:**

- No deep analytics, date-range filters, or time-series charts (future if wanted).
- No new tables or columns.
- No registration management actions here (separate change) — the recent list is read-only with links.

## Decisions

### Metrics computed by a server-only aggregate service, not in-memory

A `getDashboardMetrics()` service issues COUNT/SUM aggregate queries (total events, upcoming count, total confirmed registrations, sum of `quota` and sum of booked = `quota − remainingSlots` for fill%) plus two small `LIMIT`ed list queries (recent registrations, next upcoming events).

- **Why:** Aggregates in SQL are O(1) round-trips and avoid pulling every row to the app. Keeps the dashboard fast as data grows.
- **Alternatives considered:** Loading all events/registrations and reducing in JS — rejected: doesn't scale and duplicates what SQL does well.

### Capacity fill = booked ÷ quota across quota-bearing events

Fill% = `Σ(quota − remainingSlots) ÷ Σ(quota)` over events where `quota` is not null. Events without a quota are excluded from the denominator.

- **Why:** A single honest utilization number; excluding unlimited events avoids a meaningless denominator.
- **Alternatives considered:** Averaging per-event fill ratios — rejected: small events would distort the figure; a weighted total is truer.

### `/admin` is the dashboard (supersedes the placeholder)

The dashboard replaces the placeholder `/admin/+page.svelte`. The `admin-access` spec's placeholder requirement is marked superseded in this change's delta.

- **Why:** Issue #20 treats Dashboard as the admin landing; a second route would be redundant. The shell's Dashboard nav item already targets `/admin`.

## Risks / Trade-offs

- **Empty data (fresh install) yields zeros / division by zero for fill%.** → Mitigation: guard the denominator; render "—" or 0% when `Σ(quota) = 0`, and friendly empty lists.
- **Metric definitions drift from stakeholder expectations.** → Mitigation: keep definitions explicit in the service and spec; they're cheap to adjust.
- **Adding charts later invites inconsistency.** → Out of scope now; if added, follow the dataviz skill.

## Open Questions

- Which registration statuses count as "registrations"? This design counts `confirmed` (and could include `attended`); the spec fixes it to confirmed + attended as "active" bookings — adjust if stakeholders prefer gross counts.
