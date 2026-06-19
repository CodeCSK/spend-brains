# Spendbrains Web — Design System

> **Visual language, tokens, and UI consistency rules.**  
> Hub → [README.md](./README.md)

| Doc version | 1.3 |

---

## Token architecture (single source of truth)

**All style values live in one file:** `src/styles/tokens.css`

Change a value there → theme updates everywhere (Tailwind utilities, global CSS, SCSS modules).

```text
src/styles/tokens.css     ← ONLY file with hex/px/rem values (:root CSS variables)
        │
        ├── src/index.css           @import + @theme inline → Tailwind utilities
        └── src/styles/_tokens.scss SCSS aliases → $color-neutral-900: var(--color-neutral-900)
```

### Usage

| Layer | How |
|-------|-----|
| **Tailwind (JSX)** | Token-backed utilities: `bg-surface-page`, `text-text-primary`, `bg-primary`, `rounded-xp-lg` |
| **Global CSS** | `var(--color-neutral-900)`, `var(--shadow-focus)` |
| **SCSS modules** | `@use '../styles/tokens' as *;` then `color: $color-neutral-900;` |

**Rules for agents and contributors:**

- Do **not** add hex colors, raw px spacing, or one-off shadows in components.
- Add new tokens to `tokens.css` first, then wire in `index.css` `@theme` if Tailwind utilities are needed.
- Mirror new CSS variables in `_tokens.scss` with the **same name** (`$color-*`, `$space-*`, `$radius-*`).
- Semantic aliases (`--color-primary`, `--color-surface-page`) may reference primitives — change primitives or aliases to retheme.

### Theme change example

Remap semantics in `tokens.css` — components use aliases only:

```css
--color-primary: var(--color-lavender-purple-600);
--color-secondary: var(--color-lavender-purple-100);
--color-surface-page: var(--color-lavender-purple-50);
```

---

## Brand palette (lavender purple)

Full scale in `tokens.css` as `--color-lavender-purple-50` … `--color-lavender-purple-950`.

| Role | Token | Hex (500 ref) |
|------|-------|---------------|
| **Page background** | `--color-surface-page` | `#f3eef7` (50) |
| **Subtle fill** | `--color-surface-subtle` | `#e6ddee` (100) |
| **Cards** | `--color-surface-raised` | `#ffffff` |
| **Primary CTA** | `--color-primary` | `#6a428a` (600) |
| **Primary hover** | `--color-primary-hover` | `#4f3267` (700) |
| **Secondary CTA** | `--color-secondary` / `--color-secondary-fg` | 100 bg / 700 text |
| **Body text** | `--color-text-primary` | `#1a1122` (900) |
| **Secondary text** | `--color-text-secondary` | `#4f3267` (700) |
| **Borders** | `--color-border` | `#cebade` (200) |
| **Focus ring** | `--shadow-focus` | 500 @ 35% alpha |

Legacy `--color-neutral-*` aliases map to the same lavender-purple scale.

---

## Shared UI classes (legacy CSS)

Global classes in `index.css` `@layer components` — **used only inside `components/ui/`**, not in features:

| Class | Usage |
|-------|--------|
| `xp-page` / `xp-page-narrow` / `xp-auth-shell` | Responsive page width + padding |
| `xp-card` | Raised card surface → **`Card` component** |
| `xp-page-title` / `xp-page-subtitle` | Page headings |
| `xp-label` / `xp-input` | Form fields → **`FormField`**, **`Input`**, **`Select`**, etc. |
| `xp-btn-primary` / `xp-btn-secondary` / `xp-btn-ghost` | Actions → **`Button` component** |
| `xp-nav-link-*` | Header / bottom nav |
| `xp-alert-success` / `-error` / `-warning` | Status → **`Alert` component** |

Layout: mobile bottom nav (`AppShell`); desktop top nav. Min touch target 44px (`min-h-11`).

---

## React components + Storybook

**Features import from `components/ui/`** — see [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md).

```bash
npm run storybook -w web    # http://localhost:6006
npm run storybook:build -w web
```

| Category | Components |
|----------|------------|
| Actions | `Button`, `BackLink` |
| Surfaces | `Card`, `CardHeader`, `CardBody`, `CardFooter` |
| Feedback | `Alert`, `Toast`, `ToastContainer`, `Dialog`, `ConfirmDialog` |
| Forms | `FormField`, `Input`, `Select`, `Textarea`, `Checkbox` |
| Navigation | `Tabs`, `Tab`, `SegmentedControl`, `BackLink` |
| Data display | `Badge`, `Avatar`, `List`, `ListItem`, `Progress`, `Skeleton`, `Chip`, `Pagination` |

Foundation stories: **Design Tokens**, **Typography**, **Icon Gallery** (sidebar → Foundation).

**Client feedback:** `useToast()` and `useConfirm()` from `lib/store/` — global toast queue and promise-based confirm dialog (no `window.confirm`).

**Lint guardrail:** `npm run lint -w web` fails if `src/features/**` contains raw `xp-btn-`, `xp-card`, or `xp-alert-` classes.

---

## Logo & brand assets

Until final assets are delivered, `AppLogo` shows a brain placeholder and loads `public/brand/logo-mark.svg` when present.

**Provide these to lock branding site-wide:**

| Asset | Spec |
|-------|------|
| **Logo mark** (icon only) | SVG; octopus + brain concept; square artboard; 32×32 and 48×48 legible |
| **Logo lockup** (mark + wordmark) | Horizontal SVG; clear space = height of mark on all sides |
| **Wordmark** | “Spendbrains” in Outfit Semibold or outlined paths |
| **Favicon** | ICO/PNG 32×32, 180×180 apple-touch |
| **Brand colors** | Lavender purple scale in `tokens.css` |
| **On-dark variant** | Mark + wordmark for `--color-surface-inverse` contexts |
| **Minimum size** | Smallest legible mark width (e.g. 24px) |
| **Usage rules** | Don’t stretch, rotate, or change colors outside tokens |

Drop files in `public/brand/` — full checklist → [public/brand/README.md](../public/brand/README.md).

---

| Principle | Meaning |
|-----------|---------|
| **Clarity over decoration** | Every visual element communicates hierarchy or state. |
| **Generous whitespace** | Avoid cramped forms and tables. |
| **Subtle depth** | Light borders and soft shadows — not heavy skeuomorphism. |
| **Purposeful color** | Neutral base; accent and semantic colors for action and status only. |
| **Typography-led hierarchy** | Size, weight, and color — not boxes within boxes. |
| **Motion with restraint** | 150–250ms ease; respect `prefers-reduced-motion`. |
| **Mobile-first** | Thumb reach, single-column flows; enhance for desktop. |
| **Trustworthy finance UI** | Amounts prominent, aligned, scannable; errors clear but calm. |

**Anti-pattern:** Generic Bootstrap/admin look — saturated primary buttons, default blue links, arbitrary hex in components.

---

## Token reference

Full values in [`src/styles/tokens.css`](../src/styles/tokens.css). Summary:

### Neutrals

| Token | Usage |
|-------|-------|
| `--color-neutral-50` … `--color-neutral-950` | Lavender-purple scale (aliases) |

### Semantic colors

| Token | Usage |
|-------|-------|
| `--color-success-bg` / `--color-success-text` | Success banners |
| `--color-error-bg` / `--color-error-text` | Error banners, validation |
| `--color-warning-bg` / `--color-warning-text` | Warnings, prompts |
| `--color-accent-500` … `--color-accent-700` | Focus ring, secondary CTA |

### Semantic aliases (prefer in components)

| Token | Tailwind utility | Usage |
|-------|------------------|-------|
| `--color-surface-page` | `bg-surface-page` | Page background |
| `--color-surface-raised` | `bg-surface-raised` | Cards |
| `--color-text-primary` | `text-text-primary` | Body text |
| `--color-text-secondary` | `text-text-secondary` | Secondary copy |
| `--color-text-muted` | `text-text-muted` | Meta, hints |
| `--color-text-label` | `text-text-label` | Form labels |
| `--color-border` | `border-border` | Card borders |
| `--color-border-input` | `border-border-input` | Input borders |
| `--color-primary` | `bg-primary` | Primary button |
| `--color-primary-hover` | `hover:bg-primary-hover` | Button hover |
| `--color-primary-fg` | `text-primary-fg` | Text on primary |
| `--color-secondary` | `bg-secondary` | Secondary button fill |
| `--color-secondary-fg` | `text-secondary-fg` | Secondary button text |

### Spacing, radius, elevation

| Group | Tokens |
|-------|--------|
| Spacing | `--space-1` (4px) … `--space-16` (64px) |
| Radius | `--radius-sm` … `--radius-full` → Tailwind `rounded-xp-*` |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-focus` |

---

## Typography (W008)

| Item | Value |
|------|-------|
| **Family** | [Outfit](https://fonts.google.com/specimen/Outfit) — geometric sans (Sansation-like), variable |
| **Weights** | Variable 100–900; use `--font-weight-body` (400), `medium` (500), `semibold` (600), `bold` (700) |
| **Token** | `--font-sans` in `tokens.css` |
| **Loading** | `@fontsource-variable/outfit` imported in `main.tsx` (bypasses Tailwind CSS pipeline) |
| **Amounts** | Class `.tabular-amount` on ₹ columns |

**Pairing note:** Outfit’s geometric clarity matches Lucide’s 1.5px stroke — calm, modern, expense-app appropriate.

---

## Icons (W009)

| Item | Value |
|------|-------|
| **Library** | [Lucide](https://lucide.dev/) via `lucide-react` |
| **Wrapper** | `components/Icon.tsx` — sizes 16 / 20 / 24, stroke 1.5 |
| **Default size** | 20px inline; 24px nav / primary actions |
| **Color** | `text-text-muted` default; `text-accent-600` active; inherit on buttons |
| **A11y** | Decorative → no label; meaningful → pass `label` prop or visible text |

**Common Spendbrains icons:** `Receipt`, `Users`, `Wallet`, `IndianRupee`, `CirclePlus`, `LogOut`, `ChevronRight`, `Check`, `AlertCircle`

Import only icons you use (tree-shaking):

```tsx
import { LogOut } from 'lucide-react'
import { Icon } from '../components/Icon'

<Icon icon={LogOut} size={20} className="text-text-muted" />
```

---

## Component guidelines

### Buttons → `Button`

| Variant | Prop |
|---------|------|
| Primary | `variant="primary"` (default) |
| Secondary | `variant="secondary"` |
| Ghost | `variant="ghost"` |
| Destructive | `variant="destructive"` |
| Link | `as="link"` + `to="/path"` |

One primary per section. Use `loading` prop for pending state.

### Inputs → `FormField` + `Input` / `Select` / `Textarea`

- Wrap controls in `FormField` with `label`, optional `error`, optional `hint`
- Primitives apply `xp-input` styling and focus rings
- Min height 44px on mobile
- Errors: pass `error` to `FormField`; sets `aria-invalid` on control

### Cards → `Card`

`Card` wraps `xp-card`. Supports `as="article" | "li" | "link"` for semantic markup.

### Status → `Alert` / `Badge` / toasts

- Inline errors and warnings: `Alert` with `variant`
- Mutation success: `useToast().success('…')` (global toast stack)
- Destructive actions: `useConfirm()` → `ConfirmDialog`

Storybook autodocs: run `npm run storybook -w web` for props tables per component.

---

## Accessibility design guidelines

| Topic | Guideline |
|-------|-----------|
| **Contrast** | Body ≥ 4.5:1; large text ≥ 3:1 |
| **Focus** | Use `--shadow-focus` token; never remove focus without replacement |
| **Touch** | 44×44px minimum targets |
| **Errors** | Icon + text; not color alone |
| **Live regions** | `role="status"` for async feedback |
| **Dark mode** | Planned v2 — add `[data-theme="dark"]` overrides in `tokens.css` |

Implementation → [CODING_STANDARDS.md#accessibility](./CODING_STANDARDS.md#accessibility)

---

## Related documents

- [README.md](./README.md)
- [LAYOUT_SYSTEM.md](../../../docs/LAYOUT_SYSTEM.md) — page layouts, navigation, skeletons
- [CODING_STANDARDS.md#scss](./CODING_STANDARDS.md#scss)
- [DECISIONS.md#w002-styling-tailwind--scss-modules](./DECISIONS.md#w002-styling-tailwind--scss-modules)
- [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)
- [../src/styles/tokens.css](../src/styles/tokens.css)
