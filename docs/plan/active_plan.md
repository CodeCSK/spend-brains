# Active Plan — Friends Beta Deploy

> **Agent working doc.** Replaces web Phase 2 plan for deployment work.  
> Full runbook → [friends-beta-deploy.md](./friends-beta-deploy.md)

| Field | Value |
|-------|-------|
| **Plan** | First internet deploy for friends beta (tomorrow) |
| **Status** | Active |
| **Started** | 2026-06-19 |
| **Replaces** | Web Phase 2 Component Architecture — Complete |

---

## Goal

Get a **stable HTTPS URL** live tonight so friends can use Spendbrains tomorrow: login → events → expenses → settlements.

**Scope:** Staging only. Phone-suffix OTP (last 6 digits). No MSG91/DLT, no Turnstile, no legal pages yet.

---

## Steps

### Step 0 — Repo infra (engineering)

- [x] `apps/backend/Dockerfile` + `fly.toml` + `.dockerignore`
- [x] `apps/web/public/_redirects` (SPA fallback)
- [x] `.env.staging.example` for backend + web
- [x] `VITE_BETA_MODE` login hints on web
- [x] `npm run deploy:api` root script
- [x] Runbook: [friends-beta-deploy.md](./friends-beta-deploy.md)

**Verify:** `docker build` from repo root with `-f apps/backend/Dockerfile` succeeds.

---

### Step 1 — Neon database (human, ~10 min)

- [ ] Create Neon project
- [ ] Run `prisma migrate deploy` against Neon URL
- [ ] Save `DATABASE_URL` for Fly secrets

**Verify:** Tables visible in Neon console.

---

### Step 2 — Fly.io API (human, ~20 min)

- [ ] `fly auth login`
- [ ] Create app (name in `fly.toml` or update file)
- [ ] `fly secrets set` (see runbook)
- [ ] `npm run deploy:api`
- [ ] `GET /health` returns OK

**Verify:** Swagger at `/apis` loads.

---

### Step 3 — Cloudflare Pages (human, ~15 min)

- [ ] Connect GitHub repo
- [ ] Build: `npm ci && npm run build -w web` → output `apps/web/dist`
- [ ] Env: `VITE_API_URL`, `VITE_BETA_MODE=true`
- [ ] Update Fly `CORS_ORIGINS` to Pages URL

**Verify:** Login page loads; no CORS errors in DevTools.

---

### Step 4 — End-to-end smoke (human, ~10 min)

- [ ] Login with last-6-digit OTP
- [ ] Create event + expense + settlement view
- [ ] Test on mobile browser
- [ ] Two-user join flow

**Verify:** [web E2E checklist](../../apps/web/README.md#e2e-test-checklist) items 1–15 on live URLs.

---

### Step 5 — Share with friends (tomorrow)

- [ ] Message with Pages URL + login instructions + event join code
- [ ] Monitor `fly logs` during first session

---

## Done log

| Date | Step | Notes |
|------|------|-------|
| 2026-06-19 | 0 | Dockerfile, fly.toml, _redirects, beta login UX, runbook |

---

## Related

- [friends-beta-deploy.md](./friends-beta-deploy.md) — step-by-step commands
- [../ops/deployment.md](../ops/deployment.md) — production target architecture
- [pre-launch-checklist.md](./pre-launch-checklist.md) — after beta
