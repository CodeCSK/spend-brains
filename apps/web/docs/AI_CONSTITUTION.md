# Spendbrains Web — AI Constitution

> **Binding principles for humans and AI agents working on `apps/web`.**  
> Hub → [README.md](./README.md) · Monorepo guide → [../../../docs/AGENTS.md](../../../docs/AGENTS.md)

| Doc version | 1.1 |

---

## Project philosophy

Spendbrains is a **premium, mobile-first expense-tracking SPA** for Indian groups (trips, roommates, events). The web client is Phase 1; it must feel fast, trustworthy, and polished — not like a generic admin template.

| Belief | Rule |
|--------|------|
| **Justified code** | Every line serves a user need, a documented pattern, or measurable quality (a11y, performance, maintainability). |
| **Docs are truth** | Read docs first; update docs when reality changes. See [doc policy](#documentation-policy). |
| **Small slices** | One well-built feature beats three half-finished screens. |
| **Server authoritative** | Settlement math, permissions, and business rules live in the backend. UI displays and submits. |
| **Consistency** | Match existing conventions before introducing new abstractions. |

---

## Engineering principles

| Principle | Rule |
|-----------|------|
| **Minimal diff** | Change only what the task requires. No drive-by refactors. |
| **Feature cohesion** | Group by product feature (`features/<name>/`), not only by technical type. |
| **Colocation** | Components, hooks, styles, and tests live near the feature they serve. |
| **Explicit boundaries** | Named exports, typed props, Zod at form/API boundaries. |
| **Composition** | Small components and hooks composed upward — no deep inheritance. |
| **Fail visibly** | Surface API and validation errors; avoid silent failures. |

Implementation detail → [CODING_STANDARDS.md](./CODING_STANDARDS.md) · Structure → [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Accessibility & performance (summary)

| Area | Target | Detail |
|------|--------|--------|
| **Accessibility** | WCAG 2.1 AA | Semantic HTML, keyboard access, visible focus, labeled forms, 44×44px touch targets |
| **Performance** | Core Web Vitals | LCP < 2.5s, INP < 200ms, CLS < 0.1; TanStack Query caching; lazy routes when bundle grows |

Full guidelines → [DESIGN_SYSTEM.md#accessibility-design-guidelines](./DESIGN_SYSTEM.md#accessibility-design-guidelines) · [CODING_STANDARDS.md#accessibility](./CODING_STANDARDS.md#accessibility) · [CODING_STANDARDS.md#performance-best-practices](./CODING_STANDARDS.md#performance-best-practices)

---

## Stack (approved — do not substitute without DECISIONS entry)

| Layer | Choice | Decision |
|-------|--------|----------|
| Framework | React 19 + TypeScript | W001 |
| Build | Vite 8 | W001 |
| Routing | React Router v7 | W001 |
| Server state | TanStack Query | W003 |
| Client UI state | Redux Toolkit (`lib/store/`) | W010 |
| Forms | react-hook-form + Zod | W004 |
| Styling | Tailwind utilities + SCSS modules · values in `src/styles/tokens.css` |
| HTTP | `lib/api.ts` | W006 |
| UI primitives | `components/ui/` + Storybook | W011 · W007 deferred |

Full index → [DECISIONS.md](./DECISIONS.md)

---

## Documentation policy

| When | Action |
|------|--------|
| **Before coding** | Follow read order in [README.md](./README.md) or [docs/AGENTS.md](../../../docs/AGENTS.md) |
| **New pattern** | [DECISIONS.md](./DECISIONS.md) entry before widespread use |
| **Architecture change** | Update [DECISIONS.md](./DECISIONS.md) + [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Design token change** | Update `src/styles/tokens.css` + `_tokens.scss` mirror + [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |
| **API integration** | [backend API docs](../../backend/docs/api/README.md) — no guessed endpoints |
| **Stale docs** | Fix in the same change as the code |

Do **not** create ad-hoc README files in feature folders unless explicitly requested.

---

## Pre-submit review

Use the canonical checklist in [docs/AGENTS.md#pre-submit-checklist](../../../docs/AGENTS.md#pre-submit-checklist).

---

## Related documents

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Web docs hub |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Structure and data flow |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Visual language |
| [LAYOUT_SYSTEM.md](../../../docs/LAYOUT_SYSTEM.md) | Page layouts, navigation, skeletons |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Detailed coding rules |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | Test approach |
| [DECISIONS.md](./DECISIONS.md) | W### decision log |
| [../README.md](../README.md) | Setup and manual E2E |
