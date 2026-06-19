# Spendbrains — API Specification

> REST JSON · `/v1` · Base URL TBD (`https://api.spendbrains.app`)  
> Product → [../../../../docs/app-story.md](../../../../docs/app-story.md) · Hub → [README.md](./README.md)

## Conventions

| Item | Value |
|------|-------|
| Format | JSON |
| Auth | `Authorization: Bearer <access_token>` |
| Pagination | `?page=1&limit=20` |
| Sorting | `?sort=expense_date&order=desc` |

Interactive docs at `/apis` when the server is running.

---

## Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/auth/otp/send` | Send OTP |
| POST | `/v1/auth/otp/verify` | Verify → tokens |
| POST | `/v1/auth/refresh` | Refresh token |
| POST | `/v1/auth/logout` | Logout device |
| POST | `/v1/auth/logout-all` | Logout all devices |

---

## Users

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/v1/users/me` | Bearer | Profile |
| PATCH | `/v1/users/me` | Bearer | `displayName`, `avatarUrl` |

## Events

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/v1/events` | Member | Create; creator = captain; seeds categories; `visibility` default `private`, `event_type` default `general` |
| GET | `/v1/events` | Member | Events the user belongs to; `?archived=true|false` |
| GET | `/v1/events/lookup/:publicId` | Bearer | Preview by join code |
| POST | `/v1/events/join/:publicId` | Bearer | Public → join; private → pending request |
| GET | `/v1/events/:id` | Member | Detail + `myRole` + `memberCount` |
| PATCH | `/v1/events/:id` | Captain / Vice | Type change resets `cover_image_url` |
| DELETE | `/v1/events/:id` | Captain | Cascade delete (`204`) |
| POST | `/v1/events/:id/archive` | Captain / Vice | |
| POST | `/v1/events/:id/unarchive` | Captain / Vice | |

## Join requests (private events)

| Method | Path | Access |
|--------|------|--------|
| GET | `/v1/events/:id/join-requests` | Captain / Vice |
| POST | `/v1/events/:id/join-requests/:requestId/approve` | Captain / Vice |
| POST | `/v1/events/:id/join-requests/:requestId/reject` | Captain / Vice |

## Members

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/v1/events/:id/members` | Member | Profile snippet + role |
| POST | `/v1/events/:id/members` | Captain / Vice | Add existing user by `phone` |
| PATCH | `/v1/events/:id/members/:userId` | Captain | Set `vice_captain` / `member` |
| DELETE | `/v1/events/:id/members/:userId` | Captain | Cannot remove captain (`204`) |

## Categories

| Method | Path | Access |
|--------|------|--------|
| GET | `/v1/events/:id/categories` | Member |
| POST | `/v1/events/:id/categories` | Captain / Vice |
| PATCH | `/v1/events/:id/categories/:categoryId` | Captain / Vice |
| DELETE | `/v1/events/:id/categories/:categoryId` | Captain (rejected if expenses reference it) |

## Expenses

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/v1/events/:id/expenses` | Member | Equal split across `sharedAmong` → `expense_shares` |
| GET | `/v1/events/:id/expenses` | Member | Pagination + filters |
| GET | `/v1/events/:id/expenses/:expenseId` | Member | Includes shares |
| PATCH | `/v1/events/:id/expenses/:expenseId` | Captain/Vice any; member own | Recomputes settlements |
| DELETE | `/v1/events/:id/expenses/:expenseId` | Captain or owner | Recomputes settlements (`204`) |

**Expense list params:** `page`, `limit`, `sort` (`expenseDate`/`amount`/`createdAt`/`description`), `order` (`asc`/`desc`), `categoryId`, `paidBy`, `dateFrom`, `dateTo`, `search`

## Summaries & Settlements

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/v1/events/:id/summaries` | Member | Per member: `totalPaid`, `totalShare`, `netBalance` |
| GET | `/v1/events/:id/settlements` | Member | Summary (total/settled/outstanding/status/progress) + lines + balances |
| POST | `/v1/events/:id/settlements/:lineId/settle` | Captain / Vice | |
| POST | `/v1/events/:id/settlements/:lineId/unsettle` | Captain / Vice | |
| GET | `/v1/events/:id/settlements/export?format=pdf\|image` | Member | `pdf` → `application/pdf`; `image` → `image/svg+xml` |

Settlement math (net balance → greedy minimum-payment matching) runs **server-side only**. Changing expenses regenerates lines and clears prior settled marks (`computation_version` bumps).

---

## Authorization matrix

| Action | Captain | Vice-captain | Member |
|--------|---------|--------------|--------|
| Delete event | ✅ | ❌ | ❌ |
| Archive event | ✅ | ✅ | ❌ |
| Delete expense | ✅ | ❌ | Own only |
| Edit any expense | ✅ | ✅ | Own only |
| Mark settled | ✅ | ✅ | ❌ |

Business rules → [../../../../docs/app-story.md](../../../../docs/app-story.md)

---

## Phase 2/3 auth (future)

- `POST /v1/auth/apple` · `POST /v1/auth/google`

---

## Related documents

- [../database/schema.md](../database/schema.md)
- [../../../../docs/ops/security-and-dpdp.md](../../../../docs/ops/security-and-dpdp.md)
- [../architecture.md](../architecture.md)
