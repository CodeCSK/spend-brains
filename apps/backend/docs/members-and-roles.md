# Members & roles

> Roles, membership management, and join-request review.
> Product rules → [../../docs/app-story.md](../../docs/app-story.md)

## Roles

| Role | Members / event | Categories | Expenses |
|------|-----------------|------------|----------|
| **Captain** | Full incl. delete + assign roles | Add / edit / delete | Add / edit / delete any |
| **Vice-captain** | Add / edit (no remove) | Add / edit | Add / edit any (no delete) |
| **Member** | Join only | — | Add / edit / delete **own** |

Role logic lives in `src/common/permissions/event-permissions.ts` and is enforced
by `RolesGuard` (`@Roles()`) plus per-row ownership checks for expenses.

## Join requests (private events)

| Method | Path | Access |
|--------|------|--------|
| GET | `/v1/events/:id/join-requests` | Captain / Vice |
| POST | `/v1/events/:id/join-requests/:requestId/approve` | Captain / Vice |
| POST | `/v1/events/:id/join-requests/:requestId/reject` | Captain / Vice |

Approve sets the request `approved` and upserts an `event_members` row
(idempotent). Reject sets `rejected`. Both stamp `reviewed_by` / `reviewed_at`.

## Member management

| Method | Path | Access | Rule |
|--------|------|--------|------|
| GET | `/v1/events/:id/members` | Member | Profile snippet + role |
| POST | `/v1/events/:id/members` | Captain / Vice | Add an **existing** Spendbrains user by phone |
| PATCH | `/v1/events/:id/members/:userId` | Captain | Set `vice_captain` / `member` |
| DELETE | `/v1/events/:id/members/:userId` | Captain | Cannot remove the captain |

Adding by phone requires the person to already have an account (no off-platform
invites in v1). The captain's role cannot be changed or removed via these routes.

## Related

- [events.md](./events.md)
- [api/spec.md](./api/spec.md)
