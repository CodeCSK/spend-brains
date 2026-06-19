# Spendbrains Documentation

> Product and cross-cutting docs. **Code + module docs** live under each app.

## Start here

| Audience | Doc |
|----------|-----|
| **Cursor agents** | [AGENTS.md](./AGENTS.md) — read first |
| **Product** | [app-story.md](./app-story.md) |
| **Backend** | [apps/backend/docs/README.md](../apps/backend/docs/README.md) |
| **Web frontend** | [apps/web/docs/README.md](../apps/web/docs/README.md) |
| **Web layout** | [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) |
| **Plan & stack** | [plan/README.md](./plan/README.md) |
| **Ops** | [ops/README.md](./ops/README.md) |

## Repository layout

```text
spendbrains/
├── apps/
│   ├── backend/          # NestJS · docs/ · /dashboard · /apis
│   └── web/              # React SPA · docs/ · localhost:5173
├── docs/                   # product, plan, ops, AGENTS.md (this folder)
└── docker-compose.yml      # local PostgreSQL
```

## Naming rule

| File | Role |
|------|------|
| **`README.md`** | Hub — links only, one per folder |
| **`AGENTS.md`** | Monorepo agent SSOT |
| **`architecture.md`, `spec.md`, …** | Detail — full content |
| **App `docs/`** | Engineering truth for that app |

## How to maintain

1. Product change → `app-story.md` + relevant app doc (backend leaf or web doc)
2. New backend module → leaf doc under `apps/backend/docs/`, link from hub
3. New web pattern → `apps/web/docs/DECISIONS.md` (W###) + update architecture/design/layout docs as needed
4. New page layout or shell change → [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) + link from [apps/web/docs/README.md](../apps/web/docs/README.md)
5. Agent rules change → `docs/AGENTS.md` + `.cursor/rules.md` (pointer only)

## Related

- [AGENTS.md](./AGENTS.md)
- [app-story.md](./app-story.md)
- [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md)
- [apps/backend/README.md](../apps/backend/README.md)
- [apps/web/README.md](../apps/web/README.md)
