# Spendbrains — Agent Development Guide

> **Single source of truth for humans and Cursor agents working in this monorepo.**  
> Read this first. Follow links for detail — do not guess conventions or APIs.

| Doc version | 1.0 |

---

## Repository map

| Path | Role | Agent docs |
|------|------|------------|
| `docs/` | Product, plan, ops | [README.md](./README.md) · [app-story.md](./app-story.md) |
| `apps/backend/` | NestJS API | [docs/README.md](../apps/backend/docs/README.md) |
| `apps/web/` | React SPA (Phase 1) | [docs/README.md](../apps/web/docs/README.md) |

**Layout:** npm workspaces (`apps/*`). Backend `http://localhost:3000` · Web `http://localhost:5173`.

---

## Mandatory reading by task

### Web UI (`apps/web`)

Read in order before generating or changing frontend code:

1. [apps/web/docs/AI_CONSTITUTION.md](../apps/web/docs/AI_CONSTITUTION.md) — principles and boundaries
2. [apps/web/docs/ARCHITECTURE.md](../apps/web/docs/ARCHITECTURE.md) — structure, routing, state, API layer
3. [apps/web/docs/DESIGN_SYSTEM.md](../apps/web/docs/DESIGN_SYSTEM.md) — visual language (when touching UI)
4. [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) — page layouts, navigation, skeletons, semantic HTML (when touching UI)
5. [apps/web/docs/CODING_STANDARDS.md](../apps/web/docs/CODING_STANDARDS.md) — HTML, React, TS, styling rules
6. [apps/web/docs/TESTING_STRATEGY.md](../apps/web/docs/TESTING_STRATEGY.md) — when adding tests
7. [apps/web/docs/DECISIONS.md](../apps/web/docs/DECISIONS.md) — recorded choices (W###)

Cross-check:

- Product behavior → [app-story.md](./app-story.md)
- Auth & users API → [apps/backend/docs/authentication.md](../apps/backend/docs/authentication.md)
- REST contract → [apps/backend/docs/api/spec.md](../apps/backend/docs/api/spec.md)

### Backend API (`apps/backend`)

1. **[apps/backend/docs/active_plan.md](../apps/backend/docs/active_plan.md)** — current implementation plan; update checkboxes as you complete steps
2. [apps/backend/docs/architecture.md](../apps/backend/docs/architecture.md)
3. [apps/backend/docs/authentication.md](../apps/backend/docs/authentication.md) (auth + `GET`/`PATCH /v1/users/me`)
4. [apps/backend/docs/database/schema.md](../apps/backend/docs/database/schema.md)
5. [apps/backend/docs/api/spec.md](../apps/backend/docs/api/spec.md)

Cross-check: [app-story.md](./app-story.md) for domain rules.

### Web UI — active plan

When doing planned web feature work (beyond the auth shell), read **[apps/web/docs/active_plan.md](../apps/web/docs/active_plan.md)** first.

---

## Git workflow

| Branch | Use |
|--------|-----|
| `develop` | Target for every feature PR |
| `master` | Production releases only (`develop` → `master`) |

Details → [ops/branching.md](./ops/branching.md)

---

## Non‑negotiable rules

| Rule | Detail |
|------|--------|
| **Docs before code** | If docs and code disagree, fix docs in the same change or flag the conflict. |
| **Minimal diff** | Change only what the task requires. No drive-by refactors. |
| **No invented APIs** | Endpoints and DTOs must match backend docs and Swagger (`GET /apis`). |
| **No invented UI tokens** | Use `src/styles/tokens.css` and [DESIGN_SYSTEM.md](../apps/web/docs/DESIGN_SYSTEM.md); no hex in components. |
| **No ad-hoc layouts** | Shell, landmarks, and page patterns → [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md); reuse `AppShell`, `PageLayout`, `PageHeader`. |
| **Server is authoritative** | Settlement math, permissions, and business rules live in the backend. UI displays API results. |
| **HTTP via `lib/api.ts`** | No scattered `fetch` in web components. Auth refresh is centralized there (W006). |
| **New web patterns** | Record in [DECISIONS.md](../apps/web/docs/DECISIONS.md) before wide adoption. |
| **No ad-hoc doc files** | Extend canonical docs; do not add feature-level READMEs unless asked. |
| **Active plans** | Backend → `apps/backend/docs/active_plan.md` · Web → `apps/web/docs/active_plan.md` · Sitewide → `docs/plan/` |
| **Secrets** | Never commit `.env`. |

---

## Current implementation snapshot (Phase 1 shell)

| Area | Status |
|------|--------|
| Auth | OTP login at `/login`; tokens in `localStorage`; refresh on 401 in `api.ts` |
| Profile | View + edit at `/app` (`GET`/`PATCH /v1/users/me`); preset avatars only |
| Web styling | `src/styles/tokens.css` — single token file; Tailwind + SCSS share names |
| Web structure | Flat `pages/`, `components/`, `lib/` — migrate to `features/` when touching code (W005) |
| Web tests | Vitest not wired yet; manual E2E → [apps/web/README.md](../apps/web/README.md) |
| Backend users | `GET`/`PATCH /v1/users/me` implemented; R2 upload deferred |

---

## Pre-submit checklist

Use for human review and agent self-check:

### Correctness
- [ ] Matches [app-story.md](./app-story.md) for scope touched
- [ ] API calls use documented endpoints and `lib/api.ts` patterns
- [ ] Forms validated with Zod; loading, empty, and error states handled

### Web quality
- [ ] Follows [ARCHITECTURE.md](../apps/web/docs/ARCHITECTURE.md) layer boundaries
- [ ] Follows [CODING_STANDARDS.md](../apps/web/docs/CODING_STANDARDS.md)
- [ ] UI follows [DESIGN_SYSTEM.md](../apps/web/docs/DESIGN_SYSTEM.md); WCAG 2.1 AA basics (labels, focus, keyboard)
- [ ] New/changed screens follow [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) (semantic HTML, loading/empty states, shell)

### Backend quality
- [ ] DTOs validated; Swagger updated for new routes
- [ ] Prisma changes include migrations

### Documentation
- [ ] Canonical docs updated if behavior, conventions, or APIs changed
- [ ] [DECISIONS.md](../apps/web/docs/DECISIONS.md) entry if new frontend technical choice

### Testing
- [ ] Tests per [TESTING_STRATEGY.md](../apps/web/docs/TESTING_STRATEGY.md), or manual smoke path noted in PR/task

---

## Document index

| Doc | Purpose |
|-----|---------|
| [app-story.md](./app-story.md) | Product behavior (plain language) |
| [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) | Page layouts, navigation, skeletons, semantic HTML |
| [plan/tech-stack.md](./plan/tech-stack.md) | Approved stack TD1–TD11 |
| [plan/tech-decisions.md](./plan/tech-decisions.md) | TD index |
| [apps/web/docs/README.md](../apps/web/docs/README.md) | Web engineering docs hub |
| [apps/web/README.md](../apps/web/README.md) | Web setup, run, manual E2E checklist |
| [apps/backend/docs/README.md](../apps/backend/docs/README.md) | Backend docs hub |
| [apps/backend/docs/active_plan.md](../apps/backend/docs/active_plan.md) | Backend active implementation plan |
| [apps/web/docs/active_plan.md](../apps/web/docs/active_plan.md) | Web active implementation plan |

**When in doubt: read the linked doc. Do not guess.**
