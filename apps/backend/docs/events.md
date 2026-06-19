# Events

> Event lifecycle, join flow, and authorization for `/v1/events`.
> API contract → [api/spec.md](./api/spec.md) · Schema → [database/schema.md](./database/schema.md)

## Overview

An **event** is the shared pot for one occasion. The creator becomes the
**captain**. On create we, in one transaction:

1. Generate a unique 8-char `public_id` join code (ambiguous glyphs excluded).
2. Set `cover_image_url` from the event type default.
3. Add the creator to `event_members` as `captain`.
4. Seed the six default expense categories.

Defaults: `visibility = private`, `event_type = general`.

## Endpoints

| Method | Path | Access |
|--------|------|--------|
| POST | `/v1/events` | Any signed-in user |
| GET | `/v1/events?archived=` | Member |
| GET | `/v1/events/lookup/:publicId` | Signed-in user |
| POST | `/v1/events/join/:publicId` | Signed-in user |
| GET | `/v1/events/:id` | Member |
| PATCH | `/v1/events/:id` | Captain / Vice |
| DELETE | `/v1/events/:id` | Captain |
| POST | `/v1/events/:id/archive` · `/unarchive` | Captain / Vice |

`GET /v1/events/:id` returns the event plus `myRole` and `memberCount`.
Changing `eventType` on PATCH resets `cover_image_url` to that type's default.

## Join flow

- **Public event:** `POST /join/:publicId` adds the user as `member` immediately.
- **Private event:** creates a `join_request` with status `pending`. A captain
  or vice-captain approves (creates the membership) or rejects.

## Guards

`EventMemberGuard` resolves the event from `:id` / `:eventId`, verifies the
caller's membership, and attaches it for `@EventMember()`. `RolesGuard` enforces
`@Roles(...)`. Non-members receive `403`; unknown events `404`.

## Related

- [members-and-roles.md](./members-and-roles.md)
- [expenses.md](./expenses.md)
- [settlements.md](./settlements.md)
