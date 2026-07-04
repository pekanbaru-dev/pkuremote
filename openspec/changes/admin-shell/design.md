## Context

`add-admin-access-gate` establishes the `/admin` route group, its server-side authorization (`+layout.server.ts` → `requireAdmin`), and a placeholder page. What's missing is the visual frame issue #20 describes: a sidebar on every admin page, an active indicator, and desktop/mobile support.

The project uses Svelte 5 runes, Tailwind v4 with **semantic breakpoints only** (`mobile:` / `tablet:` / `desktop:` — the default `sm:`/`md:`/`lg:` produce no CSS), the Material-3 golden palette, and the "Quiet Bulletin" design language. A shadcn `sheet` component is already installed and unused. Domain UI belongs in a vertical feature slice per `ARCHITECTURE.md`.

## Goals / Non-Goals

**Goals:**

- One layout that wraps all `/admin/*` routes with sidebar + top bar + content region.
- Active-menu indicator that reflects the current section.
- Responsive: persistent sidebar on `desktop:`, slide-over `sheet` on smaller viewports.
- House the chrome in `src/lib/features/admin/` per the feature recipe, exposed via a barrel.

**Non-Goals:**

- No dashboard content, metrics, or CRUD (separate changes).
- No new auth surface — identity and sign-out reuse existing session + action.
- No new navigation-menu primitive; the CLAUDE.md note says shadcn NavigationMenu's hover-fill conflicts with the editorial aesthetic, so the sidebar is hand-rolled.

## Decisions

### The shell lives in a feature slice: `src/lib/features/admin/`

`AdminShell` and `AdminSidebar` components live under `src/lib/features/admin/components/`, exported through `src/lib/features/admin/index.ts`; `src/routes/admin/+layout.svelte` imports `AdminShell` from the barrel and renders `{@render children()}` inside it.

- **Why:** `ARCHITECTURE.md` mandates domain UI in a vertical slice with a public barrel; admin is a domain area. Keeps the route file thin.
- **Alternatives considered:** Putting the shell directly in `+layout.svelte` — rejected: it becomes non-reusable and violates the thin-route convention. Putting it in `src/lib/components/` — rejected: `components/` is domain-agnostic; the admin nav is domain UI.

### Active-menu indicator derives from `page.url.pathname`

Each nav item declares its base path (e.g. `/admin/events`); an item is active when the current pathname equals it or starts with it + `/`. The active item gets a distinct treatment (filled `primary-container` / bold label), respecting the One Voice Rule (accent ≤10% of the screen).

- **Why:** Path-derived state needs no client store and survives SSR/full navigations.
- **Alternatives considered:** Tracking active state in a store — rejected: redundant with the URL, and breaks on hard navigation.

### Responsive: persistent sidebar on `desktop:`, `sheet` below

At `desktop:` the sidebar is a persistent left column. Below `desktop:` it is hidden and a hamburger button in the top bar opens the shadcn `sheet` containing the same nav. The nav item list is defined once and rendered in both.

- **Why:** Matches issue #20's "desktop dan mobile" requirement; reuses the already-installed `sheet`; single source of truth for nav items avoids drift.
- **Alternatives considered:** A CSS-only collapsible sidebar — rejected: worse a11y and focus management than `sheet`, which handles trap/escape/overlay.

### Nav lists sections that may not exist yet

The initial nav lists **Dashboard** (`/admin`) and **Events** (`/admin/events`). Links may point at routes delivered by later changes; until then they resolve to the SvelteKit 404 within the shell.

- **Why:** Lets the shell ship independently and makes the roadmap visible. Adding a section later is a one-line edit to the nav item list.

## Risks / Trade-offs

- **Nav links to not-yet-built routes 404.** → Acceptable during rollout; the dependent changes (`admin-dashboard`, `admin-event-management`) land shortly after and fill them. Alternatively gate nav items behind a feature flag — not worth the complexity for a single admin.
- **Sidebar accent could violate the One Voice Rule if over-styled.** → Mitigation: only the active item carries the accent; the rest are quiet text links, consistent with DESIGN.md.
- **Mobile `sheet` and desktop sidebar drifting out of sync.** → Mitigation: a single `NAV_ITEMS` array is the source for both renderings.

## Open Questions

- Should `/admin` itself be the dashboard, or should it redirect to `/admin/dashboard`? Deferred to `admin-dashboard`; the shell treats `/admin` as the Dashboard nav target either way.
