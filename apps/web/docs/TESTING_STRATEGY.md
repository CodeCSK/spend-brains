# Spendbrains Web — Testing Strategy

> **Automated testing approach for the React SPA.**  
> Hub → [README.md](./README.md) · **Manual E2E checklist** → [../README.md](../README.md#e2e-test-checklist)

| Doc version | 1.1 |

---

## Testing philosophy

1. **Test behavior users depend on** — not implementation details.
2. **Fast feedback** — unit tests in ms; integration in seconds.
3. **Confidence over coverage vanity** — meaningful tests over line-count targets.
4. **Stable selectors** — `getByRole`, `getByLabelText` before test IDs.

**Stack (adopt when wiring Vitest):**

| Tool | Purpose |
|------|---------|
| Vitest | Test runner |
| React Testing Library | Component/integration tests |
| MSW | HTTP mocking |
| @testing-library/user-event | Realistic interactions |

```json
"test": "vitest",
"test:run": "vitest run"
```

---

## Unit tests

**Target:** Pure functions, utilities, Zod schemas.

| Rule | Detail |
|------|--------|
| Location | Adjacent: `phone.test.ts` next to `phone.ts` |
| Naming | `describe('normalizeIndianPhone')` → `it('accepts 10-digit input')` |
| No React | Unit tests do not render components |

**Priority:** `normalizeIndianPhone`, OTP/phone Zod schemas, `avatar-presets` allowlist, query key factories.

---

## Component & integration tests

| Rule | Detail |
|------|--------|
| Render | `renderWithProviders()` — QueryClient + Router |
| Queries | role → label → text → testId |
| Async | `findBy*` / `waitFor` for mutations |

**Priority flows (MSW):**

1. OTP send → verify → redirect `/app`
2. Protected route redirect when unauthenticated
3. Profile load and PATCH update
4. Token refresh on 401 (expired access + successful refresh)

**Do not assert:** hook call counts, internal state, snapshot-only markup, exact CSS pixels.

---

## Coverage targets (when Vitest is wired)

| Area | Target |
|------|--------|
| `lib/` utilities | ≥ 90% |
| Zod schemas | All validation rules |
| Feature pages | Critical happy + error paths |
| Overall | ≥ 70% lines (raise over time) |

CI gates — future step.

---

## What not to test

| Category | Why |
|----------|-----|
| React/library internals | Third-party responsibility |
| Backend business logic | NestJS e2e — mock responses in web tests |
| Config files | No logic |
| Every Tailwind class | Test semantic outcome instead |

---

## Test file layout

```text
src/
├── lib/phone.test.ts
├── features/auth/pages/LoginPage.test.tsx
└── test/
    ├── setup.ts
    ├── utils.tsx
    └── handlers/
```

Naming: `*.test.ts(x)` — not `*.spec`.

---

## Related documents

- [../README.md](../README.md) — manual E2E checklist
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- [../../../docs/AGENTS.md](../../../docs/AGENTS.md)
