# Active Plan — Web Phase 2 (Component Architecture)

> **Agent working doc.** Work steps here; file is **replaced** when the next web plan starts.  
> Hub → [README.md](./README.md) · Prior plan archived in git history (Phase 1 Complete 2026-06-19)

| Field | Value |
|-------|-------|
| **Plan** | Reusable UI component library, Redux client state, Storybook docs |
| **Status** | Complete |
| **Started** | 2026-06-19 |
| **Replaces** | Web Phase 1 (Login → Settle) — Complete |

---

## Goal

Refactor the shipped Phase 1 SPA so **every reusable UI pattern is a typed React component** in `components/ui/`, **features import primitives** (not raw `xp-*` classes), **Redux Toolkit** owns cross-cutting client UI state, and **Storybook** documents the design system for humans and agents.

**No product or API changes.** Visual parity with Phase 1 unless a component fix improves a11y.

```text
features/<name>/          → compose ui/ + domain logic + TanStack Query
components/ui/            → Button, Card, Tabs, Badge, Avatar, …
components/layout/        → PageLayout, AppShell (unchanged role)
lib/store/                → Redux slices (client UI only)
.storybook/ + *.stories   → component catalog
```

---

## Analysis (2026-06-19)

### Backend — no work required

Phase 1 REST API is **complete** ([backend active plan](../../backend/docs/active_plan.md)). All web UI reads server data via existing `lib/api/` modules. Settlement math, permissions, and DTO shapes stay server-authoritative.

| Area | Status | Web impact |
|------|--------|------------|
| Auth, users, events, members, categories, expenses, settlements | ✅ | Keep TanStack Query + `lib/api/` |
| Files (R2 presign) | ❌ stub | Out of scope — avatar upload still preset-only |

### Web — current component landscape

| Area | Status | Location / notes |
|------|--------|------------------|
| Feature pages & flows | ✅ Complete | `features/*/` — 6 domains, ~40 feature components |
| Layout shell | ✅ Partial | `AppShell`, `PageLayout`, `PageHeader`, `EmptyState` |
| Icon wrapper | ✅ | `components/Icon.tsx` (Lucide, W009) |
| Design tokens + global CSS patterns | ✅ | `styles/tokens.css`, `index.css` `@layer components` |
| **React UI primitives** | ❌ Missing | Buttons/cards/tabs are **CSS classes** (`xp-btn-primary`, `xp-card`, …) applied inline |
| **shadcn/ui** | Proposed (W007) | Not installed; hand-rolled Tailwind markup everywhere |
| **Redux** | ❌ Not implemented | ARCHITECTURE says "Avoid Redux" (W003 covers server state only) |
| **Storybook** | ❌ Not implemented | No devDependency, no stories |
| **SCSS modules** | Minimal | W002 approved but most components use Tailwind only |

### Duplication audit (extract to `components/ui/`)

| Pattern | Occurrences | Current | Target component |
|---------|-------------|---------|------------------|
| Button variants | ~50+ usages across 25 files | `xp-btn-primary/secondary/ghost` on `<button>` and `<Link>` | `Button` (+ `asChild` / `renderAs="link"`) |
| Card container | ~15 usages | `xp-card` class | `Card`, `CardHeader`, `CardBody` |
| Segmented filter tabs | 2 copies | `EventsPage` (active/archived), `EventSettlementsPage` (all/unsettled) | `SegmentedControl` |
| Route tab nav | 1 | `EventLayout` NavLink + `xp-tab-link-*` | `Tabs`, `TabList`, `Tab` (router-aware) |
| Badge / status pill | 5+ | Inline `rounded-xp-md bg-* px-2 py-0.5`, `EventRoleBadge` | `Badge` (variant: role, success, info, neutral) |
| Avatar circle | 4 | Copy-pasted `h-10/12 w-10/12 rounded-xp-full border…` | `Avatar` |
| Form field | All forms | Label + `xp-input` + error `<p>` repeated | `FormField`, `Input`, `Select`, `Textarea`, `Checkbox` |
| Alert / status | ~10 | `xp-alert-success/error`, inline status `<p>` | `Alert` (variant) |
| Back navigation | 4 | `xp-btn-ghost` + ArrowLeft + copy | `BackLink` |
| Confirm destructive action | 5 | `window.confirm(...)` | `ConfirmDialog` |
| List rows | members, expenses, categories, settlements | `<li className="xp-card flex…">` | `List`, `ListItem` (layout only; feature rows stay in features) |
| Pagination | 1 | `ExpensePagination` | Move generic bits to `Pagination`; keep expense wiring in feature |
| Progress bar | 1 | `SettlementSummaryCard` inline | `Progress` |
| Skeleton | 3+ | `xp-skeleton*` classes | `Skeleton` (shape variants) |
| Loading / empty / error | All pages | Ad-hoc copy | Reuse `EmptyState`; add `LoadingState`, `ErrorState` |

### State management — recommended split

| State type | Tool | Rationale |
|------------|------|-----------|
| Server/async (events, expenses, …) | **TanStack Query** (keep W003) | Already wired; cache + invalidation works |
| Auth tokens | `lib/auth-storage.ts` (keep W006) | Sync with `apiFetch` refresh |
| URL / filters | React Router params/search (keep) | Shareable, bookmarkable |
| Form drafts | react-hook-form (keep W004) | Colocated per form |
| **Global client UI** | **Redux Toolkit (new W010)** | Toasts, modal/confirm queue, theme preference, optional UI prefs |

**Do not** move TanStack Query cache into Redux. **Do not** duplicate server entities in slices.

Proposed slices:

| Slice | State |
|-------|-------|
| `ui` | `confirmDialog` (open, title, message, onConfirm), sidebar open (future) |
| `toast` | Queue of `{ id, variant, message }` |
| `theme` | `'light' \| 'system'` (prep for dark mode v2) |

Auth session *metadata* (e.g. `isAuthenticated` derived flag) may live in a thin `auth` slice **or** stay derived from `auth-storage` + profile query — prefer derivation unless multiple disconnected trees need sync.

---

## Agent instructions

1. Read prerequisites before each step.
2. Work **one step at a time** — visual parity smoke after each step.
3. Check boxes and append **Done log**; keep **Status** `Active` until Step 10 passes.
4. New UI primitives → `components/ui/` + Storybook story in same step.
5. Features **must not** add new raw `xp-btn-*` / `xp-card` in JSX after Step 1 lands — use `Button`, `Card`, etc.
6. Record **W010** (Redux client state) and **W011** (Storybook) in [DECISIONS.md](./DECISIONS.md); update [ARCHITECTURE.md](./ARCHITECTURE.md) state table.
7. Incremental migration: touch a feature file → replace inline patterns with ui imports in that file.
8. Run `npm run build` and `npm run storybook:build` before marking plan Complete.

---

## Prerequisites (every step)

| # | Doc |
|---|-----|
| 1 | [AI_CONSTITUTION.md](./AI_CONSTITUTION.md) |
| 2 | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| 3 | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| 4 | [LAYOUT_SYSTEM.md](../../../docs/LAYOUT_SYSTEM.md) |
| 5 | [CODING_STANDARDS.md](./CODING_STANDARDS.md) |
| 6 | [DECISIONS.md](./DECISIONS.md) |

---

## Target folder structure (end state)

```text
apps/web/src/
├── components/
│   ├── ui/                    # ★ NEW — all reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Tabs.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── Alert.tsx
│   │   ├── Dialog.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── List.tsx
│   │   ├── Pagination.tsx
│   │   ├── Progress.tsx
│   │   ├── Skeleton.tsx
│   │   ├── BackLink.tsx
│   │   └── index.ts            # explicit exports only
│   ├── layout/                 # existing — may consume ui/
│   ├── Icon.tsx                # keep; re-export from ui/ optional
│   └── AppShell.tsx
├── lib/
│   └── store/
│       ├── index.ts            # configureStore
│       ├── hooks.ts            # useAppDispatch, useAppSelector
│       └── slices/
│           ├── uiSlice.ts
│           ├── toastSlice.ts
│           └── themeSlice.ts
├── features/                   # domain components import from components/ui
└── stories/                    # or colocated *.stories.tsx next to ui/
    └── …
```

**CSS strategy:** Keep `xp-*` classes in `index.css` as the **single styling source**; React components apply them via `className` composition (same as today). Optionally migrate complex visuals to SCSS modules per W002 later — not required for this plan.

**shadcn/ui (W007):** Defer full shadcn install. Build thin wrappers first; evaluate shadcn for Dialog/Select accessibility in Step 3 if `ConfirmDialog` needs Radix. Theme any adopted shadcn vars to `tokens.css`.

---

## Out of scope (this plan)

| Item | When |
|------|------|
| New product features / routes | Phase 3+ |
| R2 avatar upload UI | Backend Files API plan |
| Replace TanStack Query with RTK Query | Avoid — W003 stays for server state |
| Full Vitest component test suite | [TESTING_STRATEGY.md](./TESTING_STRATEGY.md); Storybook interaction tests optional |
| Dark mode UI | Theme slice prep only |
| Flutter / design-tokens package | TD11 |

---

## Steps

### Step 0 — Decisions + scaffolding

**Goal:** Document choices; create empty `components/ui/` and `lib/store/`; no feature changes yet.

- [x] Add **W010 — Client UI state: Redux Toolkit** to DECISIONS.md (TanStack Query unchanged for server)
- [x] Add **W011 — Component docs: Storybook 8 + Vite** to DECISIONS.md
- [x] Update ARCHITECTURE.md state table (Redux for client UI; ui/ folder)
- [x] Create `components/ui/index.ts` barrel (explicit exports)
- [x] Create `lib/store/` with typed hooks stub

**Verify:** `npm run build` passes; docs consistent.

---

### Step 1 — Core primitives (Button, Card, Badge, Alert)

**Goal:** Highest-duplication components + stories.

- [x] `Button` — variants: `primary | secondary | ghost | destructive`; props: `loading`, `disabled`, `type`, polymorphic `as` (`button` | `Link`)
- [x] `Card` — `Card`, optional `CardHeader`, `CardBody`, `CardFooter`
- [x] `Badge` — variants: `neutral | success | info | warning | role`; migrate `EventRoleBadge` to use `Badge` internally
- [x] `Alert` — variants: `success | error | warning | info`; `role="status"` when live
- [x] Storybook stories for each (all variants, loading, disabled)
- [x] Migrate **LoginPage**, **ProfileEditForm**, **AppShell** to use `Button` / `Card` / `Alert`

**Verify:** Auth + profile flows unchanged visually; Storybook shows Button/Card/Badge/Alert.

---

### Step 2 — Form primitives (Input, Select, Textarea, Checkbox, FormField)

**Goal:** Unify form markup across auth, events, expenses, members, categories.

- [x] `FormField` — label, hint, error, `htmlFor` wiring, `aria-invalid`
- [x] `Input`, `Select`, `Textarea`, `Checkbox` — wrap `xp-input` patterns
- [x] Stories: default, error, disabled
- [x] Migrate **CreateEventPage**, **EditEventForm**, **AddMemberForm**, **AddCategoryForm**, **ExpenseForm** (field markup only)

**Verify:** Create event + add expense forms submit correctly; a11y labels preserved.

---

### Step 3 — Navigation primitives (Tabs, SegmentedControl, BackLink)

**Goal:** Replace duplicated tab UIs.

- [x] `Tabs` + `Tab` — supports React Router `NavLink` (`to` prop) for `EventLayout`
- [x] `SegmentedControl` — controlled `value` + `onChange`; options `{ value, label }[]`
- [x] `BackLink` — icon + label + `to`
- [x] Stories: router decorator for Tabs
- [x] Migrate **EventLayout**, **EventsPage**, **EventSettlementsPage**, expense create/edit back links

**Verify:** Tab URLs unchanged; active/archived and settlement filters work.

---

### Step 4 — Data display (Avatar, List, ListItem, Progress, Skeleton)

**Goal:** Shared row/list visuals.

- [x] `Avatar` — sizes `sm | md | lg`, image or fallback
- [x] `List` / `ListItem` — semantic `<ul>`/`<li>`, spacing only (no business logic)
- [x] `Progress` — value 0–100, optional label
- [x] `Skeleton` — `text | avatar | card | rect` shapes
- [x] Stories for all
- [x] Migrate **MemberRow**, **JoinRequestRow**, **MemberBalancesSection**, **SettlementSummaryCard**, loading states in **EventLayout**

**Verify:** Members list and settlement progress bar unchanged.

---

### Step 5 — Feedback + destructive flows (Dialog, ConfirmDialog, Toast)

**Goal:** Replace `window.confirm`; global toast via Redux.

- [x] Install/configure **Redux Toolkit** + `Provider` in `main.tsx`
- [x] `uiSlice` — confirm dialog state; `toastSlice` — message queue
- [x] `ConfirmDialog` — dispatches from slice; used by delete/remove flows
- [x] `Toast` + `ToastContainer` — render from store
- [x] `Dialog` base (modal focus trap if not using Radix yet)
- [x] Stories + Redux decorator for confirm/toast
- [x] Replace all 5 `window.confirm` call sites:
  - `EventDeleteSection`, `ExpenseForm`, `ExpenseRow`, `CategoryRow`, `MemberRow`
- [x] Optional: success toasts after mutations (replace inline success `<p>` where helpful)

**Verify:** Delete expense/member/category/event shows modal; confirm/cancel works; no `window.confirm` left in `src/`.

---

### Step 6 — Pagination + Chip

**Goal:** Extract remaining one-offs.

- [x] `Pagination` — generic prev/next + page numbers from **ExpensePagination**
- [x] `Chip` — bordered tag (event type, public id on **EventCard**)
- [x] Stories
- [x] Migrate **ExpensePagination**, **EventCard**

**Verify:** Expense list pagination unchanged.

---

### Step 7 — Storybook production setup

**Goal:** Documented, buildable component catalog.

- [x] Init Storybook (`@storybook/react-vite`) with Tailwind + `tokens.css` + Outfit font
- [x] Add scripts: `storybook`, `storybook:build`
- [x] Global preview: token swatches, typography page, icon gallery (Lucide via `Icon`)
- [x] Stories for **every** `components/ui/*` export
- [x] Add `docs/COMPONENT_CATALOG.md` — index linking Storybook stories (or embed autodocs)
- [x] CI note in README: optional `storybook:build` gate

**Verify:** `npm run storybook` loads; all ui components listed; autodocs render props table.

---

### Step 8 — Feature migration sweep (events + members)

**Goal:** No raw button/card classes in events/members features.

- [x] **EventsPage**, **EventCard**, **JoinEventPage**, **CreateEventPage**, **EventSettingsPage**, **EventAccessError**, archive/delete sections
- [x] **EventMembersPage**, **JoinRequestsSection**, **JoinRequestRow**, **AddMemberForm**
- [x] **EventCategoriesSection**, **CategoryRow**, **AddCategoryForm**, **CategoryIcon** (keep domain icon map in feature)

**Verify:** Full events + members E2E smoke (README checklist items 2–5).

---

### Step 9 — Feature migration sweep (expenses + settlements + profile)

**Goal:** Complete ui/ adoption in remaining features.

- [x] **EventExpensesPage**, **ExpenseRow**, **ExpenseFilters**, **ExpenseForm**, create/edit pages
- [x] **EventSettlementsPage**, **SettlementLineRow**, **SettlementSummaryCard**, **SettlementExportButtons**, **MemberBalancesSection**
- [x] **ProfilePage**, **ProfileEditForm** (if not done in Step 1)

**Verify:** Expenses + settlements E2E smoke (README items 6–8).

---

### Step 10 — Lint guardrails + docs sign-off

**Goal:** Prevent regression; close plan.

- [x] ESLint rule or custom script: flag `xp-btn-` / `xp-card` in `features/**` (allow in `components/ui` and `index.css`)
- [x] Grep audit: zero `window.confirm` in `src/`
- [x] Update ARCHITECTURE.md folder tree + layer table
- [x] Update DESIGN_SYSTEM.md component section to reference React components + Storybook
- [x] Update [../README.md](../README.md) — Storybook run instructions
- [x] Set plan **Status** → `Complete`

**Verify:** `npm run build` + `npm run storybook:build` + manual full E2E matrix pass.

---

## Component checklist (ui/)

| Component | Step | Story |
|-----------|------|-------|
| Button | 1 | ✅ |
| Card | 1 | ✅ |
| Badge | 1 | ✅ |
| Alert | 1 | ✅ |
| FormField | 2 | ✅ |
| Input | 2 | ✅ |
| Select | 2 | ✅ |
| Textarea | 2 | ✅ |
| Checkbox | 2 | ✅ |
| Tabs / Tab | 3 | ✅ |
| SegmentedControl | 3 | ✅ |
| BackLink | 3 | ✅ |
| Avatar | 4 | ✅ |
| List / ListItem | 4 | ✅ |
| Progress | 4 | ✅ |
| Skeleton | 4 | ✅ |
| Dialog | 5 | ✅ |
| ConfirmDialog | 5 | ✅ |
| Toast | 5 | ✅ |
| Pagination | 6 | ✅ |
| Chip | 6 | ✅ |

**Existing shared (keep, may wrap ui/):** `Icon`, `PageLayout`, `PageHeader`, `PageSection`, `EmptyState`, `AppShell`, `ProtectedRoute`, `AppLogo`

**Stay in features (compose ui/):** `EventCard`, `ExpenseRow`, `MemberRow`, `SettlementLineRow`, `CategoryRow`, `ExpenseForm`, etc.

---

## Redux checklist

| Item | Step |
|------|------|
| `@reduxjs/toolkit`, `react-redux` dependencies | 5 |
| `configureStore` + typed hooks | 5 |
| `Provider` in `main.tsx` | 5 |
| `uiSlice` (confirm dialog) | 5 |
| `toastSlice` | 5 |
| `themeSlice` (stub) | 5 |
| `useConfirm()` hook for features | 5 |
| `useToast()` hook for features | 5 |

---

## Manual smoke matrix (sign-off)

| # | Flow | Validates |
|---|------|-----------|
| 1 | Login + profile | Button, Input, Card, Alert |
| 2 | Events list + active/archived toggle | SegmentedControl, EventCard, Badge |
| 3 | Event detail tabs | Tabs, Avatar, List |
| 4 | Delete expense / member / category / event | ConfirmDialog, Toast |
| 5 | Settlements progress + export | Progress, Button |
| 6 | Storybook | All variants render with tokens |

---

## Done log

| Date | Step | Notes |
|------|------|-------|
| 2026-06-19 | 10 | lint guardrail script; ARCHITECTURE + DESIGN_SYSTEM sign-off; plan Complete |
| 2026-06-19 | 9 | Expenses, settlements, profile migrated to Button/Card/Alert/Badge/Avatar |
| 2026-06-19 | 8 | Events/members/categories migrated to Button, Card, Alert, BackLink; Card link+li; zero xp-btn/card/alert in scope |
| 2026-06-19 | 7 | Foundation stories (tokens, typography, icons); @storybook/addon-docs; COMPONENT_CATALOG.md |
| 2026-06-19 | 6 | Pagination + Chip primitives; ExpensePagination wrapper; EventCard chips migrated |
| 2026-06-19 | 5 | useToast hook; success toasts on all mutation flows (forms, rows, export, login OTP) |
| 2026-06-19 | 5 | Redux Toolkit + ui/toast/theme slices; Dialog, ConfirmDialog, Toast; replaced all window.confirm |
| 2026-06-19 | 4 | Avatar, List, ListItem, Progress, Skeleton + stories; migrated member/settlement rows, EventLayout loading |
| 2026-06-19 | 3 | Tabs, Tab, SegmentedControl, BackLink + stories; migrated EventLayout, EventsPage, Settlements, expense pages |
| 2026-06-19 | 2 | FormField, Input, Select, Textarea, Checkbox + stories; migrated 5 feature forms |
| 2026-06-19 | 1 | Button, Card, Badge, Alert + stories; migrated LoginPage, ProfileEditForm, AppShell, AuthCard, EventRoleBadge; Storybook 10 scaffold |
| 2026-06-19 | 0 | W010/W011 in DECISIONS; ARCHITECTURE + AI_CONSTITUTION updated; `components/ui/`, `lib/store/` scaffolded |
| 2026-06-19 | — | Plan activated from codebase audit; Phase 1 archived |

---

## Related

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [DECISIONS.md](./DECISIONS.md) — add W010, W011
- [../../backend/docs/active_plan.md](../../backend/docs/active_plan.md) — backend Complete (no changes)
