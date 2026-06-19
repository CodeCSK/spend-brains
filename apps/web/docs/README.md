# Spendbrains Web — Documentation Hub

> **Canonical engineering docs for `apps/web`.**  
> Setup and manual testing → [../README.md](../README.md) · Monorepo agent guide → [../../../docs/AGENTS.md](../../../docs/AGENTS.md)

| Doc version | 1.0 |

---

## Active plan (agents)

| Doc | Purpose |
|-----|---------|
| **[active_plan.md](./active_plan.md)** | Web Phase 2 — **Component architecture** (Active); replaces Phase 1 (Complete 2026-06-19) |

Sitewide roadmaps → [../../../docs/plan/README.md](../../../docs/plan/README.md)

---

## Read order (agents and contributors)

| # | Doc | When to read |
|---|-----|--------------|
| 1 | [AI_CONSTITUTION.md](./AI_CONSTITUTION.md) | Always — principles and boundaries |
| 2 | [ARCHITECTURE.md](./ARCHITECTURE.md) | Structure, routing, state, API layer |
| 3 | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Any UI work — tokens, typography, color |
| 4 | [LAYOUT_SYSTEM.md](../../../docs/LAYOUT_SYSTEM.md) | Any UI work — layouts, nav, skeletons, semantic HTML |
| 5 | [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Implementation details |
| 6 | [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | Adding or changing tests |
| 7 | [DECISIONS.md](./DECISIONS.md) | Before introducing new patterns (W###) |
| — | [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) | UI primitives — Storybook index |

---

## External references

| Topic | Doc |
|-------|-----|
| Product behavior | [docs/app-story.md](../../../docs/app-story.md) |
| Layout & navigation | [docs/LAYOUT_SYSTEM.md](../../../docs/LAYOUT_SYSTEM.md) |
| Auth API | [backend/docs/authentication.md](../../backend/docs/authentication.md) |
| REST contract | [backend/docs/api/spec.md](../../backend/docs/api/spec.md) |
| Stack decisions (TD4, TD10, TD11) | [docs/plan/tech-stack.md](../../../docs/plan/tech-stack.md) |
| Cursor rules entry | [.cursor/rules.md](../../../.cursor/rules.md) |

---

## Doc roles (avoid duplication)

| File | Owns | Does not own |
|------|------|--------------|
| [../README.md](../README.md) | Install, run, env vars, **manual E2E checklist** | Architecture, design tokens, coding rules |
| **This hub** | Links and read order | — |
| [AI_CONSTITUTION.md](./AI_CONSTITUTION.md) | Philosophy, boundaries, doc policy | Detailed coding rules, test matrices |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder layout, layers, routing, state | Visual design, product copy |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Tokens, typography, components, a11y design | Page layouts, routing |
| [LAYOUT_SYSTEM.md](../../../docs/LAYOUT_SYSTEM.md) | Shell, landmarks, nav, skeletons, per-page layouts | Tokens, color, API shapes |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | HTML, React, TS, styling code rules, a11y implementation | Product requirements |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | Automated test approach | Manual E2E steps (see app README) |
| [DECISIONS.md](./DECISIONS.md) | W### decision log | Duplicate architecture prose |
| [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) | Storybook component index | Token values (see DESIGN_SYSTEM) |
