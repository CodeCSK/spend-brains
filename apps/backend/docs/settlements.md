# Settlements

> Server-side debt computation, mark-settled, and export.
> Math runs on the server only — clients display results.

## Computation

1. **Net balance per member** = total paid − total fair share (integer paise).
2. **Greedy minimum-payment matching:** repeatedly settle the largest debtor
   against the largest creditor → at most `n − 1` payment lines.
3. Persist `settlement_lines` with the bumped `computation_version`.

### Recompute behaviour when expenses change

On any expense create/update/delete the graph is **fully regenerated**: existing
lines are deleted and recreated as unsettled, and `computation_version` is
bumped. **Previously settled marks are cleared** — a captain / vice-captain must
re-mark lines as settled after expenses change. This keeps the displayed
"who pays whom" always consistent with current expenses.

## Endpoints

| Method | Path | Access |
|--------|------|--------|
| GET | `/v1/events/:id/summaries` | Member |
| GET | `/v1/events/:id/settlements` | Member |
| POST | `/v1/events/:id/settlements/:lineId/settle` | Captain / Vice |
| POST | `/v1/events/:id/settlements/:lineId/unsettle` | Captain / Vice |
| GET | `/v1/events/:id/settlements/export?format=pdf\|image` | Member |

`GET /summaries` returns per-member `totalPaid`, `totalShare`, `netBalance`.

`GET /settlements` returns `totalSpent`, `settledAmount`, `outstandingAmount`,
`status` (`unsettled` / `partial` / `settled`), `settledCount` / `totalCount`,
the payment `lines`, and per-member `balances`.

## Export

Settlement **details only** (not the full expense list):

- `format=pdf` → `application/pdf` (hand-built minimal PDF, no native deps)
- `format=image` → `image/svg+xml`

## Related

- [expenses.md](./expenses.md)
- [api/spec.md](./api/spec.md)
