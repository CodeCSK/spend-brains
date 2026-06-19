# Friends Beta Deploy — Runbook

> **Goal:** Live URL you can share with friends **tomorrow**.  
> **Stack:** Neon (DB) · Fly.io Mumbai (API) · Cloudflare Pages (web)  
> **Auth shortcut:** OTP = **last 6 digits of the user's phone** (`OTP_USE_PHONE_SUFFIX`) — no MSG91/DLT needed for private beta.

| Field | Value |
|-------|-------|
| **Plan** | First internet deploy (friends beta) |
| **Status** | Active — infra scaffolded in repo |
| **Time needed** | ~45–90 min tonight |
| **Cost** | Free tier on all three services |

---

## What you get

| URL | Service |
|-----|---------|
| `https://spendbrains-api-beta.fly.dev` | NestJS API (change app name if taken) |
| `https://<your-project>.pages.dev` | React SPA |
| Neon dashboard | PostgreSQL |

Friends log in with their phone number; OTP is the **last 6 digits** of that number (no SMS).

---

## Before you start

Install CLI tools (one-time):

```powershell
# Fly.io
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Cloudflare (optional — Pages UI works without CLI)
npm install -g wrangler
```

Accounts (free):

1. [neon.tech](https://neon.tech) — PostgreSQL
2. [fly.io](https://fly.io) — API hosting
3. [cloudflare.com](https://cloudflare.com) — static web

Push your code to **GitHub** if not already (Cloudflare Pages deploys from git).

---

## Step 1 — Neon database (~10 min)

1. Create project → region **Asia Pacific (Singapore)** or closest to India
2. Copy the **pooled** connection string (must include `?sslmode=require`)
3. Run migrations from your machine:

```powershell
cd "c:\Karthick Projects\Spendbrains\apps\backend"
$env:DATABASE_URL="postgresql://..."   # paste Neon URL
npx prisma migrate deploy
```

4. Confirm tables exist in Neon SQL editor (`users`, `events`, `expenses`, …)

---

## Step 2 — Fly.io API (~20 min)

### 2a. Login and create app

```powershell
cd "c:\Karthick Projects\Spendbrains\apps\backend"
fly auth login
fly apps create spendbrains-api-beta   # pick another name if taken; update fly.toml app =
```

If the app name differs, edit `fly.toml` → `app = 'your-name'`.

### 2b. Generate JWT secrets

```powershell
# Run twice — use output for access and refresh secrets
openssl rand -base64 32
```

### 2c. Set secrets

Replace placeholders. **CORS** — set a placeholder now; update after Step 3 when you know the Pages URL.

```powershell
fly secrets set `
  DATABASE_URL="postgresql://USER:PASS@HOST/neondb?sslmode=require" `
  JWT_ACCESS_SECRET="paste-32-char-secret-here" `
  JWT_REFRESH_SECRET="paste-other-32-char-secret" `
  MSG91_AUTH_KEY="your-msg91-auth-key" `
  MSG91_SENDER_ID="SPBRNS" `
  MSG91_OTP_TEMPLATE_ID="your-dlt-otp-template-id" `
  CORS_ORIGINS="https://spendbrains-web-beta.pages.dev"
```

> `NODE_ENV=staging`, `TURNSTILE_ENABLED=false`, and `OTP_USE_PHONE_SUFFIX=true` are already in `fly.toml`.  
> Example: phone `+919876543210` → OTP `543210`.

### 2d. Deploy

From repo root:

```powershell
npm run deploy:api
```

Or from `apps/backend`:

```powershell
fly deploy
```

### 2e. Verify API

```powershell
curl https://spendbrains-api-beta.fly.dev/health
# → {"status":"OK"}
```

Swagger (optional): `https://spendbrains-api-beta.fly.dev/apis`

---

## Step 3 — Cloudflare Pages (~15 min)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select your `Spendbrains` repo
3. **Build settings:**

| Setting | Value |
|---------|-------|
| Production branch | `main` (or your default branch) |
| Root directory | `/` (repo root) |
| Build command | `npm ci && npm run build -w web` |
| Build output directory | `apps/web/dist` |
| Node version | `20` (Environment variable `NODE_VERSION=20`) |

4. **Environment variables** (Production):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://spendbrains-api-beta.fly.dev` |
| `VITE_BETA_MODE` | `true` |

5. **Save and deploy** → note your URL, e.g. `https://spendbrains-web-beta.pages.dev`

6. **Update CORS** on Fly with the real Pages URL:

```powershell
fly secrets set CORS_ORIGINS="https://spendbrains-web-beta.pages.dev"
```

(Redeploy not required — secrets reload on next request.)

---

## Step 4 — Smoke test (~10 min)

1. Open your Pages URL → `/login`
2. Enter your phone → **Send OTP**
3. Enter the **last 6 digits** of your phone (e.g. `9876543210` → `543210`) → lands on `/app/events`
4. Create event → add expense → settlements tab loads
5. Open the same URL on your phone (mobile browser)

**Two-user test:** second browser/profile, different phone, each uses their own last-6-digit OTP, join event by code.

---

## Step 5 — Share with friends (tomorrow)

Send friends:

```text
Spendbrains beta: https://YOUR-PROJECT.pages.dev
1. Open link → Sign in with your phone (+91)
2. Tap Send OTP
3. Enter the last 6 digits of your mobile number as the OTP
4. Create or join our event with code: XXXXXX
```

> Beta OTP is derived from each person's phone — no shared code to leak.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser console | `fly secrets set CORS_ORIGINS="exact-pages-url-no-trailing-slash"` |
| OTP verify fails | Use last 6 digits of the **same** E.164 phone (+91…); `OTP_USE_PHONE_SUFFIX=true` in `fly.toml`; `NODE_ENV` must be `staging` |
| 502 on API | `fly logs` — often DB URL or migrate failed; run `fly ssh console -C "npx prisma migrate deploy"` |
| `/app/events` 404 on refresh | `_redirects` in `apps/web/public/` — redeploy Pages |
| API cold start (~3s) | Fly free tier stops machines; first request wakes it |
| Rate limit on OTP | Raised in `fly.toml` for beta; or wait 1 hour |

---

## Security notes (friends beta only)

- **Phone-suffix OTP is not production-safe** — fine for a closed friends beta
- Disable `OTP_USE_PHONE_SUFFIX` and enable real MSG91 before public launch
- Do not commit `.env` or secrets to git

---

## After the beta

| Next | Doc |
|------|-----|
| Real SMS OTP (MSG91 + DLT) | [../ops/deployment.md](../ops/deployment.md) |
| Turnstile CAPTCHA | Enable `TURNSTILE_ENABLED` + web widget |
| Privacy / Terms | [pre-launch-checklist.md](./pre-launch-checklist.md) |
| CI/CD | GitHub Actions in a follow-up plan |

---

## Repo artifacts (already added)

| File | Purpose |
|------|---------|
| `apps/backend/Dockerfile` | Multi-stage API container |
| `apps/backend/fly.toml` | Fly app config (Mumbai, health check, migrations) |
| `apps/backend/.env.staging.example` | Secret template |
| `apps/web/public/_redirects` | SPA routing on Pages |
| `apps/web/.env.staging.example` | Web env template |
| `npm run deploy:api` | Deploy API from repo root |

---

## Done checklist

- [ ] Neon DB + migrations applied
- [ ] Fly secrets set + `fly deploy` + `/health` OK
- [ ] Cloudflare Pages live + env vars set
- [ ] CORS updated to Pages URL
- [ ] Login + create event works on desktop and phone
- [ ] Friends message drafted with URL + login instructions + event code
