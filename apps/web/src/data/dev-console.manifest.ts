export type DevConsoleTab =
  | 'overview'
  | 'deploy'
  | 'workflows'
  | 'scripts'
  | 'docs'
  | 'ai'
  | 'ops'

export type ScriptWorkspace = 'root' | 'web' | 'backend'

export type NpmScriptEntry = {
  workspace: ScriptWorkspace
  name: string
  command: string
  group: string
  description: string
  when: string
}

export type WorkflowRecipe = {
  id: string
  title: string
  summary: string
  steps: { label: string; command: string; note?: string }[]
}

export type DocEntry = {
  path: string
  purpose: string
  category: 'monorepo' | 'web' | 'backend' | 'ops' | 'plan'
}

export type AiPromptSample = {
  title: string
  prompt: string
  docs: string[]
}

export type OpsConfigEntry = {
  title: string
  location: string
  purpose: string
  highlights: string[]
}

export type DeploymentStep = {
  label: string
  command?: string
  note?: string
}

export type DeploymentGuideSection = {
  id: string
  title: string
  summary?: string
  steps: DeploymentStep[]
}

/** Canonical staging URLs — web may differ if Cloudflare project name changes. */
export const STAGING_URLS = {
  web: 'https://spend-brains.pages.dev',
  api: 'https://spendbrains-api-beta.fly.dev',
  flyApp: 'spendbrains-api-beta',
  githubRepo: 'https://github.com/CodeCSK/spend-brains',
} as const

export const DEPLOYMENT_GUIDE_SECTIONS: DeploymentGuideSection[] = [
  {
    id: 'every-release',
    title: 'Every release (web + API changed)',
    summary: 'Typical flow after merging features that touch both apps.',
    steps: [
      {
        label: 'Commit and push to main',
        command: 'git add -A && git status',
        note: 'Do not commit apps/backend/.env or apps/backend/.env.staging.',
      },
      {
        label: 'Push triggers Cloudflare Pages build automatically',
        command: 'git push origin main',
      },
      {
        label: 'Deploy API to Fly.io (from repo root)',
        command: 'npm run deploy:api',
      },
      {
        label: 'Verify API health',
        command: 'curl https://spendbrains-api-beta.fly.dev/health',
        note: 'Expect {"status":"OK"}. Migrations run via fly.toml release_command.',
      },
      {
        label: 'Smoke test production web',
        note: 'Open web URL → login (OTP = last 6 digits of phone) → event → expense → settlements export.',
      },
    ],
  },
  {
    id: 'web-only',
    title: 'Web-only release',
    summary: 'UI changes with no backend API changes.',
    steps: [
      { label: 'Push to main', command: 'git push origin main' },
      {
        label: 'Cloudflare rebuilds automatically',
        note: 'Check deploy log: npm ci → npm run build → apps/web/dist.',
      },
      {
        label: 'No Fly deploy needed',
        note: 'CORS and API secrets unchanged.',
      },
    ],
  },
  {
    id: 'api-only',
    title: 'API-only release',
    summary: 'Backend changes without web bundle changes.',
    steps: [
      { label: 'Push code (optional but recommended)', command: 'git push origin main' },
      { label: 'Deploy API', command: 'npm run deploy:api' },
      {
        label: 'Verify health',
        command: 'curl https://spendbrains-api-beta.fly.dev/health',
      },
    ],
  },
  {
    id: 'cors',
    title: 'CORS (one-time or when web URL changes)',
    summary:
      'CORS_ORIGINS must match the browser origin exactly. Secrets persist — not needed on every deploy.',
    steps: [
      {
        label: 'Set Fly secret (use your real Pages URL)',
        command:
          'fly secrets set CORS_ORIGINS="https://spend-brains.pages.dev,http://localhost:5173"',
        note: 'Run from apps/backend after fly auth login. No redeploy required.',
      },
      {
        label: 'Test preflight',
        command:
          'curl -I -X OPTIONS "https://spendbrains-api-beta.fly.dev/v1/auth/otp/send" -H "Origin: https://spend-brains.pages.dev" -H "Access-Control-Request-Method: POST"',
        note: 'Look for access-control-allow-origin in response headers.',
      },
      {
        label: 'Also in fly.toml',
        note: 'apps/backend/fly.toml [env] CORS_ORIGINS — committed fallback if secret unset.',
      },
    ],
  },
  {
    id: 'cloudflare-pages',
    title: 'Cloudflare Pages settings',
    summary: 'Production branch deploy from GitHub main.',
    steps: [
      { label: 'Root directory', note: '/ (repo root)' },
      { label: 'Build command', note: 'npm run build' },
      { label: 'Build output directory', note: 'apps/web/dist' },
      { label: 'Node version env', note: 'NODE_VERSION=20' },
      {
        label: 'Production env: VITE_API_URL',
        note: 'https://spendbrains-api-beta.fly.dev',
      },
      { label: 'Production env: VITE_BETA_MODE', note: 'true' },
      {
        label: 'Pages URL is stable',
        note: 'https://spend-brains.pages.dev does not change on each deploy — only if project renamed.',
      },
    ],
  },
  {
    id: 'fly-secrets',
    title: 'Fly secrets (first-time setup)',
    summary: 'Set once via fly secrets set — survives redeploys. See apps/backend/.env.staging.example.',
    steps: [
      { label: 'Login', command: 'fly auth login' },
      {
        label: 'Set secrets (replace placeholders)',
        command:
          'fly secrets set DATABASE_URL="postgresql://..." JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..." MSG91_AUTH_KEY="..." MSG91_SENDER_ID="SPBRNS" MSG91_OTP_TEMPLATE_ID="..." CORS_ORIGINS="https://spend-brains.pages.dev,http://localhost:5173" SUPER_ADMIN_PHONES="+91XXXXXXXXXX"',
        note: 'From apps/backend. OTP_USE_PHONE_SUFFIX=true is in fly.toml.',
      },
      { label: 'Deploy', command: 'npm run deploy:api' },
    ],
  },
  {
    id: 'super-admin',
    title: 'Super admin / dev console access',
    steps: [
      {
        label: 'Local API',
        note: 'apps/backend/.env → SUPER_ADMIN_PHONES=+91… (same phone you login with)',
      },
      {
        label: 'Staging API (Fly)',
        command: 'fly secrets set SUPER_ADMIN_PHONES="+91XXXXXXXXXX"',
        note: 'Required for /app/dev-console when web points at Fly API.',
      },
      {
        label: 'Local web → staging API',
        command: 'npm run dev:staging -w web',
        note: 'Uses apps/web/.env.staging — super admin still from Fly secret.',
      },
    ],
  },
  {
    id: 'smoke-test',
    title: 'Staging smoke test',
    steps: [
      { label: 'Open web', note: 'https://spend-brains.pages.dev/login' },
      {
        label: 'Login',
        note: 'Phone +91… → Send OTP → enter last 6 digits of your number.',
      },
      { label: 'Create or join event → add expense' },
      { label: 'Settlements tab → export image' },
      { label: 'Dev console', note: '/app/dev-console — super admin only' },
      { label: 'Mobile browser', note: 'Repeat login flow on phone.' },
    ],
  },
  {
    id: 'share-friends',
    title: 'Share with friends (WhatsApp)',
    steps: [
      {
        label: 'Message template',
        command:
          'Hey! SpendBrains beta for splitting group expenses.\n\nhttps://spend-brains.pages.dev\n\n1. Open link\n2. Sign in with your phone (+91)\n3. Send OTP\n4. OTP = last 6 digits of your number\n   (e.g. 9876543210 → 543210)\n\nJoin event code: XXXXXX\n\nPrivate beta — small group only.',
        note: 'Replace XXXXXX with your event join code.',
      },
    ],
  },
]

export const DEV_CONSOLE_TABS: { value: DevConsoleTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'deploy', label: 'Deploy' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'scripts', label: 'npm scripts' },
  { value: 'docs', label: 'Docs' },
  { value: 'ai', label: 'AI prompts' },
  { value: 'ops', label: 'Ops & config' },
]

export const NPM_SCRIPTS: NpmScriptEntry[] = [
  {
    workspace: 'root',
    name: 'build',
    command: 'npm run build',
    group: 'Build',
    description: 'Production web build (alias for build -w web).',
    when: 'Cloudflare Pages CI uses this at repo root.',
  },
  {
    workspace: 'root',
    name: 'build:web',
    command: 'npm run build:web',
    group: 'Build',
    description: 'Production build of the React SPA.',
    when: 'CI or before deploying web to Cloudflare Pages.',
  },
  {
    workspace: 'root',
    name: 'deploy:api',
    command: 'npm run deploy:api',
    group: 'Deploy',
    description: 'Deploy backend to Fly.io (runs backend workspace deploy).',
    when: 'Friends beta or staging API release.',
  },
  {
    workspace: 'web',
    name: 'dev',
    command: 'npm run dev -w web',
    group: 'Development',
    description: 'Vite dev server on http://localhost:5173.',
    when: 'Daily frontend work.',
  },
  {
    workspace: 'web',
    name: 'dev:staging',
    command: 'npm run dev:staging -w web',
    group: 'Development',
    description: 'Vite in staging mode (uses .env.staging).',
    when: 'Point UI at staging API locally.',
  },
  {
    workspace: 'web',
    name: 'build',
    command: 'npm run build -w web',
    group: 'Build',
    description: 'Typecheck + Vite production bundle.',
    when: 'Before merge; matches CI web build.',
  },
  {
    workspace: 'web',
    name: 'lint',
    command: 'npm run lint -w web',
    group: 'Quality',
    description: 'ESLint + guardrail against raw xp-* classes in features.',
    when: 'Before commit on web changes.',
  },
  {
    workspace: 'web',
    name: 'preview',
    command: 'npm run preview -w web',
    group: 'Development',
    description: 'Serve the production build locally.',
    when: 'Smoke-test build output.',
  },
  {
    workspace: 'web',
    name: 'storybook',
    command: 'npm run storybook -w web',
    group: 'Documentation',
    description: 'Component catalog at http://localhost:6006.',
    when: 'Review or document UI primitives.',
  },
  {
    workspace: 'web',
    name: 'storybook:build',
    command: 'npm run storybook:build -w web',
    group: 'Documentation',
    description: 'Static Storybook export to storybook-static/.',
    when: 'Optional CI gate for stories.',
  },
  {
    workspace: 'backend',
    name: 'start:dev',
    command: 'npm run start:dev -w backend',
    group: 'Development',
    description: 'NestJS watch mode on http://localhost:3000.',
    when: 'Daily API work; OTP logs appear here locally.',
  },
  {
    workspace: 'backend',
    name: 'start:dev:staging',
    command: 'npm run start:dev:staging -w backend',
    group: 'Development',
    description: 'NestJS watch with APP_ENV=staging (reads .env.staging).',
    when: 'Local API against Neon staging DB.',
  },
  {
    workspace: 'backend',
    name: 'build',
    command: 'npm run build -w backend',
    group: 'Build',
    description: 'Compile NestJS to dist/.',
    when: 'Before prod run or Docker image build.',
  },
  {
    workspace: 'backend',
    name: 'start:prod',
    command: 'npm run start:prod -w backend',
    group: 'Development',
    description: 'Run compiled dist/main.js.',
    when: 'Verify production build locally.',
  },
  {
    workspace: 'backend',
    name: 'db:migrate',
    command: 'npm run db:migrate -w backend',
    group: 'Database',
    description: 'Prisma migrate dev — create/apply migrations.',
    when: 'After schema.prisma changes; first-time local setup.',
  },
  {
    workspace: 'backend',
    name: 'db:generate',
    command: 'npm run db:generate -w backend',
    group: 'Database',
    description: 'Regenerate Prisma Client after schema edits.',
    when: 'After git pull or schema change.',
  },
  {
    workspace: 'backend',
    name: 'db:studio',
    command: 'npm run db:studio -w backend',
    group: 'Database',
    description: 'Prisma Studio GUI for browsing/editing rows.',
    when: 'Inspect users, events, expenses in dev.',
  },
  {
    workspace: 'backend',
    name: 'seed:friends-beta',
    command: 'npm run seed:friends-beta -w backend',
    group: 'Database',
    description: 'Seed sample users/events for friends beta.',
    when: 'Populate staging or local demo data.',
  },
  {
    workspace: 'backend',
    name: 'deploy',
    command: 'npm run deploy -w backend',
    group: 'Deploy',
    description: 'fly deploy from apps/backend (Dockerfile at repo root context).',
    when: 'Ship API to Fly.io Mumbai region.',
  },
  {
    workspace: 'backend',
    name: 'test',
    command: 'npm run test -w backend',
    group: 'Test',
    description: 'Jest unit tests.',
    when: 'After changing service logic.',
  },
  {
    workspace: 'backend',
    name: 'test:e2e',
    command: 'npm run test:e2e -w backend',
    group: 'Test',
    description: 'Supertest e2e against HTTP routes.',
    when: 'Before merge on API wiring.',
  },
  {
    workspace: 'backend',
    name: 'lint',
    command: 'npm run lint -w backend',
    group: 'Quality',
    description: 'ESLint + Prettier autofix on src/ and test/.',
    when: 'Before commit on backend changes.',
  },
  {
    workspace: 'backend',
    name: 'format',
    command: 'npm run format -w backend',
    group: 'Quality',
    description: 'Prettier write pass.',
    when: 'Fix formatting only.',
  },
]

export const WORKFLOW_RECIPES: WorkflowRecipe[] = [
  {
    id: 'local-full-stack',
    title: 'Start full local stack',
    summary: 'Postgres + API + web SPA for day-to-day development.',
    steps: [
      { label: 'Start Postgres (repo root)', command: 'docker compose up -d' },
      {
        label: 'Apply migrations (first time or after schema pull)',
        command: 'npm run db:migrate -w backend',
      },
      {
        label: 'API terminal',
        command: 'npm run start:dev -w backend',
      },
      {
        label: 'Web terminal',
        command: 'npm run dev -w web',
      },
    ],
  },
  {
    id: 'db-migration',
    title: 'Database migration (schema change)',
    summary: 'Edit prisma/schema.prisma, then sync dev DB and regenerate client.',
    steps: [
      { label: 'Ensure Postgres is running', command: 'docker compose up -d' },
      {
        label: 'Create & apply migration',
        command: 'npm run db:migrate -w backend',
        note: 'Prompts for migration name when schema changed.',
      },
      {
        label: 'Regenerate client (if migrate did not)',
        command: 'npm run db:generate -w backend',
      },
      {
        label: 'Production / Neon',
        command: 'npx prisma migrate deploy',
        note: 'Run from apps/backend with DATABASE_URL set to Neon pooled URL.',
      },
    ],
  },
  {
    id: 'pre-commit',
    title: 'Pre-commit quality check',
    summary: 'Lint and build both apps before opening a PR.',
    steps: [
      { label: 'Web lint + ui guardrail', command: 'npm run lint -w web' },
      { label: 'Web build', command: 'npm run build -w web' },
      { label: 'Backend lint', command: 'npm run lint -w backend' },
      { label: 'Backend build', command: 'npm run build -w backend' },
      {
        label: 'Optional Storybook static build',
        command: 'npm run storybook:build -w web',
      },
    ],
  },
  {
    id: 'friends-beta-deploy',
    title: 'Friends beta deploy (high level)',
    summary: 'Neon DB + Fly API + Cloudflare Pages web. Full runbook in docs.',
    steps: [
      {
        label: 'Neon — create project, copy pooled DATABASE_URL',
        command: 'npx prisma migrate deploy',
        note: 'From apps/backend with Neon URL in env.',
      },
      {
        label: 'Fly — set secrets, deploy API',
        command: 'npm run deploy -w backend',
      },
      {
        label: 'Cloudflare Pages — connect repo, build web, set VITE_API_URL',
        command: 'npm run build -w web',
      },
    ],
  },
]

export const DOC_CATALOG: DocEntry[] = [
  {
    path: 'docs/AGENTS.md',
    purpose: 'Monorepo agent SSOT — read first for Cursor/AI work.',
    category: 'monorepo',
  },
  {
    path: 'docs/README.md',
    purpose: 'Documentation hub — links to all top-level docs.',
    category: 'monorepo',
  },
  {
    path: 'docs/app-story.md',
    purpose: 'Product behavior, user journeys, domain language.',
    category: 'monorepo',
  },
  {
    path: 'docs/LAYOUT_SYSTEM.md',
    purpose: 'Page shells, nav, landmarks, skeleton patterns.',
    category: 'monorepo',
  },
  {
    path: 'docs/plan/README.md',
    purpose: 'Roadmaps, release phases, tech decisions index.',
    category: 'plan',
  },
  {
    path: 'docs/plan/tech-stack.md',
    purpose: 'Approved stack (NestJS, Prisma, Vite, TanStack Query, etc.).',
    category: 'plan',
  },
  {
    path: 'docs/plan/friends-beta-deploy.md',
    purpose: 'Step-by-step Neon + Fly + Cloudflare friends beta.',
    category: 'plan',
  },
  {
    path: 'docs/plan/pre-launch-checklist.md',
    purpose: 'Go-live checklist before public launch.',
    category: 'plan',
  },
  {
    path: 'docs/ops/deployment.md',
    purpose: 'Production topology: Pages, Fly, Neon, MSG91.',
    category: 'ops',
  },
  {
    path: 'docs/ops/security-and-dpdp.md',
    purpose: 'Security controls and India DPDP notes.',
    category: 'ops',
  },
  {
    path: 'apps/web/docs/README.md',
    purpose: 'Web doc hub and agent read order.',
    category: 'web',
  },
  {
    path: 'apps/web/docs/AI_CONSTITUTION.md',
    purpose: 'Web agent principles, boundaries, doc policy.',
    category: 'web',
  },
  {
    path: 'apps/web/docs/ARCHITECTURE.md',
    purpose: 'Routing, state (Query + Redux), folder layout, API layer.',
    category: 'web',
  },
  {
    path: 'apps/web/docs/DESIGN_SYSTEM.md',
    purpose: 'Design tokens, typography, component styling rules.',
    category: 'web',
  },
  {
    path: 'apps/web/docs/DECISIONS.md',
    purpose: 'W### decision log (Redux, Storybook, Query, etc.).',
    category: 'web',
  },
  {
    path: 'apps/web/docs/COMPONENT_CATALOG.md',
    purpose: 'Index of Storybook UI primitives.',
    category: 'web',
  },
  {
    path: 'apps/web/docs/CODING_STANDARDS.md',
    purpose: 'React/TS/HTML implementation standards.',
    category: 'web',
  },
  {
    path: 'apps/web/docs/TESTING_STRATEGY.md',
    purpose: 'Automated testing approach for web.',
    category: 'web',
  },
  {
    path: 'apps/backend/docs/README.md',
    purpose: 'Backend doc hub; links to module leaf docs.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/architecture.md',
    purpose: 'NestJS modules, layers, request flow.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/authentication.md',
    purpose: 'OTP, JWT, refresh tokens, guards.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/api/spec.md',
    purpose: 'REST contract — endpoints, DTOs, errors.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/database/schema.md',
    purpose: 'Full data model reference.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/events.md',
    purpose: 'Events module behavior.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/expenses.md',
    purpose: 'Expenses and categories module.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/settlements.md',
    purpose: 'Settlement computation and export.',
    category: 'backend',
  },
  {
    path: 'apps/backend/docs/members-and-roles.md',
    purpose: 'Event membership, captain/vice/member roles.',
    category: 'backend',
  },
]

export const AI_PROMPT_SAMPLES: AiPromptSample[] = [
  {
    title: 'Understand API call flow (web → backend)',
    prompt:
      'Read apps/web/docs/ARCHITECTURE.md (API layer) and apps/web/src/lib/api/client.ts. Explain how authenticated requests, token refresh, and error handling work. Then trace one example: listing events from EventsPage.',
    docs: ['apps/web/docs/ARCHITECTURE.md', 'apps/backend/docs/api/spec.md'],
  },
  {
    title: 'Switch or extend UI themes',
    prompt:
      'Read apps/web/docs/DESIGN_SYSTEM.md (tokens) and apps/web/src/lib/store/slices/themeSlice.ts. Explain how theme preference is stored today and what to change to add a dark mode toggle in AppShell.',
    docs: ['apps/web/docs/DESIGN_SYSTEM.md', 'apps/web/docs/DECISIONS.md'],
  },
  {
    title: 'Add a protected backend endpoint',
    prompt:
      'Follow apps/backend/docs/architecture.md and apps/backend/docs/authentication.md. Scaffold a new GET /v1/... route with JwtAuthGuard, DTOs, Swagger decorators, and a web lib/api helper + TanStack Query hook.',
    docs: [
      'apps/backend/docs/architecture.md',
      'apps/backend/docs/authentication.md',
      'apps/backend/docs/api/spec.md',
    ],
  },
  {
    title: 'Implement a new UI feature page',
    prompt:
      'Read apps/web/docs/AI_CONSTITUTION.md, CODING_STANDARDS.md, and LAYOUT_SYSTEM.md. Add a feature under apps/web/src/features/ using components/ui primitives only (no raw xp-btn-*). Include TanStack Query for server state.',
    docs: [
      'apps/web/docs/AI_CONSTITUTION.md',
      'docs/LAYOUT_SYSTEM.md',
      'apps/web/docs/COMPONENT_CATALOG.md',
    ],
  },
  {
    title: 'Run and verify a DB migration',
    prompt:
      'Read apps/backend/README.md and apps/backend/docs/database/schema.md. I changed prisma/schema.prisma — list the exact npm/docker commands to apply locally and on Neon, and what to verify afterward.',
    docs: [
      'apps/backend/README.md',
      'apps/backend/docs/database/schema.md',
      'docs/ops/deployment.md',
    ],
  },
  {
    title: 'Debug OTP / login locally',
    prompt:
      'Read apps/backend/docs/authentication.md and apps/web/README.md auth section. Explain local OTP (logs vs OTP_FIXED_CODE vs phone suffix beta) and which env vars control each path.',
    docs: ['apps/backend/docs/authentication.md', 'apps/web/README.md'],
  },
]

export const OPS_CONFIG: OpsConfigEntry[] = [
  {
    title: 'Docker Compose (local Postgres)',
    location: 'docker-compose.yml',
    purpose: 'Postgres 16 on localhost:5432 for dev (user/db: spendbrains).',
    highlights: [
      'Start: docker compose up -d',
      'Stop: docker compose down',
      'Data volume: spendbrains_pg_data',
    ],
  },
  {
    title: 'Cloudflare Pages (staging web)',
    location: 'Dashboard → Workers & Pages → spend-brains',
    purpose: 'Auto-deploy on push to main; SPA from apps/web/dist.',
    highlights: [
      'Build: npm run build · Output: apps/web/dist',
      'Env: VITE_API_URL, VITE_BETA_MODE=true',
      'URL: https://spend-brains.pages.dev (stable across deploys)',
    ],
  },
  {
    title: 'CORS (Fly ↔ Pages)',
    location: 'fly secrets · apps/backend/fly.toml',
    purpose: 'API allows browser origin from Cloudflare Pages exactly.',
    highlights: [
      'CORS_ORIGINS must match Pages URL — not updated every deploy',
      'fly secrets set CORS_ORIGINS="https://spend-brains.pages.dev,http://localhost:5173"',
      'Wrong example URL spendbrains-web-beta.pages.dev will break login',
    ],
  },
  {
    title: 'Fly.io (staging API)',
    location: 'apps/backend/fly.toml',
    purpose: 'Friends beta API — spendbrains-api-beta, Mumbai (bom), 512MB.',
    highlights: [
      'Release command: prisma migrate deploy',
      'Health check: GET /health',
      'Staging OTP: OTP_USE_PHONE_SUFFIX=true',
    ],
  },
  {
    title: 'Backend Dockerfile',
    location: 'apps/backend/Dockerfile',
    purpose: 'Multi-stage Node 20 image; build from monorepo root context.',
    highlights: [
      'Prisma generate + nest build in build stage',
      'Non-root xpense user in runner',
    ],
  },
  {
    title: 'Web Vite config',
    location: 'apps/web/vite.config.ts',
    purpose: 'Dev server port 5173; Tailwind v4 via @tailwindcss/vite.',
    highlights: [
      'Env: VITE_* from .env.development / .env.staging (committed)',
      'Build: tsc -b && vite build',
    ],
  },
  {
    title: 'Web ESLint + guardrail',
    location: 'apps/web/eslint.config.js · scripts/check-feature-ui-classes.mjs',
    purpose: 'Lint React/TS; block raw xp-btn/card/alert in features/.',
    highlights: ['Run: npm run lint -w web'],
  },
  {
    title: 'Backend ESLint + Prettier',
    location: 'apps/backend/eslint.config.mjs',
    purpose: 'NestJS/TS lint with autofix on commit workflows.',
    highlights: ['Run: npm run lint -w backend'],
  },
  {
    title: 'Backend script dashboard (HTML)',
    location: 'GET http://localhost:3000/dashboard',
    purpose: 'Public HTML page listing backend npm scripts (no login).',
    highlights: ['Source: apps/backend/src/dashboard/'],
  },
  {
    title: 'Swagger API explorer',
    location: 'GET http://localhost:3000/apis',
    purpose: 'Interactive OpenAPI docs when API is running.',
    highlights: ['Bearer auth persisted in browser session'],
  },
]

export const WORKSPACE_LABELS: Record<ScriptWorkspace, string> = {
  root: 'Monorepo root',
  web: 'apps/web',
  backend: 'apps/backend',
}

export const DOC_CATEGORY_LABELS: Record<DocEntry['category'], string> = {
  monorepo: 'Monorepo',
  web: 'Web',
  backend: 'Backend',
  ops: 'Ops',
  plan: 'Plan',
}
