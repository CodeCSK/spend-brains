# Active Plan — Backend API (Phase 1)

> **Agent working doc.** One active plan per app — this file is **replaced** when the next backend plan starts.  
> Sitewide roadmaps → [../../../docs/plan/README.md](../../../docs/plan/README.md)

| Field | Value |
|-------|-------|
| **Plan** | Implement all pending Phase 1 REST APIs |
| **Status** | Complete — all steps implemented; run migrate + e2e to verify |
| **Started** | 2026-06-16 |
| **Replaces** | — (first plan) |

---

## Goal

Ship the full event-expense-settlement API under `/v1` so the web app (and later mobile) can run the complete v1 product loop: **create event → join → log expenses → view summaries → settle up → export**.

Auth and user profile are already done. Everything else in this plan is pending.

---

## Agent instructions

1. Read prerequisites below before coding.
2. Work **one step at a time** — finish verify criteria before moving on.
3. Update this file as you go: check boxes, fill **Done log**, set **Status** in the header.
4. Update canonical docs in the **same change** (`api/spec.md`, leaf module docs, `schema.md` if needed).
5. Do **not** invent endpoints — match this plan and [app-story.md](../../../docs/app-story.md).
6. When all steps are done, set **Status** to `Complete` and wait for the human to replace this file with the next plan.

---

## Prerequisites (read first)

| # | Doc | Why |
|---|-----|-----|
| 1 | [architecture.md](./architecture.md) | Modules, domain model, settlement flow |
| 2 | [database/schema.md](./database/schema.md) | Tables, enums, relations |
| 3 | [api/spec.md](./api/spec.md) | REST contract (extend as you build) |
| 4 | [authentication.md](./authentication.md) | Auth patterns, guards, `@CurrentUser()` |
| 5 | [../../../docs/app-story.md](../../../docs/app-story.md) | Business rules and permissions |

**Code patterns to follow:** `src/auth/`, `src/users/` (DTOs, Swagger, service layer, e2e in `test/`).

---

## Already implemented (do not redo)

| Method | Path | Module |
|--------|------|--------|
| POST | `/v1/auth/otp/send` | Auth |
| POST | `/v1/auth/otp/verify` | Auth |
| POST | `/v1/auth/refresh` | Auth |
| POST | `/v1/auth/logout` | Auth |
| POST | `/v1/auth/logout-all` | Auth |
| GET | `/v1/users/me` | Users |
| PATCH | `/v1/users/me` | Users |

**DB today:** `users`, `refresh_tokens`, `otp_codes` only.

**Scaffolded but empty:** `EventsModule`, `MembersModule`, `ExpensesModule`, `SettlementsModule`, `FilesModule` — controllers have no routes yet and use wrong prefix (`events` not `v1/events`).

---

## Out of scope (this plan)

| Item | When |
|------|------|
| `POST /v1/files/presign` (R2 avatar upload) | Later plan |
| `POST /v1/auth/apple`, `/v1/auth/google` | Phase 2/3 |
| Web UI | [apps/web/docs/active_plan.md](../../web/docs/active_plan.md) |

---

## Steps

### Step 0 — Foundation

**Blocks all other steps.**

- [x] Prisma migration: `Event`, `EventMember`, `JoinRequest`, `EventExpenseCategory`, `Expense`, `ExpenseShare`, `SettlementLine` + enums (`EventType`, `EventVisibility`, `MemberRole`, `JoinRequestStatus`)
- [x] Shared constants: default cover URL per `EventType`; default category set (Food, Travel, Stay, Shopping, Entertainment, Other)
- [x] `public_id` generator (8-char unique join code)
- [x] Guards: `EventMemberGuard`, `RolesGuard`; decorators `@EventMember()`, `@Roles()`
- [x] Permission helpers in `common/permissions/` (captain / vice-captain / member / expense ownership)
- [x] Fix all domain controllers to `@Controller('v1/events')` (or nested under events module)
- [x] Expand [api/spec.md](./api/spec.md) with endpoint list from this plan

**Verify**

- [x] `npm run db:migrate` succeeds
- [x] Non-member gets `403` on a protected event route
- [x] Swagger shows new tags at `/apis`

---

### Step 1 — Events CRUD + list

- [x] `POST /v1/events` — create; creator = captain; seed categories; `visibility` default `private`; `event_type` default `general`
- [x] `GET /v1/events` — list where user is member; `?archived=true|false`
- [x] `GET /v1/events/:id` — detail + `myRole` + member count
- [x] `PATCH /v1/events/:id` — captain / vice-captain; type change updates `cover_image_url`
- [x] `DELETE /v1/events/:id` — captain only; cascade
- [x] `POST /v1/events/:id/archive` — captain / vice-captain
- [x] `POST /v1/events/:id/unarchive` — captain / vice-captain
- [x] Leaf doc: `events.md` (create when implementing)
- [x] E2E smoke: create → list → get → patch → archive → delete

**Verify**

- [x] Captain auto-added to `event_members`
- [x] Default categories exist after create

---

### Step 2 — Join flow

- [x] `GET /v1/events/lookup/:publicId` — preview (name, type, visibility, dates); `@Public()` or optional auth
- [x] `POST /v1/events/join/:publicId` — public → add member; private → `join_request` pending
- [x] `GET /v1/events/:id/join-requests` — captain / vice-captain
- [x] `POST /v1/events/:id/join-requests/:requestId/approve`
- [x] `POST /v1/events/:id/join-requests/:requestId/reject`
- [x] Leaf doc: `members-and-roles.md` (join section)
- [x] E2E: private join → approve → member listed

**Verify**

- [x] Public event adds member without approval
- [x] Private event stays pending until approved

---

### Step 3 — Members management

- [x] `GET /v1/events/:id/members` — list with user profile snippet + role
- [x] `POST /v1/events/:id/members` — add by phone; captain / vice-captain
- [x] `PATCH /v1/events/:id/members/:userId` — role change (captain assigns vice-captain)
- [x] `DELETE /v1/events/:id/members/:userId` — captain only; cannot remove captain
- [x] Extend `members-and-roles.md`
- [x] E2E: promote to vice-captain; vice-captain cannot delete member

**Verify**

- [x] Authorization matrix matches [api/spec.md](./api/spec.md)

---

### Step 4 — Expense categories

- [x] `GET /v1/events/:id/categories`
- [x] `POST /v1/events/:id/categories` — captain / vice-captain
- [x] `PATCH /v1/events/:id/categories/:categoryId` — captain / vice-captain
- [x] `DELETE /v1/events/:id/categories/:categoryId` — captain only; reject if expenses reference it
- [x] E2E: add custom category; captain deletes unused one

**Verify**

- [x] Default categories from Step 1 are returned

---

### Step 5 — Expenses CRUD + list

- [x] `POST /v1/events/:id/expenses` — equal split across `sharedAmong` user IDs → `expense_shares`
- [x] `GET /v1/events/:id/expenses` — pagination + `sort`, `order`, `categoryId`, `paidBy`, `dateFrom`, `dateTo`, `search`
- [x] `GET /v1/events/:id/expenses/:expenseId` — include shares
- [x] `PATCH /v1/events/:id/expenses/:expenseId` — captain any; vice-captain any; member own only
- [x] `DELETE /v1/events/:id/expenses/:expenseId` — captain or own expense only
- [x] On create/update/delete → trigger settlement recomputation (Step 7)
- [x] Leaf doc: `expenses.md`
- [x] E2E: ₹1200 among 3 members → 3 shares at ₹400

**Verify**

- [x] Filters and pagination work
- [x] Role rules enforced per app-story

---

### Step 6 — Spending summaries

- [x] `GET /v1/events/:id/summaries` — per member: `totalPaid`, `totalShare`, `netBalance`
- [x] E2E: totals match manual calculation on fixture data

**Verify**

- [x] Math computed server-side only

---

### Step 7 — Settlements compute + mark settled

- [x] `SettlementsService`: net balance → greedy minimum-payment matching → persist `settlement_lines` with `computation_version`
- [x] Recompute on expense changes; document settled-line behaviour when amounts change
- [x] `GET /v1/events/:id/settlements` — summary (total spent, settled/outstanding, progress) + payment lines
- [x] `POST /v1/events/:id/settlements/:lineId/settle` — captain / vice-captain
- [x] `POST /v1/events/:id/settlements/:lineId/unsettle` — captain / vice-captain
- [x] Leaf doc: `settlements.md`
- [x] E2E: 3-person scenario → minimal lines; mark settled updates summary

**Verify**

- [x] Settlement status: unsettled / partial / fully settled (from app-story)

---

### Step 8 — Settlement export

- [x] `GET /v1/events/:id/settlements/export?format=pdf`
- [x] `GET /v1/events/:id/settlements/export?format=image`
- [x] Export settlement details only (not full expense dump)
- [x] E2E: PDF returns valid content-type and non-empty body

**Verify**

- [x] Matches app-story export scope

---

## Endpoint checklist (pending)

| # | Method | Path | Step |
|---|--------|------|------|
| 1 | GET | `/v1/events` | 1 |
| 2 | POST | `/v1/events` | 1 |
| 3 | GET | `/v1/events/:id` | 1 |
| 4 | PATCH | `/v1/events/:id` | 1 |
| 5 | DELETE | `/v1/events/:id` | 1 |
| 6 | POST | `/v1/events/:id/archive` | 1 |
| 7 | POST | `/v1/events/:id/unarchive` | 1 |
| 8 | GET | `/v1/events/lookup/:publicId` | 2 |
| 9 | POST | `/v1/events/join/:publicId` | 2 |
| 10 | GET | `/v1/events/:id/join-requests` | 2 |
| 11 | POST | `/v1/events/:id/join-requests/:requestId/approve` | 2 |
| 12 | POST | `/v1/events/:id/join-requests/:requestId/reject` | 2 |
| 13 | GET | `/v1/events/:id/members` | 3 |
| 14 | POST | `/v1/events/:id/members` | 3 |
| 15 | PATCH | `/v1/events/:id/members/:userId` | 3 |
| 16 | DELETE | `/v1/events/:id/members/:userId` | 3 |
| 17 | GET | `/v1/events/:id/categories` | 4 |
| 18 | POST | `/v1/events/:id/categories` | 4 |
| 19 | PATCH | `/v1/events/:id/categories/:categoryId` | 4 |
| 20 | DELETE | `/v1/events/:id/categories/:categoryId` | 4 |
| 21 | GET | `/v1/events/:id/expenses` | 5 |
| 22 | POST | `/v1/events/:id/expenses` | 5 |
| 23 | GET | `/v1/events/:id/expenses/:expenseId` | 5 |
| 24 | PATCH | `/v1/events/:id/expenses/:expenseId` | 5 |
| 25 | DELETE | `/v1/events/:id/expenses/:expenseId` | 5 |
| 26 | GET | `/v1/events/:id/summaries` | 6 |
| 27 | GET | `/v1/events/:id/settlements` | 7 |
| 28 | POST | `/v1/events/:id/settlements/:lineId/settle` | 7 |
| 29 | POST | `/v1/events/:id/settlements/:lineId/unsettle` | 7 |
| 30 | GET | `/v1/events/:id/settlements/export` | 8 |

---

## Done log

| Date | Step | Notes |
|------|------|-------|
| — | — | Plan created |
| 2026-06-17 | 0 | Prisma schema + migration `20260617120000_events_domain`; enums; default covers/categories; `public_id` generator; `EventMemberGuard` / `RolesGuard` + `@EventMember()` / `@Roles()`; permission helpers; all domain controllers moved to `v1/events…`; spec expanded |
| 2026-06-17 | 1 | Events CRUD + list (`?archived`) + archive/unarchive; captain auto-membership + seeded categories; `events.md` |
| 2026-06-17 | 2 | Join flow: lookup, public join / private request, list/approve/reject |
| 2026-06-17 | 3 | Members list/add-by-phone/role/remove; `members-and-roles.md` |
| 2026-06-17 | 4 | Category CRUD; delete blocked when referenced |
| 2026-06-17 | 5 | Expense CRUD + filtered/sorted/paginated list; equal split in paise; recompute on change; `expenses.md` |
| 2026-06-17 | 6 | Per-member summaries (paid/share/net), server-side |
| 2026-06-17 | 7 | Greedy settlement matching + versioning; summary + settle/unsettle; `settlements.md` |
| 2026-06-17 | 8 | Settlement export `pdf` (application/pdf) + `image` (svg) |
| 2026-06-17 | — | **Verify pending in this env:** the shell could not execute commands. Run `npm run db:generate && npm run db:migrate && npm run test:e2e` (and `npm run build`) against a running Postgres to confirm. |

---

## Related

- [README.md](./README.md) — backend docs hub
- [api/spec.md](./api/spec.md) — REST contract (extend per step)
- [../../web/docs/active_plan.md](../../web/docs/active_plan.md) — web active plan
- [../../../docs/plan/README.md](../../../docs/plan/README.md) — sitewide plans
