# Spendbrains Web — Architecture

> **How the React SPA is structured and how layers interact.**  
> Hub → [README.md](./README.md)

| Doc version | 1.4 |

---

## Overview

```text
Browser (Cloudflare Pages)
    │
    ▼
React SPA (Vite + TypeScript)
    ├── React Router — routing & guards
    ├── TanStack Query — server state & cache
    ├── Redux Toolkit — client UI state (toasts, confirm dialog, theme)
    ├── react-hook-form + Zod — form state & validation
    └── lib/api/ — HTTP client (auth refresh, errors)
            │
            ▼ HTTPS JSON /v1/*
        NestJS API (apps/backend)
```

**Deployment:** Static build from `apps/web`; env via `VITE_API_URL`.  
**Auth:** JWT access + refresh in `localStorage`; silent refresh in `apiFetch` (W006).  
**Product reference:** [app-story.md](../../../docs/app-story.md)

---

## Folder structure

```text
apps/web/src/
├── main.tsx              # Redux Provider, QueryClient, BrowserRouter
├── App.tsx               # Routes + ConfirmDialog + ToastContainer
├── index.css             # Tailwind + @theme → tokens.css
├── styles/
│   ├── tokens.css        # ★ All style values
│   └── _tokens.scss      # SCSS aliases
├── stories/              # Storybook foundation (tokens, typography, icons)
├── pages/
│   └── LoginPage.tsx     # OTP send + verify
├── components/
│   ├── ui/               # Primitives — import from here in features (W011)
│   │   ├── Button.tsx, Card.tsx, Badge.tsx, Alert.tsx, …
│   │   ├── FormField.tsx, Input.tsx, Select.tsx, Textarea.tsx, Checkbox.tsx
│   │   ├── Tabs.tsx, SegmentedControl.tsx, BackLink.tsx
│   │   ├── Avatar.tsx, List.tsx, Progress.tsx, Skeleton.tsx
│   │   ├── Dialog.tsx, ConfirmDialog.tsx, Toast.tsx, ToastContainer.tsx
│   │   ├── Pagination.tsx, Chip.tsx
│   │   └── *.stories.tsx
│   ├── AppShell.tsx      # Authenticated layout (header, nav, logout)
│   ├── Icon.tsx          # Lucide wrapper
│   ├── ProtectedRoute.tsx
│   ├── ProfileEditForm.tsx
│   └── layout/           # PageLayout, PageHeader, EmptyState, PageSection
├── features/
│   ├── profile/pages/ProfilePage.tsx
│   ├── events/           # list, create, join, settings, EventLayout tabs
│   ├── expenses/         # list, create, edit
│   ├── categories/       # manage section on Members tab
│   ├── members/          # list, add, roles, join requests
│   └── settlements/      # summary, lines, export
├── lib/
│   ├── api/              # apiFetch + domain modules
│   ├── auth-storage.ts
│   ├── cn.ts             # className helper (ui/)
│   ├── format-inr.ts
│   ├── query-keys.ts
│   ├── phone.ts
│   ├── avatar-presets.ts
│   └── store/            # Redux Toolkit — client UI only (W010)
│       ├── index.ts
│       ├── hooks.ts      # useAppDispatch, useAppSelector
│       ├── useConfirm.ts
│       ├── useToast.ts
│       └── slices/       # ui, toast, theme
└── types/                # DTOs mirroring backend responses
```

**Rule:** New work goes in `features/<name>/`. Reusable UI in `components/ui/`; layout shell in `components/layout/`.

**Styling:** Token file `styles/tokens.css` → Tailwind `@theme` + SCSS aliases. UI primitives wrap legacy `xp-*` CSS classes; **features import React components from `components/ui/`** — not raw `xp-btn-*` / `xp-card` / `xp-alert-*` (enforced by `npm run lint -w web`).

**Component catalog:** Storybook at `npm run storybook -w web` — index in [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md).

---

## Layer responsibilities

| Layer | Responsibility | May NOT |
|-------|----------------|---------|
| **Page** | Route layout, compose components, wire queries | Raw `fetch`; deep business rules |
| **Layout** | `PageLayout`, `AppShell`, `EmptyState` — landmarks + width | Feature business logic |
| **Feature component** | Feature UI, local UI state, call hooks/mutations | Import API directly (use `lib/api` + hooks) |
| **UI primitive** | Presentational building blocks (`components/ui/`) | Know routes, auth, or API |
| **Redux client UI** | Toasts, confirm dialog, theme stub (`lib/store/`) | Store server/API data |
| **Route guard** | Auth redirect (`ProtectedRoute`, `GuestRoute`) | Render feature UI |

If a component exceeds ~200 lines or mixes unrelated concerns, split it.

---

## Service layer (`lib/api/`)

All HTTP traffic goes through `apiFetch` and typed helpers in domain modules.

| Concern | Location |
|---------|----------|
| Base URL | `import.meta.env.VITE_API_URL` |
| Auth header | `apiFetch` when `auth: true` |
| Token refresh | Single retry on 401 → `POST /v1/auth/refresh`; redirect `/login` on failure |
| Errors | `ApiError` with `status` |
| DTO types | `types/` mirroring backend responses |
| Query keys | `lib/query-keys.ts` — `eventKeys`, `expenseKeys`, `settlementKeys` |
| ₹ formatting | `lib/format-inr.ts` — `formatInr()` + `.tabular-amount` class |

Split into `lib/api/auth.ts`, `lib/api/events.ts`, etc. Do not scatter `fetch()` in components.

**Implemented endpoints:**

| Function | Method | Path |
|----------|--------|------|
| `sendOtp` | POST | `/v1/auth/otp/send` |
| `verifyOtp` | POST | `/v1/auth/otp/verify` |
| `refreshSession` | POST | `/v1/auth/refresh` |
| `logout` | POST | `/v1/auth/logout` |
| `getMe` | GET | `/v1/users/me` |
| `updateMe` | PATCH | `/v1/users/me` |
| `listEvents` | GET | `/v1/events` |
| `createEvent` | POST | `/v1/events` |
| `getEvent` | GET | `/v1/events/:id` |
| `updateEvent` | PATCH | `/v1/events/:id` |
| `deleteEvent` | DELETE | `/v1/events/:id` |
| `archiveEvent` | POST | `/v1/events/:id/archive` |
| `unarchiveEvent` | POST | `/v1/events/:id/unarchive` |
| `lookupEvent` | GET | `/v1/events/lookup/:publicId` |
| `joinEvent` | POST | `/v1/events/join/:publicId` |
| `listMembers` | GET | `/v1/events/:id/members` |
| `addMember` | POST | `/v1/events/:id/members` |
| `updateMemberRole` | PATCH | `/v1/events/:id/members/:userId` |
| `removeMember` | DELETE | `/v1/events/:id/members/:userId` |
| `listJoinRequests` | GET | `/v1/events/:id/join-requests` |
| `approveJoinRequest` | POST | `/v1/events/:id/join-requests/:requestId/approve` |
| `rejectJoinRequest` | POST | `/v1/events/:id/join-requests/:requestId/reject` |
| `listCategories` | GET | `/v1/events/:id/categories` |
| `createCategory` | POST | `/v1/events/:id/categories` |
| `updateCategory` | PATCH | `/v1/events/:id/categories/:categoryId` |
| `deleteCategory` | DELETE | `/v1/events/:id/categories/:categoryId` |
| `listExpenses` | GET | `/v1/events/:id/expenses` |
| `getExpense` | GET | `/v1/events/:id/expenses/:expenseId` |
| `createExpense` | POST | `/v1/events/:id/expenses` |
| `updateExpense` | PATCH | `/v1/events/:id/expenses/:expenseId` |
| `deleteExpense` | DELETE | `/v1/events/:id/expenses/:expenseId` |
| `getMemberSummaries` | GET | `/v1/events/:id/summaries` |
| `getSettlements` | GET | `/v1/events/:id/settlements` |
| `settleLine` | POST | `/v1/events/:id/settlements/:lineId/settle` |
| `unsettleLine` | POST | `/v1/events/:id/settlements/:lineId/unsettle` |
| `exportSettlement` | GET | `/v1/events/:id/settlements/export?format=pdf\|image` |

Auth contract → [backend/docs/authentication.md](../../backend/docs/authentication.md)

---

## Routing

| Path | Guard | Purpose |
|------|-------|---------|
| `/` | — | Redirect → `/app` |
| `/login` | Guest | OTP sign-in |
| `/app` | Protected | Redirect → `/app/events` |
| `/app/events` | Protected | Event list (active/archived filter) + create CTA |
| `/app/events/new` | Protected | Create event form |
| `/app/join` | Protected | Join by public code |
| `/app/events/:eventId` | Protected | Redirect → `…/expenses` |
| `/app/events/:eventId/expenses` | Protected | Expense list |
| `/app/events/:eventId/expenses/new` | Protected | Add expense form |
| `/app/events/:eventId/expenses/:expenseId/edit` | Protected | Edit expense form |
| `/app/events/:eventId/members` | Protected | Members, join requests, categories |
| `/app/events/:eventId/settlements` | Protected | Settlements summary, lines, export |
| `/app/events/:eventId/settings` | Protected | Edit event, archive/unarchive, delete |
| `/app/profile` | Protected | Profile view + edit |
| `*` | — | Redirect → `/app` |

**Full route map:** [active_plan.md](./active_plan.md#target-routes-end-state)

**Conventions:** lowercase kebab-case paths; layout-route guards; lazy-load heavy routes when bundle grows.

---

## State management

| State | Tool |
|-------|------|
| Server/async | TanStack Query (`profileKeys.me`, `eventKeys`, etc.) — W003 |
| URL | React Router params/search |
| Forms | react-hook-form — W004 |
| Auth tokens | `lib/auth-storage.ts` — W006 |
| Client UI (global) | Redux Toolkit (`lib/store/`) — W010: confirm dialog, toasts, theme preference; hooks `useConfirm()`, `useToast()` |
| Feature-local UI | `useState` in components |

Do **not** store API entities in Redux or Context. Mutations invalidate related TanStack Query keys. `EventContext` remains for event-scoped layout data only.

---

## Scalability notes

| Area | Approach |
|------|----------|
| Code splitting | Lazy feature routes; shared `ui/` chunk |
| API growth | Split `lib/api/` by domain |
| i18n | react-i18next planned |
| Design tokens | `packages/design-tokens/` when Flutter starts (TD11) |
| Settlements UI | Display server-computed balances only — never client-side greedy matching |

---

## Related documents

- [README.md](./README.md)
- [AI_CONSTITUTION.md](./AI_CONSTITUTION.md)
- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
- [DECISIONS.md](./DECISIONS.md)
- [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)
- [../../backend/docs/architecture.md](../../backend/docs/architecture.md)
