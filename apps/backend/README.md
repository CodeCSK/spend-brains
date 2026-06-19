# Spendbrains Backend

NestJS backend for Spendbrains.

## Prerequisites

- Node.js 20+ (see repo root `.nvmrc`)
- PostgreSQL locally — **Docker** (recommended) or [Prisma Dev](https://www.prisma.io/docs/cli/dev)

## Environment

Copy the example file and adjust values locally (`.env` is gitignored):

```bash
cp .env.example .env
```

| File | Command | Purpose |
|------|---------|---------|
| `.env` | `npm run start:dev` | Local Docker Postgres |
| `.env.staging` | `npm run start:dev:staging` | Local backend against Neon (copy from `.env.staging.example`) |

Required variables are validated at startup via `@nestjs/config` + Joi. See `.env.example` for `DATABASE_URL`, JWT secrets, and MSG91 placeholders.

## Development

From `apps/backend`:

```bash
npm run start:dev
```

| URL | Purpose |
|-----|---------|
| `GET /dashboard` | npm scripts reference — what each script does, when to use, copy command |
| `GET /apis` | Swagger API documentation |
| `GET /health` | Health check JSON |

## Database (Prisma + PostgreSQL)

From the **repo root**:

```bash
docker compose up -d
```

Ensure `apps/backend/.env` exists (copy from `.env.example`) with a valid `DATABASE_URL`.

Then from `apps/backend`:

```bash
npm run db:migrate
npm run db:generate
npm run db:studio   # optional GUI
```

Production uses [Neon](https://neon.tech) — see `docs/ops/deployment.md`.

## Documentation

Backend-specific docs live in [`docs/`](./docs/README.md) (architecture, schema, API contract).

Project-wide docs: [`../../docs/README.md`](../../docs/README.md) · Agents: [`../../docs/AGENTS.md`](../../docs/AGENTS.md)

## Scripts

| Script | Command |
|--------|---------|
| `start:dev` | Dev server with watch |
| `db:migrate` | `prisma migrate dev` |
| `db:generate` | `prisma generate` |
| `db:studio` | `prisma studio` |
| `test:e2e` | End-to-end tests |
