# Spendbrains Web

> Engineering docs → [docs/README.md](./docs/README.md) · Agent guide → [../../docs/AGENTS.md](../../docs/AGENTS.md)

React SPA for OTP auth, shared events, expenses, settlements, and export against the Spendbrains backend.

## Prerequisites

- Node.js 20+
- Backend at `http://localhost:3000` — see [apps/backend/README.md](../backend/README.md)

Local OTP testing (backend `.env`):

```env
TURNSTILE_ENABLED=false
MSG91_AUTH_KEY=your-msg91-auth-key
# optional: OTP_FIXED_CODE=123456
```

OTP appears in the **backend terminal** (placeholder MSG91 key) or via SMS in production.

## Setup & run

From monorepo root:

```bash
cp apps/web/.env.example apps/web/.env
npm install
npm run start:dev -w backend   # terminal 1
npm run dev -w web             # terminal 2
```

Open **http://localhost:5173**. CORS must allow `http://localhost:5173` (default in backend `.env.example`).

| URL | Purpose |
|-----|---------|
| `/login` | Send OTP → verify OTP |
| `/app` | Redirect → `/app/events` |
| `/app/events` | Event list (active / archived) + create / join |
| `/app/events/new` | Create event |
| `/app/join` | Join by public code |
| `/app/events/:eventId/expenses` | Expense list (default tab) |
| `/app/events/:eventId/expenses/new` | Add expense |
| `/app/events/:eventId/expenses/:expenseId/edit` | Edit expense |
| `/app/events/:eventId/members` | Members, join requests, categories |
| `/app/events/:eventId/settlements` | Balances, payment lines, export |
| `/app/events/:eventId/settings` | Edit event, archive, delete |
| `/app/profile` | Profile view + edit |

Full route map → [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#routing)

## Auth flow (manual smoke)

1. Enter phone (`+91`, `91`, or 10 digits) and consent → **Send OTP**
2. Copy OTP from backend logs → **Verify OTP** → tokens in `localStorage`
3. Lands on `/app/events` → open **Profile** in nav → edit display name + preset avatar → **Save profile**
4. **Logout** → `/login`; unauthenticated `/app/*` redirects to login
5. Same phone → OTP → login → profile persisted
6. **Token refresh:** set `JWT_ACCESS_EXPIRES_IN=30s` in backend `.env`, wait, reload `/app/profile` — profile loads via silent refresh

API details → [backend/docs/authentication.md](../backend/docs/authentication.md)

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend base URL |

Do not commit `.env`.

## Scripts

```bash
npm run dev -w web
npm run build -w web
npm run preview -w web
npm run lint -w web              # ESLint + feature ui-class guardrail
npm run storybook -w web          # Component catalog at http://localhost:6006
npm run storybook:build -w web    # Static catalog → apps/web/storybook-static/
```

### Storybook

Interactive catalog for `components/ui` and design foundations (tokens, typography, icons).

```bash
npm run storybook -w web
```

Component index → [docs/COMPONENT_CATALOG.md](./docs/COMPONENT_CATALOG.md)

**CI (optional):** Add `npm run storybook:build -w web` and `npm run lint -w web` as gates to catch broken stories or raw `xp-*` classes in features before merge.

## E2E test checklist

Use two browser profiles or devices (User A = captain, User B = member). Keep DevTools console open; there should be no errors during the flows below.

### Auth & profile

1. New phone → OTP → lands on `/app/events`
2. Profile → set display name + sample avatar → save → changes persist after reload
3. Logout → `/login`; `/app/events` redirects when not authenticated
4. Same phone → OTP → login → name/avatar still saved
5. After access token expiry → `/app/profile` still loads via refresh token retry

### Full product loop (two users)

**User A (captain)**

6. Create event (public visibility) → appears on `/app/events` → opens expenses tab
7. Members tab → add User B by phone → User B appears as member
8. Expenses tab → add expense (equal split, all members) → appears in list with ₹ formatting
9. Settlements tab → summary + payment lines reflect the expense → **Mark settled** on one line → progress updates
10. Export PDF (or image) → file downloads
11. Settings tab → archive event → event leaves **Active** list → appears under **Archived**

**User B (member)**

12. Login → **Join event** with public code (or skip if added in step 7)
13. Open same event → add own expense → visible to User A
14. Settlements tab → can view balances and export; **Mark settled** controls hidden (captain/vice only)
15. Settings tab → read-only message (no edit/archive/delete)

**Optional flows**

16. Private event: User B requests join → User A approves on Members tab
17. Captain promotes member to vice → vice can manage members and settle
18. Member edits own expense; captain can edit/delete any expense
19. Unarchive event on Settings → returns to Active list

Automated testing approach → [docs/TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md)
