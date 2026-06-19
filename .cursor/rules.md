# Spendbrains — Cursor Agent Rules

> **Entry point for AI agents.** Full guide → [docs/AGENTS.md](../docs/AGENTS.md)

## Before you code

1. Read [docs/AGENTS.md](../docs/AGENTS.md) — mandatory reading order, rules, checklist.
2. For **web** work, follow [apps/web/docs/README.md](../apps/web/docs/README.md).
3. For **backend** work, follow [apps/backend/docs/README.md](../apps/backend/docs/README.md).

## Quick rules

- Documentation is source of truth — do not invent APIs, tokens, or folder patterns.
- Minimal diff only; match existing conventions.
- Web HTTP → `apps/web/src/lib/api.ts` only.
- Settlement and permission logic → backend only.
- Update canonical docs when changing conventions or APIs.
- Pre-submit checklist → [docs/AGENTS.md#pre-submit-checklist](../docs/AGENTS.md#pre-submit-checklist).

**When in doubt: read the docs linked above. Do not guess.**
