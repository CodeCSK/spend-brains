# Spendbrains Web — Design System

> **Visual language, tokens, and UI consistency rules.**  
> Hub → [README.md](./README.md)

| Doc version | 2.0 |

---

## Visual direction

The UI should feel **premium**, **minimal**, **elegant**, **trustworthy**, and **financially professional** — inspired by **Apple**, **Linear**, **Notion**, and **Stripe**.

Whitespace and typography create hierarchy. Use color sparingly. Every component should look intentional and refined.

### Do

- Soft, modern surfaces with generous whitespace
- Subtle depth via light borders and gentle shadows
- Purposeful accent color for actions and emphasis
- Harmonious, restrained chart palettes
- Smooth, restrained motion (150ms ease)

### Avoid

- Material UI appearance
- Bootstrap appearance
- Rainbow or neon color schemes
- Excessive gradients
- Pure black (`#000000`) — use `--color-text-primary` (`#16181D`) instead
- High-contrast neon colors
- Inventing colors outside this design system

---

## Brand color (fixed)

**Primary = `#8453AC` — do not replace this color.**

Build the entire theme around this value. All primary actions, focus rings, and brand accents derive from it.

| Role | Hex | Token (target) |
|------|-----|----------------|
| **Primary** | `#8453AC` | `--color-primary` |
| **Primary hover** | `#74479A` | `--color-primary-hover` |
| **Primary active** | `#653E87` | `--color-primary-active` |
| **Primary surface** | `#F4EEFA` | `--color-primary-surface` |
| **Primary border** | `#E4D8F1` | `--color-primary-border` |

---

## Color palette

### Neutral colors

| Role | Hex | Token (target) |
|------|-----|----------------|
| **Background** | `#F8F9FB` | `--color-surface-page` |
| **Surface** | `#FFFFFF` | `--color-surface-raised` |
| **Surface secondary** | `#FAFAFB` | `--color-surface-subtle` |
| **Text primary** | `#16181D` | `--color-text-primary` |
| **Text secondary** | `#6B7280` | `--color-text-secondary` |
| **Text muted** | `#9CA3AF` | `--color-text-muted` |
| **Border** | `#E5E7EB` | `--color-border` |
| **Divider** | `#F1F3F5` | `--color-divider` |

### Semantic colors

| Role | Hex | Surface | Token (target) |
|------|-----|---------|----------------|
| **Success** | `#22C55E` | `#ECFDF3` | `--color-success` / `--color-success-bg` |
| **Warning** | `#F59E0B` | `#FFFBEB` | `--color-warning` / `--color-warning-bg` |
| **Danger** | `#EF4444` | `#FEF2F2` | `--color-error` / `--color-error-bg` |
| **Info** | `#0EA5E9` | `#EFF6FF` | `--color-info` / `--color-info-bg` |

Use semantic colors for status and feedback only — not as decorative accents.

---

## Typography

| Item | Value |
|------|-------|
| **Primary font** | [Inter](https://fonts.google.com/specimen/Inter) |
| **Fallback stack** | `'SF Pro Display', system-ui, sans-serif` |
| **Token** | `--font-sans` in `tokens.css` |

Avoid decorative fonts.

### Type scale

| Role | Size | Weight | Token (target) |
|------|------|--------|----------------|
| **Display** | 56px | 700 | `--text-display` |
| **H1** | 40px | 700 | `--text-h1` |
| **H2** | 32px | 700 | `--text-h2` |
| **H3** | 24px | 700 | `--text-h3` |
| **Title** | 20px | 700 | `--text-title` |
| **Body** | 16px | 400 | `--text-body` |
| **Small** | 14px | 400 | `--text-body-sm` |
| **Caption** | 13px | 400 | `--text-caption` |

| Context | Weight |
|---------|--------|
| **Headings** | 700 |
| **Money values** | 600 — use `.tabular-amount` on currency columns |
| **Body / secondary text** | 400 |

Typography-led hierarchy: size, weight, and color — not boxes within boxes.

---

## Border radius

Cards and surfaces should feel **soft and modern**.

| Size | Value | Token (target) |
|------|-------|----------------|
| **Small** | 12px | `--radius-sm` |
| **Medium** | 16px | `--radius-md` |
| **Large** | 20px | `--radius-lg` |

---

## Shadow system

Use **subtle shadows only**. Avoid heavy elevation. Cards should feel lightweight.

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Resting cards, inputs |
| `--shadow-md` | Hover lift, dropdowns |
| `--shadow-lg` | Modals, overlays (use sparingly) |
| `--shadow-focus` | Focus ring — primary color at ~35% alpha |

Borders do most of the structural work; shadows add gentle depth.

---

## Interactive states

| State | Behavior |
|-------|----------|
| **Hover** | `translateY(-2px)` · soft shadow increase · border color transition |
| **Active** | `scale(0.98)` |
| **Focus** | Visible focus ring using primary color (`--shadow-focus`) |
| **Duration** | `150ms ease` |

Respect `prefers-reduced-motion` — disable transforms when set.

---

## Charts

Use harmonious colors. Avoid rainbow palettes. Pie charts use soft tones and smooth transitions.

| Role | Hex |
|------|-----|
| **Primary** | `#8453AC` |
| **Secondary** | `#3B82F6` |
| **Success** | `#22C55E` |
| **Warning** | `#F59E0B` |
| **Rose** | `#FB7185` |
| **Cyan** | `#06B6D4` |

### Segment hover

- Increase segment thickness
- Highlight active segment
- Fade non-active segments
- Animate smoothly

---

## Design principles

| Principle | Meaning |
|-----------|---------|
| **Clarity over decoration** | Every visual element communicates hierarchy or state. |
| **Generous whitespace** | Avoid cramped forms and tables. |
| **Subtle depth** | Light borders and soft shadows — not heavy skeuomorphism. |
| **Purposeful color** | Neutral base; accent and semantic colors for action and status only. |
| **Typography-led hierarchy** | Size, weight, and color — not boxes within boxes. |
| **Motion with restraint** | 150ms ease; respect `prefers-reduced-motion`. |
| **Mobile-first** | Thumb reach, single-column flows; enhance for desktop. |
| **Trustworthy finance UI** | Amounts prominent, aligned, scannable; errors clear but calm. |

**Anti-pattern:** Generic Bootstrap/Material admin look — saturated primary buttons, default blue links, arbitrary hex in components, rainbow chart segments.

**Rule:** Never invent colors outside this design system.

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
| **Global CSS** | `var(--color-text-primary)`, `var(--shadow-focus)` |
| **SCSS modules** | `@use '../styles/tokens' as *;` then `color: $color-text-primary;` |

**Rules for agents and contributors:**

- Do **not** add hex colors, raw px spacing, or one-off shadows in components.
- Add new tokens to `tokens.css` first, then wire in `index.css` `@theme` if Tailwind utilities are needed.
- Mirror new CSS variables in `_tokens.scss` with the **same name** (`$color-*`, `$space-*`, `$radius-*`).
- Semantic aliases (`--color-primary`, `--color-surface-page`) may reference primitives — change primitives or aliases to retheme.
- **Primary `#8453AC` is fixed** — map `--color-primary` to it; do not substitute a different brand hue.

### Theme change example

Remap semantics in `tokens.css` — components use aliases only:

```css
--color-primary: #8453AC;
--color-primary-hover: #74479A;
--color-primary-active: #653E87;
--color-primary-surface: #F4EEFA;
--color-primary-border: #E4D8F1;
--color-surface-page: #F8F9FB;
```

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
| **Wordmark** | “Spendbrains” in Inter Semibold or outlined paths |
| **Favicon** | ICO/PNG 32×32, 180×180 apple-touch |
| **Brand colors** | Primary `#8453AC` and palette in this doc → `tokens.css` |
| **On-dark variant** | Mark + wordmark for `--color-surface-inverse` contexts |
| **Minimum size** | Smallest legible mark width (e.g. 24px) |
| **Usage rules** | Don’t stretch, rotate, or change colors outside tokens |

Drop files in `public/brand/` — full checklist → [public/brand/README.md](../public/brand/README.md).

---

## Token reference

Full values in [`src/styles/tokens.css`](../src/styles/tokens.css). Summary:

### Semantic aliases (prefer in components)

| Token | Tailwind utility | Usage |
|-------|------------------|-------|
| `--color-surface-page` | `bg-surface-page` | Page background (`#F8F9FB`) |
| `--color-surface-raised` | `bg-surface-raised` | Cards (`#FFFFFF`) |
| `--color-surface-subtle` | `bg-surface-subtle` | Secondary surfaces (`#FAFAFB`) |
| `--color-text-primary` | `text-text-primary` | Body text (`#16181D`) |
| `--color-text-secondary` | `text-text-secondary` | Secondary copy (`#6B7280`) |
| `--color-text-muted` | `text-text-muted` | Meta, hints (`#9CA3AF`) |
| `--color-text-label` | `text-text-label` | Form labels |
| `--color-border` | `border-border` | Card borders (`#E5E7EB`) |
| `--color-divider` | `border-divider` | Section dividers (`#F1F3F5`) |
| `--color-border-input` | `border-border-input` | Input borders |
| `--color-primary` | `bg-primary` | Primary button (`#8453AC`) |
| `--color-primary-hover` | `hover:bg-primary-hover` | Button hover (`#74479A`) |
| `--color-primary-active` | `active:bg-primary-active` | Button pressed (`#653E87`) |
| `--color-primary-surface` | `bg-primary-surface` | Tinted primary fill (`#F4EEFA`) |
| `--color-primary-border` | `border-primary-border` | Primary-tinted border (`#E4D8F1`) |
| `--color-primary-fg` | `text-primary-fg` | Text on primary |
| `--color-secondary` | `bg-secondary` | Secondary button fill |
| `--color-secondary-fg` | `text-secondary-fg` | Secondary button text |

### Semantic status

| Token | Usage |
|-------|-------|
| `--color-success-bg` / `--color-success-text` | Success banners |
| `--color-error-bg` / `--color-error-text` | Error banners, validation |
| `--color-warning-bg` / `--color-warning-text` | Warnings, prompts |
| `--color-info-bg` / `--color-info-text` | Informational messages |

### Spacing, radius, elevation

| Group | Tokens |
|-------|--------|
| Spacing | `--space-1` (4px) … `--space-16` (64px) |
| Radius | `--radius-sm` (12px), `--radius-md` (16px), `--radius-lg` (20px), `--radius-full` → Tailwind `rounded-xp-*` |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-focus` |

---

## Icons

| Item | Value |
|------|-------|
| **Library** | [Lucide](https://lucide.dev/) via `lucide-react` |
| **Wrapper** | `components/Icon.tsx` — sizes 16 / 20 / 24, stroke 1.5 |
| **Default size** | 20px inline; 24px nav / primary actions |
| **Color** | `text-text-muted` default; `text-primary` active; inherit on buttons |
| **A11y** | Decorative → no label; meaningful → pass `label` prop or visible text |

**Common Spendbrains icons:** `Receipt`, `Users`, `Wallet`, `IndianRupee`, `CirclePlus`, `LogOut`, `ChevronRight`, `Check`, `AlertCircle`

Import only icons you use (tree-shaking):

```tsx
import { LogOut } from 'lucide-react'
import { Icon } from '../components/Icon'

<Icon icon={LogOut} size={20} className="text-text-muted" />
```

Inter’s clarity pairs well with Lucide’s 1.5px stroke — calm, modern, expense-app appropriate.

---

## Component guidelines

### Buttons → `Button`

| Variant | Prop |
|---------|------|
| Primary | `variant="primary"` (default) — `#8453AC` |
| Secondary | `variant="secondary"` |
| Ghost | `variant="ghost"` |
| Destructive | `variant="destructive"` |
| Link | `as="link"` + `to="/path"` |

One primary per section. Use `loading` prop for pending state. Hover: lift + shadow; active: `scale(0.98)`.

### Inputs → `FormField` + `Input` / `Select` / `Textarea`

- Wrap controls in `FormField` with `label`, optional `error`, optional `hint`
- Primitives apply `xp-input` styling and primary focus rings
- Min height 44px on mobile
- Errors: pass `error` to `FormField`; sets `aria-invalid` on control

### Cards → `Card`

`Card` wraps `xp-card`. Supports `as="article" | "li" | "link"` for semantic markup. Use medium radius (16px), subtle shadow, light border.

### Status → `Alert` / `Badge` / toasts

- Inline errors and warnings: `Alert` with `variant`
- Mutation success: `useToast().success('…')` (global toast stack)
- Destructive actions: `useConfirm()` → `ConfirmDialog`

Storybook autodocs: run `npm run storybook -w web` for props tables per component.

---

## Accessibility design guidelines

| Topic | Guideline |
|-------|-----------|
| **Contrast** | Body ≥ 4.5:1; large text ≥ 3:1 — avoid pure black; use `#16181D` |
| **Focus** | Use `--shadow-focus` token (primary ring); never remove focus without replacement |
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
