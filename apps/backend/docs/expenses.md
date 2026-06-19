# Expenses

> Expense CRUD, equal split, and the filtered list for `/v1/events/:id/expenses`.
> Categories and settlements: [settlements.md](./settlements.md)

## Equal split (v1)

An expense is split **equally** across the `sharedAmong` user IDs. We compute in
integer paise to avoid float drift: `base = floor(total / n)`, then distribute
the leftover paise one each to the first participants so shares sum exactly to
the total. Example: ₹1200 among 3 → three `expense_shares` of ₹400.00.

Every create/update/delete recomputes settlements **in the same transaction**.

## Endpoints

| Method | Path | Access |
|--------|------|--------|
| POST | `/v1/events/:id/expenses` | Any member |
| GET | `/v1/events/:id/expenses` | Any member |
| GET | `/v1/events/:id/expenses/:expenseId` | Any member |
| PATCH | `/v1/events/:id/expenses/:expenseId` | Captain/Vice any · member own only |
| DELETE | `/v1/events/:id/expenses/:expenseId` | Captain or owner only |

Validation: `categoryId` must belong to the event; `paidBy` and every
`sharedAmong` id must be event members.

## List parameters

`page` (default 1), `limit` (default 20, max 100), `sort`
(`expenseDate` | `amount` | `createdAt` | `description`), `order` (`asc` | `desc`),
`categoryId`, `paidBy`, `dateFrom`, `dateTo`, `search` (case-insensitive on
description). Response is `{ data, meta: { page, limit, total, totalPages } }`.

## Categories

| Method | Path | Access |
|--------|------|--------|
| GET | `/v1/events/:id/categories` | Member |
| POST | `/v1/events/:id/categories` | Captain / Vice |
| PATCH | `/v1/events/:id/categories/:categoryId` | Captain / Vice |
| DELETE | `/v1/events/:id/categories/:categoryId` | Captain (rejected if expenses reference it) |

## Related

- [settlements.md](./settlements.md)
- [members-and-roles.md](./members-and-roles.md)
