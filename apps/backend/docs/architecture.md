# Spendbrains — System Architecture

> **How the system is structured** — modules, domain model, and design approach.  
> Hub → [README.md](./README.md) · Product → [../../../docs/app-story.md](../../../docs/app-story.md)

| Doc version | 1.0 |

---

## System diagram

**Pattern:** API-first modular monolith (TD1)

```text
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  Phase 1: React + Vite SPA (Cloudflare Pages)               │
│  Phase 2/3: Flutter (iOS, Android)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / REST JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              NestJS API (TypeScript) — Fly.io Mumbai         │
│  Modules: Auth │ Users │ Events │ Members │ Expenses         │
│           │ Categories │ Settlements │ Export │ Files        │
└───────────┬─────────────────────────────┬───────────────────┘
            │                             │
            ▼                             ▼
   PostgreSQL (Neon)              Cloudflare R2
   Prisma ORM                     Avatars (v1), receipts (v2)
            │
            ▼
        MSG91 (OTP SMS, India)
```

---

## Backend modules (NestJS)

| Module | Responsibility |
|--------|----------------|
| `AuthModule` | OTP send/verify, JWT + refresh, logout all devices |
| `UsersModule` | Profile GET/PATCH (`/v1/users/me`); avatar upload via R2 deferred |
| `EventsModule` | CRUD, archive, visibility, event type / cover |
| `MembersModule` | Roles, invites, join requests, approvals |
| `ExpensesModule` | CRUD, equal shares, filtered list |
| `SettlementsModule` | Compute debts, mark settled, PDF/image export |
| `FilesModule` | R2 presigned URLs |
| `SmsModule` | `SmsProvider` interface → MSG91 |
| `DashboardModule` | Dev scripts reference page at `/dashboard` |

**Rule:** Settlement math runs **on the server only**. Clients display results.

---

## Domain model

No **groups** in v1. Hierarchy:

```text
User
 └── Event
       ├── EventMember (captain | vice_captain | member)
       ├── EventExpenseCategory (icon + name)
       ├── Expense (created_by tracked)
       │     └── ExpenseShare (equal split v1)
       ├── SettlementLine (mark settled)
       └── JoinRequest (private events)
```

### Roles

| Role | Event / members | Categories | Expenses |
|------|-----------------|------------|----------|
| **Captain** | Full incl. delete | Add / edit / delete | Add / edit / delete any |
| **Vice-captain** | Add / edit, no delete | Add / edit | Add / edit any, no delete |
| **Member** | Join only | — | Add / edit / delete **own** |

Details → [../../../docs/app-story.md](../../../docs/app-story.md)

---

## Settlement flow (v1)

1. Compute net balance per member (paid − share owed)  
2. Greedy minimum-payment matching → who pays whom  
3. Persist `settlement_lines`; Captain/V-c mark settled  
4. Recompute when expenses change  

Tables → [database/schema.md](./database/schema.md)  
API → [api/spec.md](./api/spec.md)

---

## Repository layout

```text
spendbrains/
├── apps/backend/      # NestJS + docs/ (this app)
├── apps/web/          # Vite + React (planned)
├── mobile/            # Flutter (Phase 2+)
├── packages/design-tokens/
└── docs/              # Product, plan, ops, frontend
```

---

## Related documents

- [README.md](./README.md)
- [database/schema.md](./database/schema.md)
- [api/README.md](./api/README.md)
- [../../../docs/plan/tech-stack.md](../../../docs/plan/tech-stack.md)
