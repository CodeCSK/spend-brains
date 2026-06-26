# Spendbrains — Deployment

> Low-cost hosting with upgrade path; no application rewrite on infra change.  
> Hub → [README.md](./README.md) · Architecture → [../apps/backend/docs/architecture.md](../apps/backend/docs/architecture.md)

## Environment overview

| Component | Platform | Region | Phase |
|-----------|----------|--------|-------|
| Web SPA | Cloudflare Pages | Global CDN | 1 |
| NestJS API | Fly.io | **Mumbai (bom)** | 1 |
| PostgreSQL | Neon | India-adjacent | 1 |
| Object storage | Cloudflare R2 | — | 1 |
| OTP SMS | MSG91 | India | 1 |
| Flutter apps | App Store / Play Store | — | 2–3 |

---

## Environments

| Env | Branch | Purpose |
|-----|--------|---------|
| local | — | Development |
| staging | `develop` | QA |
| production | `master` | Live users |

Branch flow (feature PRs → `develop`, release PRs → `master`): [branching.md](./branching.md)

---

## Docker (API)

Multi-stage NestJS build · Release: `npx prisma migrate deploy`  
**Phase 1 machine:** shared-cpu-1x, 512MB–1GB RAM

---

## Web (Cloudflare Pages)

Build `dist/` · Env: `VITE_API_URL` · Deploy on git push

---

## Database (Neon)

Free tier at launch · Upgrade ~$19/mo when needed  
Migration: `pg_dump` → new host → update `DATABASE_URL`

---

## MSG91

DLT registration + OTP template (1–2 weeks) · ~₹500–1,000/mo at ~500 users

---

## CI/CD

GitHub Actions: lint/test → Fly.io API → Cloudflare Pages web

---

## Pre-launch checklist

- [ ] DLT + MSG91 production OTP  
- [ ] Staging + production + TLS  
- [ ] Secrets not in git  
- [ ] DB backups · CORS locked  

**Friends beta (private, phone-suffix OTP):** [../plan/friends-beta-deploy.md](../plan/friends-beta-deploy.md)

Full gate → [../plan/pre-launch-checklist.md](../plan/pre-launch-checklist.md)

---

## Related documents

- [../apps/backend/docs/architecture.md](../apps/backend/docs/architecture.md)
- [security-and-dpdp.md](./security-and-dpdp.md)
