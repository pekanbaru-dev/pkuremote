# Architecture

This document describes how the project's source code is organized. See [DESIGN.md](./DESIGN.md) for the visual system, [PRODUCT.md](./PRODUCT.md) for product decisions, and [AGENTS.md](./AGENTS.md) for agent operating conventions.

## Overview

The project is a SvelteKit application whose `src/lib/` splits into **horizontal shared layers** (domain-agnostic, reusable across features) and **vertical domain slices** (feature-specific bundles of UI + logic + types). Routes under `src/routes/` are thin — they compose features and components; they do not carry domain logic.

## The two axes

```
src/lib/
├── components/          HORIZONTAL — shared UI vocabulary
│   ├── primitives/      hand-rolled (button, input, badge, checkbox, radio, avatar)
│   └── ui/              shadcn-svelte / bits-ui (card, dialog, dropdown, …)
├── features/            VERTICAL — domain slices
│   └── events/
│       ├── components/  feature-specific UI (EventCard, EventDetailHero, …)
│       ├── services/    data access and domain logic (dummy-events, json-ld)
│       ├── types.ts     the Event type + related shapes
│       └── index.ts     PUBLIC BARREL — the only legal import surface
├── server/              server-only infrastructure (never imported from client)
│   ├── auth/
│   ├── db/
│   └── supabase/
├── supabase/            client-side Supabase binding
├── assets/              static assets (fonts, images)
└── utils.ts             shared helpers (cn, formatters, etc.)
```

## `src/lib/components/` — shared UI

Two folders, split by complexity (full contract in AGENTS.md):

- **`primitives/`** — hand-rolled Svelte 5 components (button, input, badge, checkbox, radio, radio-group, avatar). Built with `tailwind-variants` (`tv`) + `cn`. Each uses a canonical 6-axis variant contract (`intent` / `variant` / `size` / `uppercase` / `rounded` / `fullWidth`) where applicable.
- **`ui/`** — shadcn-svelte components that delegate to `bits-ui` for headless behavior (card, dialog, dropdown, sheet, …). Managed via `components.json`.

When adding a component: simple → `primitives/`; headless/interactive-with-complex-state → `ui/` (shadcn). Components are domain-agnostic — they MUST NOT import from any `src/lib/features/<feature>/`.

See the [`component-library`](./openspec/specs/component-library/spec.md) capability spec for the full variant contract and a11y requirements.

## `src/lib/features/` — vertical slices

Each feature is a self-contained unit with four parts:

| Folder / file | Purpose                                                  | Examples (from `events`)                                                    |
| ------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `components/` | Feature-specific UI                                      | `event-card.svelte`, `event-detail-hero.svelte`, `event-price-block.svelte` |
| `services/`   | Data access + domain logic                               | `dummy-events.ts`, `json-ld.ts`                                             |
| `types.ts`    | Domain types                                             | `Event`, `EventCategory`, `EventStatus`                                     |
| `index.ts`    | **Public barrel** — the only external import entry point | Re-exports the intended public surface                                      |

### The barrel contract

Every feature's `index.ts` is its **single legal import surface** for external consumers. From outside `src/lib/features/<feature>/`, imports MUST go through the barrel:

```ts
// ✓ correct
import { EventCard, getUpcomingEvents } from "$lib/features/events";

// ✗ forbidden — deep path inside a feature
import { EventCard } from "$lib/features/events/components/event-card.svelte";
import { getUpcomingEvents } from "$lib/features/events/services/dummy-events";
```

The barrel's exports define the feature's public API. Internal files (components, services, types) can reorganize freely as long as the barrel's exports stay stable — consumers don't see the internals.

**Enforcement status:** this rule is currently enforced by **convention** (a docstring in each feature's `index.ts`) rather than by a lint rule. A future change will add a `no-restricted-imports` pattern to `eslint.config.js` blocking `**/features/*/components/**` and `**/features/*/services/**` deep imports from outside the owning feature.

The [`events`](./openspec/specs/events/spec.md) capability spec is the concrete exemplar of this slice pattern.

## Dependency rules

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│              │   routes     │  features/X  │  components  │ server (any) │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ routes       │       —      │      ✗       │      ✗       │      ✗       │
│ features/X   │      ✓       │      —       │      ✗       │      ✗       │
│ components   │      ✓       │      ✓*      │      —       │      ✗       │
│ server/*     │      ✗†      │      ✗†      │      ✗       │      ✗       │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

*   components may import from routes ONLY via route-agnostic helpers; never a specific route.
†   server/* is server-only — client code accesses it through +page.server.ts load functions
    or +server.ts endpoints, never directly.
```

Plain English:

- **Features → components**: ✓ allowed — feature UI uses shared primitives / shadcn components.
- **Routes → features** (via barrel) + **routes → components**: ✓ allowed — routes compose.
- **Components → features**: ✗ forbidden — shared UI must stay domain-agnostic.
- **Feature → other feature**: ✗ forbidden — cross-feature coupling. Lift the shared concern into `components/` (if UI) or a shared service helper.
- **Server → client**: ✗ forbidden — `src/lib/server/` is server-only; access from client code causes build failures.

## `src/lib/server/` — server-only boundary

`src/lib/server/` holds server-side infrastructure: auth (`auth/`), database (`db/`), and the Supabase admin client (`supabase/`). Per SvelteKit's convention, anything under `src/lib/server/` is automatically excluded from the client bundle — trying to import it from a `.svelte` file or a client-only `.ts` file fails at build time.

Client access to server-side data goes exclusively through:

- `+page.server.ts` `load()` functions (for data needed to render a page)
- `+server.ts` endpoints (for RPC-style calls from the client)
- Form actions (`+page.server.ts` `actions` object)

See the [`drizzle-integration`](./openspec/specs/drizzle-integration/spec.md) and [`user-auth`](./openspec/specs/user-auth/spec.md) capability specs for the concrete server capabilities.

## `src/routes/` — composition layer

Routes are thin. A typical route file:

1. Imports services from the relevant feature barrel
2. Calls a service function in its `load()` to get data
3. Renders a feature component with that data

```svelte
<script>
	import { getUpcomingEvents, EventCard } from "$lib/features/events";
	const events = getUpcomingEvents();
</script>

{#each events as event}
	<EventCard {event} />
{/each}
```

Domain logic, data access, and feature-specific state live in the feature. Routes only orchestrate.

## Adding a new feature

Follow this recipe when adding a new domain area (e.g., `blog`, `partners`, `volunteers`):

1. **Create the slice skeleton**
   ```bash
   mkdir -p src/lib/features/<name>/components src/lib/features/<name>/services
   touch src/lib/features/<name>/types.ts src/lib/features/<name>/index.ts
   ```
2. **Define the domain types** in `types.ts` (the `Event`-equivalent for this feature).
3. **Build services** in `services/` — data access, domain logic, formatters. Keep them pure where possible.
4. **Build feature components** in `components/`. Use `$lib/components/primitives` and `$lib/components/ui` for shared UI. The feature's components MAY import other files within the same feature directly — the barrel contract applies only to _external_ consumers.
5. **Expose the public surface** in `index.ts` — re-export only the services, types, and components that external code should use. Include a docstring documenting the barrel contract:
   ```ts
   /**
    * Public surface for the `<name>` feature.
    *
    * Consumers SHALL import only from `$lib/features/<name>`, never from the
    * nested `components/`, `services/`, or `types.ts` files.
    */
   ```
6. **Add routes** under `src/routes/<name>/...` that import from the barrel + shared components.
7. **Add a capability spec** at `openspec/specs/<name>/spec.md` capturing the feature's behavioral requirements. Mirror the `events` spec's "All event-specific code lives in `src/lib/features/events/`" requirement for your feature.
8. **Avoid cross-feature imports** — if you need logic from another feature, lift the shared piece into a shared helper under `src/lib/` (not a feature).

## See also

- [DESIGN.md](./DESIGN.md) — visual system (colors, typography, elevation)
- [PRODUCT.md](./PRODUCT.md) — product decisions (brand, audience, guardrails)
- [CONTRIBUTING.md](./CONTRIBUTING.md) — workflow (OpenSpec changes, review, deploy)
- [AGENTS.md](./AGENTS.md) — agent operating conventions (commands, tool usage, component split pointer)
- [`component-library`](./openspec/specs/component-library/spec.md) — variant contract + a11y requirements
- [`architecture`](./openspec/specs/architecture/spec.md) — the formal capability spec that generalizes this pattern
