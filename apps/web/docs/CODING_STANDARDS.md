# Spendbrains Web — Coding Standards

> **Detailed rules for HTML, React, JS/TS, styling, naming, imports, a11y, and performance.**  
> Hub → [README.md](./README.md)

| Doc version | 1.1 |

---

## Styling approach (read first)

| Layer | Rule |
|-------|------|
| **Values** | **Only** in `src/styles/tokens.css` — never hex/px in components |
| **Tailwind** | Token utilities from `@theme` in `index.css`: `bg-primary`, `text-text-secondary`, `rounded-xp-lg` |
| **SCSS modules** | `@use '../styles/tokens' as *;` → `$color-neutral-900`, `$radius-lg`, etc. (aliases to same CSS vars) |
| **New tokens** | Add to `tokens.css` → mirror in `_tokens.scss` → expose in `@theme` if needed |

Do not duplicate values across Tailwind and SCSS. Do not use raw `slate-*` / `red-*` Tailwind palette classes in app code.

---

## HTML standards

| Rule | Detail |
|------|--------|
| **Semantics** | Use the correct element for the job — `button` not `div onClick`, `nav`, `main`, `section`, `article`, `header`, `footer`. |
| **Document outline** | One `h1` per page; heading levels never skip (`h1` → `h3` without `h2`). |
| **Links vs buttons** | `<a href>` for navigation; `<button type="button|submit">` for actions. |
| **Forms** | Wrap related fields in `<form>`; submit via `onSubmit`; prevent default explicitly. |
| **Inputs** | Match `type`, `inputMode`, `autoComplete`, `maxLength` to purpose (tel, OTP, email). |
| **Images** | `alt` required; decorative images use `alt=""`. |
| **IDs** | Unique per page; prefer associating labels with `htmlFor` + `id`. |
| **Lists** | Use `ul`/`ol` for list content; not div stacks. |

---

## React

| Rule | Detail |
|------|--------|
| **Components** | PascalCase function components; props typed with `type XProps = { ... }`. |
| **Children** | Type `children: React.ReactNode` when accepted. |
| **Events** | Handler names: `handleSubmit`, `onClick` props for reusable components. |
| **Conditional render** | Prefer early return for loading/error; ternary only when branches are small. |
| **Fragments** | Use `<>...</>` when avoiding wrapper divs. |
| **Refs** | `useRef` for DOM focus and imperative APIs only — not as a state workaround. |
| **Context** | Split contexts by domain; avoid mega-context. |
| **StrictMode** | Keep enabled in development. |
| **No prop drilling > 2 levels** | Extract hook or context instead. |

```tsx
// Preferred component shape
type ExpenseRowProps = {
  expense: Expense
  onSelect: (id: string) => void
}

export function ExpenseRow({ expense, onSelect }: ExpenseRowProps) {
  return (/* ... */)
}
```

---

## JavaScript / TypeScript

| Rule | Detail |
|------|--------|
| **Strict TS** | `"strict": true` in tsconfig; enable `noUncheckedIndexedAccess` when feasible. |
| **Exports** | Named exports for components, hooks, utilities. |
| **Enums** | Prefer `as const` objects or union types over TypeScript `enum`. |
| **Imports type** | Use `import type { X }` for type-only imports. |
| **Zod** | Schemas in `schemas/` or top of form files; infer types with `z.infer`. |
| **Errors** | Catch at boundaries; rethrow or map to user message. |
| **Dates/money** | Use backend ISO strings; format in UI layer; store/display ₹ consistently. |
| **No `console.log`** | Remove before merge; use intentional logging utilities if needed later. |

---

## SCSS

| Rule | Detail |
|------|--------|
| **File naming** | `ComponentName.module.scss` next to `ComponentName.tsx`. |
| **Import** | `import styles from './ComponentName.module.scss'` — access via `styles.root`. |
| **Class names** | camelCase in TS (`styles.primaryButton`); kebab-case in SCSS file (`.primary-button`). |
| **Tokens** | `@use '../styles/tokens' as *;` — variables from `_tokens.scss` (values in `tokens.css`) |
| **Nesting** | `&` for pseudo-states (`&:hover`, `&:focus-visible`); max depth 3. |
| **Global styles** | Only in `index.css` / `styles/global.scss` — resets, Tailwind, font-face. |
| **Mixins** | Shared patterns (focus ring, truncate) in `_mixins.scss`. |
| **Responsive** | `@media (min-width: $bp-md) { ... }` using token variables. |

```scss
// ComponentName.module.scss
@use '../../styles/tokens' as *;

.root {
  padding: $space-6;
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  background: $color-surface-raised;

  &:focus-within {
    box-shadow: $shadow-focus;
  }
}
```

**Tailwind coexistence:** Use Tailwind for flex/grid/spacing utilities in JSX when it speeds layout; use SCSS modules for complex component visuals, states, and animations. Do not duplicate the same styles in both.

---

## Naming conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Components | PascalCase | `ProfileEditForm` |
| Hooks | camelCase, `use` prefix | `useEventMembers` |
| Functions | camelCase | `normalizeIndianPhone` |
| Constants | UPPER_SNAKE or camelCase | `INDIAN_PHONE_E164_REGEX` |
| Types / interfaces | PascalCase | `UserProfile`, `ApiError` |
| Zod schemas | camelCase + `Schema` | `sendOtpSchema` |
| Query keys | camelCase factory | `eventKeys.detail(id)` |
| CSS module classes | camelCase in TS | `styles.errorMessage` |
| Routes | kebab-case paths | `/app/events/:eventId` |
| Env vars | `VITE_` prefix | `VITE_API_URL` |

---

## File naming conventions

| Type | Pattern |
|------|---------|
| Component | `ExpenseRow.tsx` + `ExpenseRow.module.scss` |
| Page | `LoginPage.tsx` in `pages/` or `features/*/pages/` |
| Hook | `useAuth.ts` |
| Utility | `phone.ts`, `auth-storage.ts` |
| Types | `auth.ts`, `event.ts` in `types/` or feature folder |
| Test | `ExpenseRow.test.tsx` adjacent to source |
| Barrel files | Avoid `index.ts` re-export barrels unless `components/ui/` |

---

## Import conventions

Order imports in this sequence, blank line between groups:

1. React / external libraries
2. Internal aliases (`@/...` when configured) or relative `../lib`, `../components`
3. Types (`import type`)
4. Styles (`import styles from './X.module.scss'`)

```tsx
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { ApiError, sendOtp } from '../lib/api'
import type { UserProfile } from '../types/auth'

import styles from './LoginForm.module.scss'
```

| Rule | Detail |
|------|--------|
| **Relative paths** | Prefer relative imports within a feature; avoid deep `../../../` — refactor structure instead. |
| **No default re-export chains** | Import from the defining file. |
| **Tree shaking** | Import named exports from libraries. |

---

## Accessibility

Requirements summary → [DESIGN_SYSTEM.md#accessibility-design-guidelines](./DESIGN_SYSTEM.md#accessibility-design-guidelines). Implementation rules:

- `aria-busy="true"` on containers during loading when content is replaced.
- `disabled` buttons during pending mutations; do not rely on disabled alone for errors.
- OTP inputs: `inputMode="numeric"`, `autoComplete="one-time-code"`.
- Phone inputs: `type="tel"`, `autoComplete="tel"`.
- Modal focus trap and return focus on close (when modals are added).
- Skip link to main content on authenticated layouts.

---

## Performance best practices

| Practice | Detail |
|----------|--------|
| **Query staleTime** | Set sensible defaults per resource; profile data can cache longer than live balances. |
| **Lazy routes** | `React.lazy(() => import('./features/events/pages/EventsPage'))` |
| **Lists** | Virtualize only when > ~100 rows; not before needed. |
| **Images** | Explicit width/height or aspect-ratio to prevent CLS. |
| **Debouncing** | Search inputs debounced 300ms. |
| **Avoid inline objects in deps** | Stable callbacks when passed to memoized children (profile first). |

---

## Anti-patterns to avoid

| Anti-pattern | Why | Instead |
|--------------|-----|---------|
| `useEffect` + `fetch` for API data | Race conditions, no cache | TanStack Query |
| God components (500+ lines) | Untestable, unmaintainable | Split by concern |
| Prop drilling auth everywhere | Fragile | Route guards + query hooks |
| Inline hex colors / random spacing | Inconsistent UI | `src/styles/tokens.css` |
| Raw Tailwind palette (`slate-*`, `red-*`) | Bypasses theme | Token utilities (`bg-primary`, `text-error-text`) |
| `any` types | Defeats TS | Proper types or `unknown` + narrow |
| Index as React key in editable lists | Broken updates | Stable ids |
| Client-side settlement math | Wrong vs server | Display API results |
| Global CSS classes in features | Collisions | CSS modules |
| Placeholder-only labels | Fails a11y | Visible labels |
| Copy-paste API error handling | Inconsistent UX | Central `ApiError` handling |
| New dependency for one function | Bundle bloat | Native API or small local util |
| Bootstrap-style primary blue everywhere | Generic look | Follow [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) |

---

## Related documents

- [AI_CONSTITUTION.md](./AI_CONSTITUTION.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
