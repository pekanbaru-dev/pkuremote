# docs/

Human-facing design & decision records for the team.

This folder is for **discussion and decisions between teammates** — the *why* behind
significant changes, the options weighed, and what we chose. It's meant to be read by people.

It is deliberately **separate from `openspec/`**, which is the machine-facing "what to build"
contract that drives our AI-assisted implementation workflow (proposal → design → specs → tasks).

| | `docs/` | `openspec/` |
| --- | --- | --- |
| Audience | teammates (humans) | implementation workflow (AI + humans) |
| Content | rationale, alternatives, tradeoffs, narrative | normative requirements + scenarios, task lists |
| Lifecycle | long-lived record of *why* | per-change; archived after the change ships |

When a change is significant enough to explain to a teammate, write an ADR here **and** link it
from the corresponding OpenSpec change (and the GitHub issue).

## Architecture Decision Records (`adr/`)

Numbered, append-only decision records. Each captures one decision: context, options, choice,
consequences.

- [0001 — Migrate off Supabase to self-hosted Postgres + Arctic/OIDC auth](adr/0001-migrate-off-supabase.md)
