# Component catalog

> **Storybook index for `components/ui`.**  
> Run locally: `npm run storybook -w web` → http://localhost:6006  
> Static build: `npm run storybook:build -w web` → `apps/web/storybook-static/`

| Doc version | 1.0 |

---

## Foundation (design reference)

| Story | Purpose |
|-------|---------|
| **Foundation / Design Tokens** | Color swatches, radius, elevation from `tokens.css` |
| **Foundation / Typography** | Type scale, weights, global heading classes |
| **Foundation / Icon Gallery** | Lucide icons via shared `Icon` wrapper |

Design token source → [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## UI primitives (`src/components/ui/`)

Each export from `components/ui/index.ts` has a Storybook entry under **UI/** with `autodocs` enabled.

| Component | Story path | Notes |
|-----------|------------|-------|
| Alert | UI / Alert | Variants: info, success, warning, error |
| Avatar | UI / Avatar | Sizes: sm, md, lg |
| BackLink | UI / BackLink | Router link with arrow |
| Badge | UI / Badge | Role/status variants |
| Button | UI / Button | primary, secondary, ghost, destructive; link mode |
| Card | UI / Card | Card, CardHeader, CardBody, CardFooter |
| Checkbox | UI / Checkbox | Form checkbox |
| Chip | UI / Chip | Bordered tag; optional mono |
| ConfirmDialog | UI / ConfirmDialog | Redux-backed; use `withReduxProvider` |
| Dialog | UI / Dialog | Modal base |
| FormField | UI / FormField | Label + error wrapper |
| Input | UI / Input | Text input |
| List | UI / List | List + ListItem |
| Pagination | UI / Pagination | Prev/next pager |
| Progress | UI / Progress | Settlement-style progress bar |
| Select | UI / Select | Native select styled |
| SegmentedControl | UI / SegmentedControl | Active/archived toggle pattern |
| Skeleton | UI / Skeleton | Loading placeholders |
| Tabs | UI / Tabs | Tab + Tabs (icon support) |
| Textarea | UI / Textarea | Multi-line input |
| Toast | UI / Toast | Variants + interactive queue demo |
| ToastContainer | UI / ToastContainer | Redux-backed fixed stack |

---

## Shared helpers (not in ui barrel)

| Component | Location | Story |
|-----------|----------|-------|
| Icon | `src/components/Icon.tsx` | Foundation / Icon Gallery |
| PageLayout, PageHeader, … | `src/components/layout/` | — (feature-level; migrate in Phase 2 steps 8–9) |

---

## Conventions

- **Import:** Features import from `components/ui`, not raw `xp-*` classes (migration in progress).
- **Stories:** Co-located as `ComponentName.stories.tsx` next to the component.
- **Redux stories:** Dialog, ConfirmDialog, and Toast use `storybook-decorators.tsx` (`withReduxProvider`).
- **Router stories:** Button (link mode), BackLink, Tabs use `MemoryRouter` in decorators.

---

## Related

- [active_plan.md](./active_plan.md) — Web Phase 2 component architecture
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — Tokens and visual language
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Folder layers and state split
