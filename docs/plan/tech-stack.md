# Spendbrains — Tech Stack & Release Plan

> **What we use, when we ship, and why.**  
> System structure → [../apps/backend/docs/architecture.md](../apps/backend/docs/architecture.md)  
> Product behaviour → [../app-story.md](../app-story.md)

| Doc version | 1.1 |
| Status | Phase 1 in progress — backend + web auth shell shipped |

---

## Release plan

| Phase | Version | Client | Auth | When |
|-------|---------|--------|------|------|
| **Phase 1** | v1.0 | Web (browser) | Phone OTP only | First ship |
| **Phase 2** | v1.x | iOS (Flutter) | Apple ID + phone | After web stable |
| **Phase 3** | v1.x | Android (same Flutter) | Google + phone | After iOS |
| **Later** | v2.0+ | Mobile primary | All methods | Web may retire |

### API versioning

- REST prefix: `/v1`  
- OpenAPI at `/apis` (Swagger UI)  
- Breaking changes → new API version; avoid breaking mobile clients  

---

## Technology decisions (approved)

| ID | Area | Choice |
|----|------|--------|
| **TD1** | Architecture | API-first **modular monolith** |
| **TD2** | Backend | **NestJS + TypeScript** |
| **TD3** | Database | **PostgreSQL** |
| **TD4** | Web frontend | **React + Vite + TypeScript (SPA)** |
| **TD5** | ORM | **Prisma** |
| **TD6** | OTP SMS (India) | **MSG91** (swappable provider) |
| **TD7** | Hosting | **Cloudflare Pages + Fly.io (Mumbai) + Neon** |
| **TD8** | File storage | **Cloudflare R2** |
| **TD9** | Mobile | **Flutter + Dart** (Phase 2/3) |
| **TD10** | Web UI | **Tailwind CSS + shadcn/ui** |
| **TD11** | Cross-platform look | Separate web/mobile code; **shared design tokens** |

Index → [tech-decisions.md](./tech-decisions.md)

### Planned libraries

| Layer | Libraries |
|-------|-----------|
| Web | TanStack Query, TanStack Table, react-router, react-i18next, react-hook-form, zod |
| API | class-validator, Swagger/OpenAPI |
| Mobile (later) | Riverpod, Dio, go_router |

---

## Hosting summary

Detail → [../ops/deployment.md](../ops/deployment.md)

| Component | Platform |
|-----------|----------|
| Web SPA | Cloudflare Pages |
| API | Fly.io (Mumbai) |
| Database | Neon (PostgreSQL) |
| Files | Cloudflare R2 |
| OTP | MSG91 |

---

## Scale & portability

| Metric | Year 1 |
|--------|--------|
| Users | ~500 max |
| Members per event | Up to 100 |
| Events per user | Unlimited |
| Initial hosting cost | Free / low tier |

**Portability rule:** Changing hosting, DB, SMS, or storage = **env vars + migrations only**. No application rewrite.

---

## Why these choices (short)

| Choice | Reason |
|--------|--------|
| Modular monolith | One deploy, shared transactions for settlements, fits ~500 users |
| NestJS + Prisma | Structured modules, type-safe DB, strong Nest ecosystem |
| React SPA (not Next) | App is behind login; API already separate |
| Flutter mobile | Approved for Phase 2/3; separate from web but same API |
| MSG91 | India-first OTP cost and delivery |
| Split hosting | Free CDN for web; API in Mumbai; managed Postgres |

---

## Related documents

- [../apps/backend/docs/architecture.md](../apps/backend/docs/architecture.md)
- [../apps/backend/docs/database/schema.md](../apps/backend/docs/database/schema.md)
- [../apps/backend/docs/api/spec.md](../apps/backend/docs/api/spec.md)
- [../ops/deployment.md](../ops/deployment.md)
- [../ops/security-and-dpdp.md](../ops/security-and-dpdp.md)
- [../app-story.md](../app-story.md)
- [../README.md](../README.md)
