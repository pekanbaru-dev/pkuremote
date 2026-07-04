## 1. Metrics service

- [ ] 1.1 Create a server-only `getDashboardMetrics()` (e.g. `src/lib/server/dashboard/`) using aggregate SQL: total events, upcoming count, total active registrations (`confirmed`/`attended`), `Σquota` and `Σ(quota − remainingSlots)` for fill%
- [ ] 1.2 Add `LIMIT`ed queries for recent registrations (attendee, event, date) and next upcoming events (title, date)
- [ ] 1.3 Guard the fill% denominator (return neutral value when `Σquota = 0`)
- [ ] 1.4 Confirm the service is under `src/lib/server/` (excluded from client bundle); unit-test the fill computation incl. the zero-quota case

## 2. Dashboard route

- [ ] 2.1 Replace the placeholder `src/routes/admin/+page.svelte` with the dashboard; `+page.server.ts` `load` calls `getDashboardMetrics()`
- [ ] 2.2 Render metric stat tiles using the `card` primitive (total events, upcoming, registrations, capacity fill)
- [ ] 2.3 Render recent-registrations and upcoming-events lists with links into the admin areas; friendly empty states when no data

## 3. Verify

- [ ] 3.1 With seeded data, tiles and lists show correct figures; capacity fill matches `booked ÷ quota`
- [ ] 3.2 With empty data, tiles show zeros/neutral fill and lists show empty states (no divide-by-zero)
- [ ] 3.3 Non-admin is redirected by the existing gate; dashboard renders inside the admin shell
- [ ] 3.4 Confirm the metrics service is absent from the client build; run `pnpm check` → `pnpm lint` → `pnpm test`
