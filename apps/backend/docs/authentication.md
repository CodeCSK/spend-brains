# Authentication

> Phase 1: phone OTP via MSG91 · JWT sessions · `/v1/auth/*`  
> API contract → [api/spec.md](./api/spec.md) · Security → [../../../../docs/ops/security-and-dpdp.md](../../../../docs/ops/security-and-dpdp.md)

| Doc version | 1.0 |

---

## Overview

| Item | Implementation |
|------|----------------|
| Primary auth | Phone OTP (India `+91`) via MSG91 |
| OTP storage | SHA-256 hash in `otp_codes` — never plain text |
| OTP TTL | 5–10 min (`OTP_TTL_MINUTES`, default 10) |
| Rate limits | Per phone + per IP (`OTP_RATE_LIMIT_*`) |
| Web CAPTCHA | Cloudflare Turnstile before OTP send |
| Access token | JWT, short-lived (`JWT_ACCESS_EXPIRES_IN`, default 15m) |
| Refresh token | Opaque token, hashed in `refresh_tokens`, ~30 days |
| Logout | Revoke one refresh token or all for user |

Clients send `Authorization: Bearer <access_token>` on protected routes.

---

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/auth/otp/send` | Public | Send OTP to phone |
| POST | `/v1/auth/otp/verify` | Public | Verify OTP → tokens + user |
| POST | `/v1/auth/refresh` | Public | Rotate refresh token |
| POST | `/v1/auth/logout` | Public | Revoke refresh token (current device) |
| POST | `/v1/auth/logout-all` | Bearer | Revoke all refresh tokens for user |
| GET | `/v1/users/me` | Bearer | Current user profile |
| PATCH | `/v1/users/me` | Bearer | Update profile (`displayName`, `avatarUrl`) |

Interactive docs: `GET /apis` (Swagger UI).

---

## Testing the full sign-in flow in Swagger

1. Start the server: `npm run start:dev` from `apps/backend`.
2. Open **http://localhost:3000/apis**.
3. Expand **Auth** and run endpoints in this order.

### Step 1 — Send OTP

`POST /v1/auth/otp/send` → **Try it out**

```json
{
  "phone": "+91XXXXXXXXXX",
  "otpConsent": true,
  "client": "mobile"
}
```

Use `client: "mobile"` locally to skip CAPTCHA. For `client: "web"`, set `TURNSTILE_ENABLED=false` in `.env` or pass `captchaToken`.

**Execute** → expect `200` and the generic success message.

**Get the OTP** (see [How OTP is delivered](#how-otp-is-delivered-by-environment) below).

### Step 2 — Verify OTP (sign in / sign up)

`POST /v1/auth/otp/verify`

```json
{
  "phone": "+91XXXXXXXXXX",
  "otp": "123456"
}
```

**Execute** → copy `accessToken` and `refreshToken` from the response.

### Step 3 — Authorize Swagger

Click **Authorize** (top right) → paste the `accessToken` (Swagger adds `Bearer` automatically) → **Authorize** → **Close**.

### Step 4 — Confirm session

`GET /v1/users/me` (under **Users**) → **Execute** → your profile JSON.

### Step 4b — Update profile (optional)

`PATCH /v1/users/me`

```json
{
  "displayName": "Karthick",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
}
```

Both fields are optional; send `null` to clear. At least one field is required per request.

**Response** — updated profile (same shape as `GET /v1/users/me`):

```json
{
  "id": "uuid",
  "phone": "+919876543210",
  "displayName": "Karthick",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  "phoneVerifiedAt": "2025-06-15T12:00:00.000Z",
  "createdAt": "2025-06-15T12:00:00.000Z"
}
```

### Step 5 — Refresh token (optional)

`POST /v1/auth/refresh`

```json
{ "refreshToken": "<paste refreshToken from step 2>" }
```

Returns new tokens; old refresh token is revoked.

### Step 6 — Logout (optional)

`POST /v1/auth/logout` — body: `{ "refreshToken": "..." }` (no Authorize needed).

`POST /v1/auth/logout-all` — requires Authorize (access token).

### Check the database

`npm run db:studio` → tables `users`, `otp_codes`, `refresh_tokens`.

---

## How OTP is delivered by environment

| Environment | How you get the OTP | `.env` setup |
|-------------|-------------------|--------------|
| **Local dev (easiest)** | **Server terminal** — placeholder MSG91 key logs `[dev] OTP for +91…: 123456` | `MSG91_AUTH_KEY=your-msg91-auth-key` (default in `.env.example`) |
| **Local dev (fixed code)** | Always the same code you set | `OTP_FIXED_CODE=123456` (never use in production) |
| **Friends beta (staging)** | **Last 6 digits of phone** — no SMS | `OTP_USE_PHONE_SUFFIX=true`, `NODE_ENV=staging` (set in `fly.toml`) |
| **Local dev (real SMS)** | **Your phone** via SMS | Real `MSG91_AUTH_KEY`, `MSG91_OTP_TEMPLATE_ID`, DLT-approved template |
| **Production** | **User's phone** via SMS only | Real MSG91 credentials — no `OTP_FIXED_CODE`, no `OTP_USE_PHONE_SUFFIX` |

The API never returns the OTP in the HTTP response (by design).

---

## `.env` vs `.env.example`

| File | Purpose | Git |
|------|---------|-----|
| **`.env.example`** | Template listing every variable with safe placeholders and comments | **Committed** — safe to share |
| **`.env`** | Your real local secrets and overrides | **Never commit** (gitignored) |

**Workflow:**

```bash
cp .env.example .env   # once, when setting up
# edit .env with your values
```

The app reads **only `.env`** at runtime. `.env.example` is documentation for you and teammates.

**Typical local `.env` for Swagger testing:**

```env
TURNSTILE_ENABLED=false
MSG91_AUTH_KEY=your-msg91-auth-key
# optional: OTP_FIXED_CODE=123456
```

**Staging/production:** set secrets on the host (Fly.io secrets, etc.) — same variable names, real values, no file in git.

---

## OTP send (`POST /v1/auth/otp/send`)

**Body**

```json
{
  "phone": "+919876543210",
  "otpConsent": true,
  "client": "web",
  "captchaToken": "turnstile-response-token"
}
```

| Field | Rules |
|-------|-------|
| `phone` | India mobile: `+91XXXXXXXXXX`, `91XXXXXXXXXX`, or 10 digits |
| `otpConsent` | Must be `true` (DPDP — SMS consent) |
| `client` | `web` (default) or `mobile` |
| `captchaToken` | Required for `web` when `TURNSTILE_ENABLED=true` |

**Response** — always the same message (no phone enumeration):

```json
{ "message": "If this number is valid, an OTP has been sent." }
```

**Errors:** `400` rate limit / CAPTCHA / SMS failure · `429` implicit via 400 message

**Local dev:** placeholder MSG91 key logs OTP to the server console instead of sending SMS.

---

## OTP verify (`POST /v1/auth/otp/verify`)

**Body**

```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "opaque-base64url-token",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "displayName": null,
    "avatarUrl": null
  }
}
```

Creates the user on first successful verify; sets `phone_verified_at`.

**Errors:** `401` invalid/expired OTP or max attempts (`OTP_MAX_ATTEMPTS`)

---

## Refresh (`POST /v1/auth/refresh`)

**Body**

```json
{ "refreshToken": "opaque-base64url-token" }
```

Returns the same shape as verify. Old refresh token is revoked (rotation).

---

## Logout

**Current device** — `POST /v1/auth/logout` with `{ "refreshToken": "..." }` (no access token required).

**All devices** — `POST /v1/auth/logout-all` with `Authorization: Bearer <access_token>`.

---

## Guards (NestJS)

Global `JwtAuthGuard` protects all routes except those marked `@Public()`.

Planned chain for domain routes (events, expenses):

```text
JWT → event membership → role → expense ownership
```

Use `@CurrentUser()` to read `{ id }` from the access token.

---

## Database tables

| Table | Purpose |
|-------|---------|
| `users` | Profile; `phone` unique |
| `otp_codes` | Hashed OTP, expiry, attempts, IP for rate limits |
| `refresh_tokens` | Hashed refresh token, expiry, `revoked_at` |

Schema detail → [database/schema.md](./database/schema.md)

---

## Environment variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `JWT_ACCESS_SECRET` | yes | — | min 32 chars |
| `JWT_REFRESH_SECRET` | yes | — | min 32 chars (reserved for future JWT refresh) |
| `JWT_ACCESS_EXPIRES_IN` | no | `15m` | Access JWT lifetime |
| `JWT_REFRESH_EXPIRES_IN` | no | `30d` | Refresh token DB expiry |
| `MSG91_AUTH_KEY` | yes | — | Dev placeholder skips real SMS |
| `MSG91_SENDER_ID` | yes | — | DLT sender ID |
| `MSG91_OTP_TEMPLATE_ID` | yes | — | DLT OTP template |
| `OTP_TTL_MINUTES` | no | `10` | 5–10 per security spec |
| `OTP_MAX_ATTEMPTS` | no | `5` | Per OTP record |
| `OTP_RATE_LIMIT_PHONE_PER_HOUR` | no | `3` | |
| `OTP_RATE_LIMIT_IP_PER_HOUR` | no | `10` | |
| `TURNSTILE_ENABLED` | no | `false` | Set `true` in production for web |
| `TURNSTILE_SITE_KEY` | if Turnstile on | — | Public site key for web SPA (future) |
| `OTP_FIXED_CODE` | no | — | Fixed 6-digit OTP for dev/test only — **never production** |
| `OTP_USE_PHONE_SUFFIX` | no | `false` | Staging beta: OTP = last 6 digits of phone — **never production** |
| `CORS_ORIGINS` | no | `localhost:5173,3000` | Comma-separated SPA origins |
| `TURNSTILE_SECRET_KEY` | if Turnstile on | — | Cloudflare site secret |

See `.env.example`.

---

## Module layout

```text
src/auth/          AuthController, AuthService, JwtStrategy, JwtAuthGuard
src/sms/           SmsProvider → Msg91Provider (swappable)
src/captcha/       Turnstile verification
src/prisma/        PrismaService (users, otp_codes, refresh_tokens)
src/common/        @Public(), @CurrentUser(), hash helpers
```

---

## Phase 2/3 (not implemented)

- `POST /v1/auth/apple`
- `POST /v1/auth/google`

---

## Related documents

- [api/spec.md](./api/spec.md)
- [architecture.md](./architecture.md)
- [database/schema.md](./database/schema.md)
- [../../../../docs/ops/security-and-dpdp.md](../../../../docs/ops/security-and-dpdp.md)
