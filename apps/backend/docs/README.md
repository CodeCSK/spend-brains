# Backend docs

> Hub for the NestJS app in this folder. npm scripts reference → `GET /dashboard` when the server is running.

## Active plan (agents)

| Doc | Purpose |
|-----|---------|
| **[active_plan.md](./active_plan.md)** | Current backend implementation plan — work steps here; file is **replaced** when the next plan starts |

Sitewide roadmaps → [../../docs/plan/README.md](../../docs/plan/README.md)

## Detail

| Topic | Doc |
|-------|-----|
| Architecture & modules | [architecture.md](./architecture.md) |
| Authentication | [authentication.md](./authentication.md) |
| Database schema | [database/schema.md](./database/schema.md) |
| REST contract | [api/README.md](./api/README.md) · [api/spec.md](./api/spec.md) |

## Module leaf docs (add as you build)

| Module | Doc | Status |
|--------|-----|--------|
| Auth | [authentication.md](./authentication.md) | Done |
| Users | [authentication.md](./authentication.md) (GET/PATCH `/v1/users/me`) · `users.md` planned | Partial |
| Events | [events.md](./events.md) | Done |
| Members & roles | [members-and-roles.md](./members-and-roles.md) | Done |
| Expenses & categories | [expenses.md](./expenses.md) | Done |
| Settlements | [settlements.md](./settlements.md) | Done |
| Files (R2) | `files-and-avatars.md` | Planned |
| SMS | `sms-provider.md` | Planned |

## Related

- [../../docs/app-story.md](../../docs/app-story.md)
- [../../docs/plan/tech-stack.md](../../docs/plan/tech-stack.md)
- [../../docs/ops/README.md](../../docs/ops/README.md)
