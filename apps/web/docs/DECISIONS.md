# Spendbrains Web — Technical Decisions

> **Record of frontend architecture and implementation decisions.**  
> New decisions get an entry here before or with the code that implements them.  
> Hub → [README.md](./README.md)

| Doc version | 1.0 |
|-------------|-----|

---

## How to use this document

1. Copy the **template** below for each new decision.
2. Assign the next `W###` ID (web-specific; backend uses its own ADRs).
3. Set status: `Proposed` → `Accepted` → `Superseded` (link to replacement).
4. Update [ARCHITECTURE.md](./ARCHITECTURE.md) or other docs if the decision changes documented patterns.

---

## Decision template

```markdown
### W### — Title (short)

| Field | Value |
|-------|-------|
| **Status** | Proposed / Accepted / Superseded |
| **Date** | YYYY-MM-DD |
| **Context** | What problem or choice prompted this? |
| **Decision** | What we chose. |
| **Alternatives considered** | What else was evaluated? |
| **Consequences** | Positive and negative outcomes. |
| **Related** | Links to docs, PRs, backend TD IDs |
```

---

## Decision index

| ID | Title | Status |
|----|-------|--------|
| [W001](#w001-stack-react--vite--typescript-spa) | React + Vite + TypeScript SPA | Accepted |
| [W002](#w002-styling-tailwind--scss-modules) | Styling: Tailwind + SCSS modules | Accepted |
| [W003](#w003-server-state-tanstack-query) | Server state: TanStack Query | Accepted |
| [W004](#w004-forms-react-hook-form--zod) | Forms: react-hook-form + Zod | Accepted |
| [W005](#w005-feature-based-folder-structure) | Feature-based folder structure | Accepted |
| [W006](#w006-auth-token-storage-and-refresh) | Auth token storage and refresh | Accepted |
| [W007](#w007-ui-primitives-shadcnui) | UI primitives: shadcn/ui | Proposed |
| [W008](#w008-typography-outfit) | Typography: Outfit (variable) | Accepted |
| [W009](#w009-icons-lucide) | Icons: Lucide | Accepted |
| [W010](#w010-client-ui-state-redux-toolkit) | Client UI state: Redux Toolkit | Accepted |
| [W011](#w011-component-docs-storybook) | Component docs: Storybook + Vite | Accepted |

---

## W001 — Stack: React + Vite + TypeScript SPA

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-16 |
| **Context** | Phase 1 client is browser-only; app is behind login; API is separate NestJS service. Need fast dev experience and static deploy to Cloudflare Pages. |
| **Decision** | Use **React 19 + Vite 8 + TypeScript** as a client-rendered SPA. No Next.js SSR for v1. |
| **Alternatives considered** | Next.js (unnecessary SSR complexity); Vue/Svelte (team/plan standard is React). |
| **Consequences** | Simple static hosting; SEO not a priority for authenticated app. Client handles routing entirely. Aligns with monorepo TD4. |
| **Related** | [../../../docs/plan/tech-stack.md](../../../docs/plan/tech-stack.md) TD4 · [ARCHITECTURE.md](./ARCHITECTURE.md) |

---

## W002 — Styling: Tailwind + SCSS modules

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-16 |
| **Context** | TD10 approves Tailwind + shadcn/ui. Need component-level styling discipline and canonical design tokens. **Current auth shell uses Tailwind utilities only** — SCSS modules not yet introduced. |
| **Decision** | **Tailwind v4** for layout utilities. **SCSS modules** for complex component presentation. **All values** in `src/styles/tokens.css`; SCSS uses `_tokens.scss` aliases (`$color-*` → `var(--color-*)`). Tailwind `@theme inline` in `index.css` references the same CSS variables. |
| **Alternatives considered** | Tailwind-only (harder to maintain complex components); CSS-in-JS (runtime cost, extra deps); global SCSS (naming collisions). |
| **Consequences** | Hybrid approach requires clear rules ([CODING_STANDARDS.md](./CODING_STANDARDS.md#scss)). Migrate inline styles to modules incrementally. |
| **Related** | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) · TD10 |

---

## W003 — Server state: TanStack Query

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-16 |
| **Context** | SPA fetches REST JSON for profile, events, expenses. Need caching, loading/error states, and mutation invalidation. |
| **Decision** | **TanStack Query v5** for all server/async state. No manual `useEffect` fetch for API resources. |
| **Alternatives considered** | Redux Toolkit Query (heavier); SWR (less mutation tooling); raw fetch + Context (no cache discipline). |
| **Consequences** | Consistent patterns via query/mutation hooks. Requires query key conventions per feature. |
| **Related** | [ARCHITECTURE.md](./ARCHITECTURE.md#state-management-guidelines) |

---

## W004 — Forms: react-hook-form + Zod

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-16 |
| **Context** | OTP login, profile edit, future expense forms need client validation aligned with API rules. |
| **Decision** | **react-hook-form** for form state; **Zod** schemas with `@hookform/resolvers/zod` for validation. |
| **Alternatives considered** | Formik (more boilerplate); Yup (less TS-native than Zod); uncontrolled forms only (insufficient for complex validation). |
| **Consequences** | Schemas live in feature folders; share types via `z.infer`. Keep schemas in sync with backend DTOs manually until OpenAPI codegen is adopted. |
| **Related** | `LoginPage.tsx`, `ProfileEditForm.tsx` |

---

## W005 — Feature-based folder structure

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-16 |
| **Context** | Initial shell uses flat `pages/` and `components/`. Product grows with events, expenses, settlements, members — flat structure will not scale. |
| **Decision** | New code goes in **`src/features/<feature>/`** with colocated pages, components, hooks, schemas. Existing flat files migrate when touched. Shared UI in `components/ui/`. |
| **Alternatives considered** | Type-based folders only (`components/`, `hooks/`); monolithic `screens/` folder. |
| **Consequences** | Gradual migration; no big-bang refactor. Cross-feature imports restricted to shared layers. |
| **Related** | [ARCHITECTURE.md](./ARCHITECTURE.md#recommended-folder-structure) |

---

## W006 — Auth token storage and refresh

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-16 |
| **Context** | JWT access (~15 min) + refresh tokens from OTP verify. SPA must retry failed requests and redirect on auth loss. |
| **Decision** | Store tokens in **`localStorage`** via `lib/auth-storage.ts`. Central **`apiFetch`** attaches Bearer token, refreshes on 401 once, redirects to `/login` on refresh failure. |
| **Alternatives considered** | HttpOnly cookies (requires CSRF/cookie API changes); memory-only tokens (lost on refresh). |
| **Consequences** | XSS is the primary token exposure risk — follow security hygiene; no secrets in client. Matches current backend contract for web client. |
| **Related** | [../README.md](../README.md) · [../../backend/docs/authentication.md](../../backend/docs/authentication.md) |

---

## W007 — UI primitives: shadcn/ui

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-06-16 |
| **Context** | TD10 specifies shadcn/ui. Not yet installed in repo; auth shell uses hand-rolled Tailwind markup. |
| **Decision** | Adopt **shadcn/ui** for accessible primitives (Button, Input, Dialog, Dropdown). Theme components to [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) tokens — not default shadcn styling. |
| **Alternatives considered** | Headless UI only (more assembly work); MUI/Chakra (heavier, generic look). |
| **Consequences** | Components copied into `components/ui/`; full ownership. Install when building first shared form beyond auth shell. |
| **Related** | TD10 · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md#component-consistency-guidelines) |

---

## W008 — Typography: Outfit (variable)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-15 |
| **Context** | Need a geometric UI font similar to Sansation — modern, trustworthy, distinctive — with better long-term support: variable weights, self-hosted, Flutter-ready. |
| **Decision** | **[Outfit](https://fonts.google.com/specimen/Outfit)** variable via `@fontsource-variable/outfit`. `--font-sans` in `tokens.css`; `import '@fontsource-variable/outfit/wght.css'` in `main.tsx`. |
| **Alternatives considered** | Sansation (chosen first — limited weights, no variable); Montserrat (more common); Inter (generic fintech). |
| **Consequences** | Sansation-like geometric feel; **variable font** (100–900) so `font-medium` / `font-semibold` render natively. Pairs with Lucide. Use `.tabular-amount` on ₹ columns. Flutter Phase 2: same family via Google Fonts. |
| **Related** | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) · W009 |

---

## W009 — Icons: Lucide

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-15 |
| **Context** | Need one consistent icon set for receipts, groups, settlements, nav — aligned with shadcn/ui path (W007) and calm geometric UI. |
| **Decision** | **[Lucide React](https://lucide.dev/)** (`lucide-react`). Default stroke 1.5. Sizes 16 / 20 / 24 via `components/Icon.tsx`. |
| **Alternatives considered** | Phosphor (softer, heavier API); Heroicons (smaller set); Material Symbols (generic). |
| **Consequences** | Tree-shakeable imports; MIT license. Use `IndianRupee` icon sparingly — amounts are text with `.tabular-amount`. Icon-only buttons require `label` prop on `Icon` or visible text. |
| **Related** | W007 · W008 · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |

---

## W010 — Client UI state: Redux Toolkit

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-19 |
| **Context** | Phase 2 needs cross-cutting client UI: confirm dialogs (replacing `window.confirm`), toast queue, theme preference. ARCHITECTURE previously said "Avoid Redux" — that applied before a dedicated client-state layer was needed; W003 already owns server/async state. |
| **Decision** | **Redux Toolkit** for **client UI state only** (`lib/store/`). Slices: `ui` (confirm dialog), `toast`, `theme`. **TanStack Query remains** for all server/API data (W003 unchanged). Auth tokens stay in `lib/auth-storage.ts` (W006). |
| **Alternatives considered** | React Context only (prop drilling / re-render issues for global modals); RTK Query replacing TanStack Query (large migration, duplicate cache); Zustand (not in stack docs). |
| **Consequences** | Provider mounts in Step 5; features use `useAppDispatch` / `useAppSelector` for UI only. Never duplicate query cache in Redux. |
| **Related** | W003 · W006 · [active_plan.md](./active_plan.md) Phase 2 · [ARCHITECTURE.md](./ARCHITECTURE.md#state-management) |

---

## W011 — Component docs: Storybook

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-19 |
| **Context** | Phase 1 UI uses global CSS classes (`xp-btn-*`, `xp-card`) inline across features. Phase 2 extracts React primitives; agents and designers need a living catalog with token-aware previews. |
| **Decision** | **Storybook 8** with **`@storybook/react-vite`**, sharing Vite + Tailwind + `tokens.css` with the app. Stories colocated with `components/ui/*.stories.tsx`. Scripts: `storybook`, `storybook:build`. |
| **Alternatives considered** | Ladle (lighter, less ecosystem); Styleguidist (legacy); docs-only markdown (no interactive preview). |
| **Consequences** | Each new ui primitive ships with a story (Phase 2 plan). Optional CI gate via `storybook:build`. W007 shadcn deferred — thin token wrappers first. |
| **Related** | W007 · W002 · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) · [active_plan.md](./active_plan.md) Phase 2 Step 7 |

---

## Superseded decisions

_None yet. When superseding, move the entry here with a link to the replacement ID._

---

## Related documents

- [AI_CONSTITUTION.md](./AI_CONSTITUTION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [../../../docs/plan/tech-decisions.md](../../../docs/plan/tech-decisions.md) (monorepo TD index)
