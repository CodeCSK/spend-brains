# Spendbrains — Database Schema

> PostgreSQL + Prisma. India-first, INR only in v1.  
> Product → [../../../docs/app-story.md](../../../docs/app-story.md) · Architecture → [../architecture.md](../architecture.md)

## Conventions

| Rule | Value |
|------|-------|
| Primary keys | `UUID` (v4 or v7) |
| Timestamps | `created_at`, `updated_at` (UTC) |
| Money | `DECIMAL(12, 2)` in **INR** |
| Currency column | v2 (multi-currency) |

---

## Entity relationship overview

```text
users ─────────────┬── event_members ─── events
                   │                        │
                   │                        ├── expenses ─── expense_shares
                   │                        ├── event_expense_categories
                   │                        ├── settlement_lines
                   │                        └── join_requests
                   ├── refresh_tokens
                   └── avatar_url (R2)
```

---

## Tables

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `phone` | VARCHAR(15) UNIQUE | E.164, +91 |
| `phone_verified_at` | TIMESTAMPTZ | |
| `display_name` | VARCHAR(100) | |
| `avatar_url` | TEXT NULL | R2 URL |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

**v2:** `apple_id`, `google_id`, `email`, `deleted_at`

### `refresh_tokens`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `token_hash` | VARCHAR | Hashed |
| `expires_at` | TIMESTAMPTZ | ~30 days |
| `revoked_at` | TIMESTAMPTZ NULL | Logout |

### `events`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `public_id` | VARCHAR(8) UNIQUE | Join ID |
| `name` | VARCHAR(200) | Required |
| `description` | TEXT NULL | |
| `location` | VARCHAR(300) NULL | |
| `start_date` / `end_date` | DATE | |
| `event_type` | ENUM | `general` default |
| `cover_image_url` | TEXT NULL | v1: from type |
| `visibility` | ENUM | `private`, `public` |
| `is_archived` | BOOLEAN | UI filter |
| `captain_id` | UUID FK | |

**Event types:** `general`, `vacation`, `corporate`, `ritual`, `roommate`, `travel`, `party`

### `event_members`

| Column | Type | Notes |
|--------|------|-------|
| `event_id` | UUID FK | |
| `user_id` | UUID FK | |
| `role` | ENUM | `captain`, `vice_captain`, `member` |

Unique: `(event_id, user_id)`

### `join_requests`

| Column | Type | Notes |
|--------|------|-------|
| `event_id`, `user_id` | UUID FK | |
| `status` | ENUM | `pending`, `approved`, `rejected` |
| `reviewed_by` | UUID FK NULL | Captain or V-c |
| `reviewed_at` | TIMESTAMPTZ NULL | Set on approve/reject |

### `event_expense_categories`

| Column | Type | Notes |
|--------|------|-------|
| `event_id` | UUID FK | |
| `name` | VARCHAR(50) | |
| `icon` | VARCHAR(50) | Icon key |
| `is_default` | BOOLEAN | |

### `expenses`

| Column | Type | Notes |
|--------|------|-------|
| `event_id` | UUID FK | |
| `created_by` | UUID FK | Edit/delete rules |
| `description` | VARCHAR(500) | |
| `amount` | DECIMAL(12,2) | INR |
| `paid_by` | UUID FK | |
| `expense_date` | DATE | |
| `category_id` | UUID FK | |
| `notes` | TEXT NULL | |

**v2:** `receipt_url`, `payment_method`

### `expense_shares`

Equal split v1 — one row per participant with `amount` `DECIMAL(12,2)` (leftover paise distributed to the first participants so shares sum to the total). Unique: `(expense_id, user_id)`

### `settlement_lines`

| Column | Type | Notes |
|--------|------|-------|
| `from_user_id` / `to_user_id` | UUID FK | Who pays whom |
| `amount` | DECIMAL(12,2) | |
| `is_settled` | BOOLEAN | |
| `settled_by` | UUID FK NULL | Captain or V-c |
| `settled_at` | TIMESTAMPTZ NULL | Set when marked settled |
| `computation_version` | INT | Bump on expense change; lines regenerate and settled marks clear |

### `otp_codes`

Hashed code, phone, expires_at, attempts — never store plain OTP.

---

## Settlement computation (v1)

1. Net balance per member  
2. Greedy minimum-payment matching  
3. Persist `settlement_lines`  

---

## Migrations

Prisma Migrate · deploy: `prisma migrate deploy` on release

---

## Related documents

- [../architecture.md](../architecture.md)
- [../api/spec.md](../api/spec.md)
