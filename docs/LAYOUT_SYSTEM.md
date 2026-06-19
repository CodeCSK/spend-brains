# Spendbrains — Layout System

> **Source of truth for page layouts, navigation patterns, loading states, skeletons, and semantic HTML.**  
> Visual tokens and color → [apps/web/docs/DESIGN_SYSTEM.md](../apps/web/docs/DESIGN_SYSTEM.md)  
> Routing and folder structure → [apps/web/docs/ARCHITECTURE.md](../apps/web/docs/ARCHITECTURE.md)  
> Product screens → [app-story.md](./app-story.md)

| Doc version | 1.0 |
| Framework | React 19 · Vite · TypeScript · Tailwind v4 · SCSS Modules |
| Status | Phase 1 shell shipped; event-scoped layouts defined for Steps 4–10 |

---

## Design goals

The application should feel:

- **Premium** — restrained palette, precise typography, calm motion
- **Minimal** — one primary action per section; no decorative chrome
- **Professional** — finance-grade clarity; amounts scannable and trustworthy
- **Fast** — skeleton-first; no layout shift; perceived instant navigation
- **Trustworthy** — explicit states (loading, empty, error); no hidden surprises
- **Reference quality** — comparable to Linear, Notion, Stripe, and Apple system apps

Avoid:

- Dashboard clutter (metric tiles everywhere, competing CTAs)
- Bootstrap / generic admin appearance (saturated buttons, default blue links)
- Random card layouts (mixed padding, radius, or shadow per screen)
- Excessive colors (semantic color only for status and primary actions)
- Deep nesting and unnecessary wrappers (“div soup”)
- Spinners as the default loading pattern

---

## Semantic layout structure

Use **semantic HTML only**. A `<div>` is allowed only when no semantic element fits (e.g. flex/grid wrappers with no landmark meaning).

### Landmarks — when to use

| Element | Use when | Do not use for |
|---------|----------|----------------|
| `<header>` | App topbar; event cover + title band; auth page logo row | Generic padding wrappers |
| `<nav>` | Primary app nav, sidebar links, tabs, breadcrumbs, bottom nav | Button groups, pagination controls alone |
| `<aside>` | Collapsible sidebar; event context nav on desktop; filters panel | Main content, modals |
| `<main>` | **Exactly one** primary content landmark per page/view | Nested inside another `<main>` |
| `<section>` | Thematic block with a heading (summary cards, expense list, form sections) | Single-field wrappers |
| `<article>` | Self-contained unit: expense card, event card, settlement line, notification item | Entire page wrapper |
| `<footer>` | Page-level meta (auth legal copy); inline form actions in a `<footer>` inside a card/modal | Sticky app chrome (use `<header>` / bottom `<nav>`) |

### Heading hierarchy

- One `<h1>` per route — usually in the page header.
- Section titles: `<h2>`; card titles: `<h3>`.
- Never skip levels for styling; use token typography classes instead.

### Examples by page type

#### Auth pages (`/login`)

```html
<body>
  <main>                          <!-- PageLayout width="auth" -->
    <header>                      <!-- logo row only -->
      <!-- AppLogo -->
    </header>
    <article class="xp-card">      <!-- sign-in card -->
      <h1>Sign in</h1>
      <form>...</form>
    </article>
    <footer>                      <!-- optional dev/meta copy -->
      <p>...</p>
    </footer>
  </main>
</body>
```

No `<nav>` on auth — user is not yet in the app shell.

#### Dashboard / list pages (`/app/events`)

```html
<div>                             <!-- AppShell root (layout route) -->
  <header>...</header>             <!-- topbar -->
  <main>
    <div class="xp-page">         <!-- PageLayout -->
      <header>                   <!-- PageHeader -->
        <h1>Events</h1>
      </header>
      <section aria-label="Your events">
        <!-- event cards or empty state -->
      </section>
    </div>
  </main>
  <nav aria-label="Mobile">...</nav>
</div>
```

#### Settings pages (`/app/profile`, event settings)

```html
<main>
  <div class="xp-page-narrow">
    <header><h1>Profile</h1></header>
    <section aria-labelledby="profile-details-heading">
      <h2 id="profile-details-heading">Details</h2>
      <form>...</form>
    </section>
  </div>
</main>
```

#### Detail / tabbed pages (`/app/events/:eventId/*`)

```html
<main>
  <div class="xp-page">
    <header>                     <!-- event hero: cover, title, dates -->
      <h1>Event name</h1>
    </header>
    <nav aria-label="Event sections">  <!-- tabs: Expenses | Members | Settlements -->
      ...
    </nav>
    <section aria-labelledby="expenses-heading">
      <h2 id="expenses-heading" class="sr-only">Expenses</h2>
      ...
    </section>
  </div>
</main>
```

#### Modal / dialog pages (create event, add expense, delete confirm)

Modals are **not** separate routes unless the URL must be shareable (prefer route + `<dialog>` for deep links).

```html
<dialog aria-labelledby="dialog-title" aria-modal="true">
  <header>
    <h2 id="dialog-title">Add expense</h2>
  </header>
  <form>...</form>
  <footer>                      <!-- Cancel | Save -->
    <button type="button">Cancel</button>
    <button type="submit">Save</button>
  </footer>
</dialog>
```

On mobile, the same content may render in a **bottom sheet** (`<dialog>` + slide-up pattern) — same semantics, different placement.

---

## Application shell

The authenticated shell is implemented in `AppShell.tsx` and will evolve toward the diagram below. **Today:** topbar + main + mobile bottom nav. **Target (desktop):** optional sidebar for global nav; event-scoped sidebar/tabs under `EventLayout`.

### Desktop (target)

```text
+----------------------+
| Topbar               |
+----------+-----------+
|          | Breadcrumb|
| Sidebar  | Page hdr  |
| (global  |-----------|
|  or      |           |
|  event)  | Main      |
|          | content   |
|          |           |
+----------+-----------+
```

### Mobile

```text
+----------------------+
| Topbar               |
+----------------------+
|                      |
| Main content         |
| (full width)         |
|                      |
+----------------------+
| Bottom navigation    |
+----------------------+
```

**Drawer menu:** On mobile, secondary links (settings, help, logout overflow) open from a **left drawer** triggered by a menu icon in the topbar. Primary destinations stay in the bottom nav (max 4 items).

### Shell regions

| Region | Component | Responsibility |
|--------|-----------|----------------|
| Topbar | `AppShell` `<header>` | Logo, context title, search (future), notifications (future), profile / logout |
| Sidebar | `AppShell` / `EventLayout` `<aside>` | Global nav (Events, Profile) or event tabs (Expenses, Members, Settlements) |
| Breadcrumb | `Breadcrumb` (planned) | URL hierarchy below topbar, above page header |
| Page header | `PageHeader` | `<h1>`, subtitle, primary action |
| Main content | `<main>` + `PageLayout` | Route outlet; scroll container |

### Layout tokens (`tokens.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--header-height` | `3.5rem` (56px) | Topbar height |
| `--bottom-nav-height` | `4rem` (64px) | Mobile bottom nav |
| `--content-max-width` | `720px` | Narrow pages (profile, forms) |
| `--content-max-width-wide` | `1120px` | Lists, tables, event detail |
| `--sidebar-width` | `15rem` (240px) | **Add when sidebar ships** |
| `--sidebar-width-collapsed` | `4rem` (64px) | Icon-only sidebar |

### Responsiveness

| Breakpoint | Shell behavior |
|------------|----------------|
| `< md` | Bottom nav visible; sidebar hidden; drawer for overflow |
| `md+` | Bottom nav hidden; topbar nav links visible |
| `lg+` | Sidebar visible for event context; collapsed mode optional |

Main content padding: `PageLayout` classes (`xp-page`, `xp-page-narrow`, `xp-auth-shell`) — do not duplicate in feature pages.

---

## Topbar standards

### Contents (left → right)

1. **Logo** — `AppLogo`; links to `/app/events`
2. **Page title** — optional context label on small screens when sidebar is hidden (e.g. current event name)
3. **Search** — global event search (future); event expense search on event routes
4. **Notifications** — bell icon + badge (future)
5. **Profile menu** — avatar, profile link, logout (today: logout button in header)

### Visual rules

- Height: `var(--header-height)` — never taller on desktop
- Background: `bg-surface-raised/95 backdrop-blur-sm`
- Border: `border-b border-border`
- Sticky: `sticky top-0 z-20`
- Horizontal padding: `px-4 sm:px-6`; max width aligns with `--content-max-width-wide`

### Accessibility

- Wrap primary links in `<nav aria-label="Main">`
- Icon-only buttons: `aria-label` (see logout in `AppShell`)
- Skip link (planned): “Skip to main content” as first focusable element
- Search input: `<label>` or `aria-label="Search events"`

---

## Sidebar standards

Use sidebar for **persistent section navigation** — global app sections or event tabs — not for one-off filters (those belong in a toolbar or `<aside>` filter panel).

### Grouping

| Group | Items (global) | Items (event-scoped) |
|-------|----------------|---------------------|
| Primary | Events | Expenses |
| Primary | — | Members |
| Primary | — | Settlements |
| Secondary | Profile | Event settings (Captain/Vice) |
| Secondary | Join event | — |

Separate groups with `border-t border-border` and `py-2`; group labels: `text-xs font-medium text-text-muted uppercase tracking-wide px-3`.

### Collapsed mode (desktop `lg+`)

- Width: `--sidebar-width-collapsed`; icons only; labels in `aria-label` + tooltip on hover/focus
- Toggle: pin icon at sidebar footer; persist preference in `localStorage`
- Active item: icon `text-primary`, background `bg-surface-subtle`

### Active states

- Match link: `xp-nav-link-active` (matches topbar nav)
- `aria-current="page"` on active `<a>` / `NavLink`

### Keyboard navigation

- Vertical `roving tabindex` within sidebar `<nav>`
- `↑` / `↓` move focus; `Enter` activates
- `Escape` closes mobile drawer

### Icons and labels

- Lucide via `Icon.tsx`; 20px inline, 24px in sidebar
- Label always visible when expanded; never rely on icon alone without accessible name

### Maximum width

- Expanded: `240px` (`--sidebar-width`) — do not exceed `280px`
- Event layout: prefer **horizontal tabs** below event header on `md–lg`; switch to sidebar at `xl+` if tab count grows

---

## Content layout standards

### Maximum width

| Class | Token | Use for |
|-------|-------|---------|
| `xp-page` | `--content-max-width-wide` (1120px) | Event lists, expense tables, settlements |
| `xp-page-narrow` | `--content-max-width` (720px) | Profile, create/edit forms |
| `xp-auth-shell` | `max-w-md` (~448px) | Login |

Content is always centered: `mx-auto w-full`.

### Grid rules

- **Summary row:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` for settlement summary stats
- **Event grid:** `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`
- **Form two-column:** `grid grid-cols-1 sm:grid-cols-2 gap-4` only when fields are related pairs (date + category)
- Gap tokens: `--space-4` default; `--space-6` between major sections

### Card spacing

- Inside cards: `p-4 sm:p-6` (`xp-card`)
- Between cards in a list: `space-y-3` or `gap-3`
- Card + page header: `mt-8 sm:mt-10`

### Section spacing

- After page header: first section `mt-6 sm:mt-8`
- Between sections: `mt-10` or `mt-12` for major breaks
- Within section: heading → content `mt-4`

### Visual hierarchy

1. Page title (`xp-page-title`) — what screen is this?
2. Section heading (`text-lg font-semibold`) — what block is this?
3. Body / meta (`text-sm text-text-secondary`) — supporting detail
4. Amounts — `tabular-amount`, `font-semibold`, right-aligned in tables

### White space rules

- Prefer space over borders to separate sections
- One border level per view: either page sections use space, or cards use `border-border`, not both heavily
- Minimum touch padding: never less than `--space-3` around interactive rows

### Page header pattern

Use `PageHeader` from `PageLayout.tsx`:

```tsx
<PageHeader
  title={<>...</>}
  description="Optional subtitle"
  action={<button className="xp-btn-primary">...</button>}
/>
```

- Title: single `<h1>`; icons decorative unless they convey unique meaning
- Action: one primary button; secondary actions in overflow menu
- Stack on mobile: title block full width; action below or sticky bottom bar for long forms

### Action button placement

| Context | Placement |
|---------|-----------|
| List page (Events) | Page header right — “Create event” |
| Event detail | Page header or floating toolbar — “Add expense” |
| Form | Card footer or sticky footer on mobile |
| Destructive | Left-aligned ghost/destructive; confirm in modal |

Rule: **one primary button per viewport region** (header, toolbar, footer).

### Empty states

See [Empty states](#empty-states). Always inside the content region that would hold data — never replace the entire shell.

---

## Navigation standards

### Breadcrumbs

- Show on event-scoped routes depth ≥ 2: `Events / Goa trip 2026 / Expenses`
- Container: `<nav aria-label="Breadcrumb"><ol>...</ol></nav>`
- Current page: `aria-current="page"`; not a link
- Placement: below topbar, above `PageHeader`, `text-sm text-text-muted`
- Collapse middle segments on mobile: `Events / … / Expenses`

### Tabs (event sections)

- URL-driven: `/app/events/:eventId/expenses`, `/members`, `/settlements`
- `<nav aria-label="Event sections">` with `role="tablist"`; panels `role="tabpanel"`
- Active tab: underline or subtle fill; `aria-selected="true"`
- Do not duplicate as sidebar **and** tabs on the same breakpoint

### Page navigation

- **Back:** ghost button with `ArrowLeft`; use for drill-down (expense edit → list), not for tab switches
- **Deep links:** every tab and detail view has a URL (shareable, refresh-safe)

### URL hierarchy

```text
/login
/app/events                          → global home / “dashboard”
/app/events/new
/app/join
/app/events/:eventId                  → redirect → .../expenses
/app/events/:eventId/expenses
/app/events/:eventId/expenses/new
/app/events/:eventId/expenses/:expenseId/edit
/app/events/:eventId/members
/app/events/:eventId/settlements
/app/profile
```

### Active states

- Match nav: `xp-nav-link-active`
- Tabs: border or background + `aria-selected`
- Breadcrumb current: `text-text-primary font-medium`

### Accessibility

- Focus order: skip link → topbar → sidebar/drawer → breadcrumb → main
- Mobile drawer: focus trap while open; return focus to menu button on close
- Route changes: move focus to `<h1>` or announce via `aria-live="polite"` region

---

## Card standards

All cards extend `xp-card` unless a list row is intentionally flat (table row, expense row).

### Summary cards (settlements, dashboard stats)

- Padding: `p-4 sm:p-5`
- Label: `text-xs text-text-muted uppercase tracking-wide`
- Value: `text-2xl font-semibold tabular-amount`
- No hover lift — informational only
- Grid layout; equal height via `h-full`

### Expense cards (mobile list)

- Structure: `<article>` with date, description, category, paid-by, amount
- Padding: `p-4`
- Amount: right column, `tabular-amount font-semibold`
- Tap target: full row `min-h-11`; actions in swipe or overflow menu
- Border: `border border-border rounded-xp-lg`; hover `bg-surface-subtle` on desktop

### Transaction / settlement line cards

- Instruction text: “**A** pays **B** ₹X” — names `font-medium`
- Status chip: settled / pending — semantic background tokens
- Secondary line: net balance, date settled

### Analytics cards (category breakdown — future)

- Simple bar or list; no chart junk on mobile
- Muted palette; accent only for highlight

### Shared visual rules

| Property | Value |
|----------|-------|
| Padding | `p-4 sm:p-6` (default `xp-card`) |
| Radius | `rounded-xp-xl` (`--radius-xl`) |
| Shadow | `shadow-xp-sm` default; `shadow-xp-md` on hover for clickable cards only |
| Border | `border border-border` |
| Hover | Clickable: `transition-shadow hover:shadow-xp-md`; not on static summary cards |
| Consistency | Never mix `xp-card` and raw bordered divs on the same list |

---

## Table standards

Use tables on **`md+`** for expense lists and members; **card list** below `md`.

### Desktop tables

```html
<div class="overflow-x-auto rounded-xp-xl border border-border">
  <table>
    <thead class="sticky top-[var(--header-height)] bg-surface-subtle">
      <tr>
        <th scope="col">Date</th>
        ...
      </tr>
    </thead>
    <tbody>...</tbody>
  </table>
</div>
```

- Header: `text-xs font-medium text-text-muted uppercase`
- Row height: `min-h-11`
- Amount column: `text-right tabular-amount`
- Row hover: `hover:bg-surface-subtle`
- Actions: icon buttons at row end; `aria-label` per action

### Mobile cards

Same data as table rows → `ExpenseCard` articles in `space-y-3`.

### Sorting

- Clickable `<th>` with `aria-sort="ascending|descending|none"`
- Sort indicator icon; don’t rely on color alone

### Pagination

- Below table: “Showing 1–20 of 142” + prev/next
- `<nav aria-label="Pagination">`
- Page size from API; preserve sort/filter in URL search params

### Sticky headers

- Table `<thead>` sticky below topbar when table scrolls inside main
- `z-10` on thead; solid background (no transparency glitches)

### Accessibility

- `scope="col"` / `scope="row"` as appropriate
- Caption or `aria-label` on table summarizing purpose
- Select-all checkbox in header with visible label on mobile

---

## Forms standards

Forms use **react-hook-form + Zod**; layout rules below apply to all forms (login, profile, event, expense).

### Labels

- `xp-label` above field; `htmlFor` matching input `id`
- Required: visible “(required)” or `aria-required="true"` — not color-only asterisk

### Validation

- Validate on submit first; re-validate on blur after first submit
- Zod messages: short, actionable (“Enter a valid Indian mobile”)

### Error messages

- Below field: `text-sm text-error-text`
- Set `aria-invalid="true"` and `aria-describedby` pointing to error id
- Form-level errors: `xp-alert-error` at top of form

### Helper text

- `text-sm text-text-muted mt-1` below label or field
- Never replace error styling with helper text

### Input spacing

- Field stack: `space-y-4`
- Label → input: `mt-1` (built into `xp-input`)
- Min height: `min-h-11` (44px touch target)

### Grouping

- Related fields in `<fieldset><legend>...</legend></fieldset>`
- Section title + `space-y-4`; between sections `mt-8`

### Button placement

| Role | Class |
|------|-------|
| Submit | `xp-btn-primary` |
| Cancel | `xp-btn-ghost` |
| Secondary | `xp-btn-secondary` |

- Submit disabled + label change while pending: “Saving…”
- Mobile long forms: sticky footer with primary + cancel

### Loading states

- Disable inputs during submit; primary button shows pending label
- Prefer skeleton on form **page** load; not spinner overlay on whole form

### Success states

- Inline: `xp-alert-success` + `role="status"`
- Navigation on success for create flows (→ detail or list)
- Toast for minor updates (profile saved)

---

## Loading states

**Prefer skeletons over spinners.** Spinners only for inline button pending or tiny refresh indicators.

### Principles

1. Skeleton layout **matches final layout** (same heights, columns, card count)
2. Reserve space to prevent CLS (Cumulative Layout Shift)
3. Show skeletons within `PageLayout` — shell chrome stays visible
4. TanStack Query: `isPending` → skeleton; `isFetching` + cached data → subtle opacity, not full skeleton

### Skeleton structure (target classes)

Define in `index.css` when implementing:

| Class | Use |
|-------|-----|
| `xp-skeleton` | Base shimmer block `bg-surface-subtle animate-pulse rounded-xp-md` |
| `xp-skeleton-text` | Line height ~1em; width variants `w-3/4`, `w-1/2` |
| `xp-skeleton-avatar` | `h-10 w-10 rounded-full` |
| `xp-skeleton-row` | Table row: flex gap-4 py-3 |
| `xp-skeleton-card` | Full card placeholder matching `xp-card` min-height |

### By surface

| Surface | Skeleton pattern |
|---------|------------------|
| Page load | Page header lines + 3 card skeletons |
| Card grid | 6 cards in event grid positions |
| Table | Header row + 8 body rows |
| List | 5 expense card skeletons |
| Button | Width fixed; label swaps to “Saving…” (no skeleton) |

### Reduced motion

Respect `prefers-reduced-motion`: pulse off → static `bg-surface-subtle`.

---

## Empty states

Centered in the **content area** that would show data; keep page header and nav visible.

### Pattern

```html
<section class="xp-card border-dashed text-center p-8 sm:p-10">
  <div><!-- icon in subtle circle --></div>
  <h2>No expenses yet</h2>
  <p class="text-text-secondary">...</p>
  <button class="xp-btn-primary">Primary CTA</button>
  <p class="text-xs text-text-muted">Optional secondary hint</p>
</section>
```

### Copy and CTA by screen

| Screen | Heading | CTA | Illustration |
|--------|---------|-----|--------------|
| No events | “No events yet” | Create event | `CalendarDays` in subtle circle |
| No expenses | “No expenses yet” | Add expense | `Receipt` |
| No members (edge) | “You’re the first member” | Invite members | `Users` |
| No settlements | “All settled up” | — (celebratory, not empty) | `Check` |
| No analytics | “Not enough data yet” | Add expenses | `ChartColumn` |
| Filter no results | “No matches” | Clear filters | — |

Illustrations: Lucide icon at 24px in `h-14 w-14 rounded-full bg-surface-subtle` — not heavy illustration assets until brand pack exists.

---

## Modal standards

Use native `<dialog>` (or shadcn Dialog themed to tokens) for confirmations and short forms.

### Types

| Type | Content | Actions |
|------|---------|---------|
| Confirmation | One sentence + consequence | Cancel (ghost) · Confirm (primary/destructive) |
| Delete | Name of entity being deleted | Cancel · Delete (destructive) |
| Edit form | Short fields only | Cancel · Save |
| Bottom sheet (mobile) | Same as above | Drag handle visual only; focus trap identical |

### Behavior

- Overlay: `bg-surface-inverse/40 backdrop-blur-sm`
- Max width: `max-w-md` forms; `max-w-sm` confirms
- Focus trap inside dialog; initial focus on first field or cancel for destructive
- `Escape` closes non-destructive; destructive requires explicit cancel
- Close on overlay click: yes for info; no for half-filled forms

### Keyboard

- `Tab` cycles trapped focus
- `Enter` submits when focus on submit button
- Return focus to trigger element on close

---

## Toast notifications

Global toast region (planned) — bottom on mobile, top-right on desktop.

| Variant | Token classes | When |
|---------|---------------|------|
| Success | `xp-alert-success` | Saved, copied, marked settled |
| Error | `xp-alert-error` | Mutation failed (non-field) |
| Warning | `xp-alert-warning` | Partial save, offline |
| Info | info tokens | Background refresh, tips |

- Duration: 4s default; errors 6s or manual dismiss
- `role="status"` for success/info; `role="alert"` for errors
- Max 3 visible; queue or replace
- Do not toast validation errors — inline field errors instead

---

## Responsive breakpoints

Align with Tailwind defaults (used in Vite app):

| Name | Min width | Layout rules |
|------|-----------|--------------|
| Mobile | `< 640px` | Single column; bottom nav; cards not tables; sticky form footers |
| Tablet (`sm`) | 640px | Two-column grids start; slightly larger page padding |
| Desktop (`md`) | 768px | Top nav replaces bottom nav; tables for lists |
| Large (`lg`) | 1024px | Sidebar eligible; 3-column event grid |
| XL (`xl`) | 1280px | Optional event sidebar instead of tabs; wider gutters |
| 2XL | 1536px | Content still capped at `--content-max-width-wide`; extra margin only |

Safe areas: respect `env(safe-area-inset-bottom)` on bottom nav (already in `AppShell`).

---

## Accessibility requirements

Target **WCAG 2.1 AA** (see also [DESIGN_SYSTEM.md](../apps/web/docs/DESIGN_SYSTEM.md)).

| Topic | Requirement |
|-------|-------------|
| Keyboard | All actions reachable; logical tab order; no keyboard traps except modals/drawers |
| Focus | `focus-visible:shadow-[var(--shadow-focus)]`; never `outline-none` without replacement |
| ARIA | Landmarks, `aria-current`, `aria-expanded`, `aria-sort`; prefer native semantics first |
| Screen readers | Page title + h1 reflect route; live regions for async feedback |
| Headings | One h1; logical h2/h3 nesting |
| Touch targets | Min 44×44px (`min-h-11 min-w-11`) |
| Color contrast | Body text ≥ 4.5:1; errors icon + text |
| Motion | `prefers-reduced-motion` honored |

---

## Performance requirements

| Goal | Approach |
|------|----------|
| Prevent layout shift | Skeleton dimensions match final UI; explicit image width/height |
| Lazy loading | `React.lazy` for heavy routes (`EventLayout`, settlements export) |
| Skeleton-first | Shell renders immediately; data regions skeleton |
| Images | Event covers: responsive src + lazy; preset covers sized in CSS |
| Minimal DOM | Semantic elements over wrapper divs; virtualize long expense lists later |
| Lighthouse | Target **> 95** Performance, Accessibility, Best Practices |

---

## Page layouts

Domain note: v1 uses **events** (not separate “groups”). “Group expenses” maps to **event list** and **event detail**. “Reports” maps to **settlements and summaries**.

---

### 1. Login page (`/login`)

**Layout:** `PageLayout width="auth"` — centered column, no app shell.

```text
┌─────────────────────────┐
│       [Logo]            │
│  ┌─────────────────┐    │
│  │ Sign in         │    │
│  │ subtitle        │    │
│  │ Phone           │    │
│  │ [ consent ]     │    │
│  │ [ Send OTP ]     │    │
│  └─────────────────┘    │
│   dev meta (optional)   │
└─────────────────────────┘
```

**Why:** Auth is isolated from app chrome so the user focuses on verification only. Single card constrains cognitive load. Narrow max-width matches Stripe/Linear login patterns and keeps form fields thumb-friendly on mobile.

**Maintainability:** `GuestRoute` + `PageLayout width="auth"` — every future auth screen (join via link) reuses the same shell without duplicating centering logic.

---

### 2. Dashboard — Events home (`/app/events`)

**Layout:** `AppShell` + `PageLayout width="wide"` + `PageHeader` + event grid or empty state.

```text
┌─ Topbar: Logo | Events Profile | Logout ─────────────┐
├──────────────────────────────────────────────────────┤
│ Events                          [ Create event ]   │
│ Subtitle                                         │
├──────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ Event    │ │ Event    │ │ Event    │            │
│ │ card     │ │ card     │ │ card     │            │
│ └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────────────────────────────────────┘
│ Events │ Profile │  (mobile bottom nav)
```

**Why:** Events are the product home — not a metric-heavy dashboard. Cards communicate scannable entry points; one create CTA in the header matches “one primary action per region.”

**Maintainability:** List logic stays in `features/events/`; shell never knows about event DTOs — only `<Outlet />`.

---

### 3. Expense list (`/app/events/:eventId/expenses`)

**Layout:** `EventLayout` — event header band, tab nav, toolbar, table/cards.

```text
┌─ Topbar ────────────────────────────────────────────┐
│ Events / Goa 2026 / Expenses                      │
├──────────────────────────────────────────────────────┤
│ [cover] Event title · dates · role badge           │
│ Expenses | Members | Settlements                  │
├──────────────────────────────────────────────────────┤
│ Expenses                    [ + Add expense ]         │
│ [ Search... ] [ Category ▾ ] [ Sort ▾ ]           │
├──────────────────────────────────────────────────────┤
│ TABLE (desktop) / CARDS (mobile)                  │
│ date · desc · category · paid by · amount · ...   │
├──────────────────────────────────────────────────────┤
│ Pagination                                      │
└──────────────────────────────────────────────────────┘
```

**Why:** Toolbar separates **filter/sort** (frequent) from **tabs** (section navigation). Table on desktop supports dense finance review; cards on mobile respect thumb reach.

**Maintainability:** URL tab routes + shared `EventLayout` loader caches event once (`eventKeys.detail`); expense list refetches independently.

---

### 4. Expense details (`/app/events/:eventId/expenses/:expenseId/edit`)

**Layout:** Narrow content (`xp-page-narrow`) — full page on mobile; modal on desktop (optional optimization).

```text
┌─ Topbar ────────────────────────────────────────────┐
│ ← Back to expenses                              │
├──────────────────────────────────────────────────────┤
│ Edit expense                                      │
│ ┌────────────────────────────────────────────┐   │
│ │ Description                              │   │
│ │ Amount (₹)                               │   │
│ │ Paid by · Shared among · Date · Category   │   │
│ │ Notes                                    │   │
│ │ [ Delete ]          [ Cancel ] [ Save ]    │   │
│ └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Why:** Full-page form on mobile avoids cramped modals; dedicated route enables deep link and refresh-safe editing. Delete separated left from submit cluster reduces mis-taps.

**Maintainability:** Form schema mirrors API DTO; route param drives query `expenseKeys.detail(id)`.

---

### 5. Add expense form (`/app/events/:eventId/expenses/new`)

**Layout:** Same as edit — `xp-page-narrow`, sticky footer on mobile.

```text
┌─ Topbar ────────────────────────────────────────────┐
│ ← Expenses                                      │
├──────────────────────────────────────────────────────┤
│ Add expense                                      │
│ ┌────────────────────────────────────────────┐   │
│ │ (fields top → bottom by frequency)       │   │
│ │ Amount · Description · Category          │   │
│ │ Paid by · Split among · Date             │   │
│ └────────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────────┐   │
│ │        [ Cancel ]  [ Add expense ]          │   │  ← sticky on mobile
│ └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Why:** Field order puts amount + description first — fastest path for “just paid for dinner” entry. Sticky footer keeps submit visible while scrolling long member split lists.

**Maintainability:** Shared `ExpenseForm` component for create/edit; only default values and submit mutation differ.

---

### 6. Group expenses — Event overview (`/app/events/:eventId`)

**Layout:** Event hero + tab nav (default redirect to expenses). Optional sidebar at `xl+`.

```text
┌─ Topbar ────────────────────────────────────────────┐
├──────────┬───────────────────────────────────────┤
│ Expenses │ Event title + meta                   │
│ Members  │ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│ Settle-  │ │ Total   │ │ Your    │ │ Out-   │ │
│ ments    │ │ spent   │ │ balance │ │ standing│ │
│          │ └─────────┘ └─────────┘ └────────┘ │
│ Settings │ (summary cards — settlements tab)  │
│ (role)   │ Recent activity / quick links       │
└──────────┴───────────────────────────────────────┘
```

**Why:** Event is the group boundary boundary — summary cards answer “how are we doing?” without a separate dashboard. Role-gated settings in secondary nav avoids clutter for members.

**Maintainability:** `EventLayout` outlet wraps all `:eventId/*` child routes; summary cards compose from settlement API — no client-side math.

---

### 7. Reports page — Settlements (`/app/events/:eventId/settlements`)

**Layout:** Summary band + payment lines + export action.

```text
┌─ Topbar ────────────────────────────────────────────┐
│ Events / Goa 2026 / Settlements                  │
├──────────────────────────────────────────────────────┤
│ Settlements                    [ Export ▾ ]        │
├──────────────────────────────────────────────────────┤
│ ┌ Total ┐ ┌ Settled ┐ ┌ Outstanding ┐ ┌ Status ┐│
│ │ ₹ X   │ │ ₹ Y   │ │ ₹ Z            │ │ 3/7  ││
│ └───────┘ └───────┘ └────────────────┘ └──────┘│
├──────────────────────────────────────────────────────┤
│ [ Show unsettled only ]                          │
│ ┌──────────────────────────────────────────────┐   │
│ │ Priya pays Karthik ₹1,200    [ Mark paid ]│   │
│ └──────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────┐   │
│ │ ...                                      │   │
│ └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Why:** Summary cards at top mirror app-story settlement UX — totals before instructions. Line cards readable as plain sentences; export in header (infrequent action).

**Maintainability:** Read-only view of API settlement DTOs; “mark paid” is explicit mutation with cache invalidation — no derived state in layout components.

---

### 8. Settings page

**Two contexts:** Profile (`/app/profile`) and event settings (Captain/Vice, under event nav).

#### Profile

```text
┌─ Topbar ────────────────────────────────────────────┐
├──────────────────────────────────────────────────────┤
│ Profile                                         │
│ ┌──────────────────────────────────────────────┐   │
│ │ Avatar picker (presets)                    │   │
│ │ Display name                               │   │
│ │ Phone (read-only v1)                       │   │
│ │ [ Save ]                                   │   │
│ └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

#### Event settings (role-gated)

```text
┌─ Event nav ──────────────────────────────────────┐
│ Event settings                                  │
│ ┌──────────────────────────────────────────────┐   │
│ │ Name · dates · type · public/private       │   │
│ │ Danger zone: Archive / Delete (Captain)    │   │
│ └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Why:** Narrow column for forms reduces eye travel. Event settings separated from profile prevents mixing global vs event-scoped permissions.

**Maintainability:** Profile uses `profileKeys`; event settings use `eventKeys` + role from layout loader — buttons disabled/hidden from API role, not duplicated RBAC logic in CSS.

---

## Implementation checklist

When building or changing a screen:

- [ ] Exactly one `<main>`; correct landmark elements
- [ ] `PageLayout` width matches content type (wide / narrow / auth)
- [ ] `PageHeader` for list/detail titles; one primary CTA
- [ ] Loading: skeleton matches final layout; shell not replaced
- [ ] Empty state in content region with icon + CTA
- [ ] Mobile: bottom nav padding on shell (`AppShell`); tables → cards
- [ ] URL reflects tab and detail state
- [ ] Tokens only — no raw hex/px in components ([DESIGN_SYSTEM.md](../apps/web/docs/DESIGN_SYSTEM.md))
- [ ] New layout pattern → note in [DECISIONS.md](../apps/web/docs/DECISIONS.md) (W###)

---

## Related documents

- [app-story.md](./app-story.md) — product behavior and screen content
- [apps/web/docs/DESIGN_SYSTEM.md](../apps/web/docs/DESIGN_SYSTEM.md) — tokens, typography, color
- [apps/web/docs/ARCHITECTURE.md](../apps/web/docs/ARCHITECTURE.md) — routes, folders, state
- [apps/web/docs/CODING_STANDARDS.md](../apps/web/docs/CODING_STANDARDS.md) — HTML/React implementation
- [apps/web/docs/active_plan.md](../apps/web/docs/active_plan.md) — implementation steps for event layouts
- [apps/web/src/components/layout/](../apps/web/src/components/layout/) — PageLayout, EmptyState
- [apps/web/src/components/AppShell.tsx](../apps/web/src/components/AppShell.tsx) — current shell
- [apps/web/src/styles/tokens.css](../apps/web/src/styles/tokens.css) — layout token values
