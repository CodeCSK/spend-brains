import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  BookOpen,
  ExternalLink,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  Workflow,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Icon } from '../../../components/Icon'
import { EmptyState, PageHeader, PageLayout, PageSection } from '../../../components/layout'
import { Alert, Badge, Button, Card, CardBody, SegmentedControl } from '../../../components/ui'
import {
  AI_PROMPT_SAMPLES,
  DEPLOYMENT_GUIDE_SECTIONS,
  DEV_CONSOLE_TABS,
  DOC_CATALOG,
  DOC_CATEGORY_LABELS,
  NPM_SCRIPTS,
  OPS_CONFIG,
  STAGING_URLS,
  WORKFLOW_RECIPES,
  WORKSPACE_LABELS,
  type DevConsoleTab,
  type DocEntry,
  type NpmScriptEntry,
  type ScriptWorkspace,
} from '../../../data/dev-console.manifest'
import { getApiBaseUrl, getHealth } from '../../../lib/api/health'
import { getMe } from '../../../lib/api/users'
import { profileKeys } from '../../../lib/query-keys'
import { CopyButton } from '../components/CopyButton'

const healthKeys = {
  api: ['dev-console', 'health'] as const,
}

function StatusBadge({
  label,
  ok,
  detail,
}: {
  label: string
  ok: boolean | null
  detail?: string
}) {
  const variant = ok === null ? 'neutral' : ok ? 'success' : 'warning'
  const text = ok === null ? 'Checking…' : ok ? 'OK' : 'Down'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={variant}>{text}</Badge>
      <span className="text-sm font-medium text-text-primary">{label}</span>
      {detail && <span className="text-sm text-text-secondary">{detail}</span>}
    </div>
  )
}

function CommandRow({ command }: { command: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xp-md bg-surface-subtle px-3 py-2">
      <code className="min-w-0 flex-1 break-all whitespace-pre-wrap text-sm text-text-primary">
        {command}
      </code>
      <CopyButton value={command} className="shrink-0 px-2" />
    </div>
  )
}

function CopyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <div className="flex items-start gap-2 rounded-xp-md bg-surface-subtle px-3 py-2">
        <code className="min-w-0 flex-1 break-all text-sm text-text-primary">{value}</code>
        <CopyButton value={value} className="shrink-0 px-2" />
      </div>
    </div>
  )
}

function ScriptsPanel({ filter }: { filter: ScriptWorkspace | 'all' }) {
  const grouped = useMemo(() => {
    const scripts =
      filter === 'all'
        ? NPM_SCRIPTS
        : NPM_SCRIPTS.filter((script) => script.workspace === filter)

    const map = new Map<string, NpmScriptEntry[]>()
    for (const script of scripts) {
      const key = `${script.workspace} · ${script.group}`
      const list = map.get(key) ?? []
      list.push(script)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [filter])

  if (grouped.length === 0) {
    return (
      <EmptyState icon={Terminal} title="No scripts" description="No npm scripts match this filter." />
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([heading, scripts]) => (
        <section key={heading}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            {heading}
          </h3>
          <ul className="space-y-3">
            {scripts.map((script) => (
              <li key={`${script.workspace}-${script.name}`}>
                <Card>
                  <CardBody className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-sm font-semibold">{script.name}</code>
                      <Badge variant="neutral">{WORKSPACE_LABELS[script.workspace]}</Badge>
                    </div>
                    <CommandRow command={script.command} />
                    <p className="text-sm text-text-primary">{script.description}</p>
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">When:</span> {script.when}
                    </p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function DocsPanel({ category }: { category: DocEntry['category'] | 'all' }) {
  const docs =
    category === 'all'
      ? DOC_CATALOG
      : DOC_CATALOG.filter((doc) => doc.category === category)

  return (
    <ul className="space-y-3">
      {docs.map((doc) => (
        <li key={doc.path}>
          <Card>
            <CardBody className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-sm font-medium">{doc.path}</code>
                <Badge variant="info">{DOC_CATEGORY_LABELS[doc.category]}</Badge>
              </div>
              <p className="text-sm text-text-secondary">{doc.purpose}</p>
            </CardBody>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export function DevConsolePage() {
  const [tab, setTab] = useState<DevConsoleTab>('overview')
  const [scriptFilter, setScriptFilter] = useState<ScriptWorkspace | 'all'>('all')
  const [docFilter, setDocFilter] = useState<DocEntry['category'] | 'all'>('all')

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  const healthQuery = useQuery({
    queryKey: healthKeys.api,
    queryFn: getHealth,
    refetchInterval: 30_000,
    retry: 1,
  })

  const apiUrl = getApiBaseUrl()
  const webMode = import.meta.env.MODE
  const isDev = import.meta.env.DEV
  const currentWebUrl =
    typeof window !== 'undefined' ? window.location.origin : STAGING_URLS.web
  const corsOrigins = `${currentWebUrl},http://localhost:5173`
  const corsFlyCommand = `fly secrets set CORS_ORIGINS="${corsOrigins}"`

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Dev console"
        description="Monorepo health, scripts, docs, and AI prompts — super admin only."
        action={
          <Badge variant="warning" className="self-start">
            Internal
          </Badge>
        }
      />

      <div className="mt-6">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={DEV_CONSOLE_TABS}
          aria-label="Dev console sections"
          stretch
          className="flex-wrap gap-1 sm:flex-nowrap"
        />
      </div>

      {tab === 'overview' && (
        <PageSection aria-labelledby="overview-heading" className="mt-8 space-y-6">
          <h2 id="overview-heading" className="sr-only">
            Overview
          </h2>

          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon={Activity} size={20} aria-hidden />
                <h3 className="text-lg font-semibold">App health</h3>
              </div>
              <StatusBadge
                label="Backend API"
                ok={
                  healthQuery.isLoading
                    ? null
                    : healthQuery.isSuccess && healthQuery.data?.status === 'OK'
                }
                detail={apiUrl}
              />
              <StatusBadge label="Web SPA" ok={true} detail={`Vite ${webMode}${isDev ? ' · dev' : ''}`} />
              {healthQuery.isError && (
                <Alert variant="warning" live>
                  API unreachable — start backend with{' '}
                  <code className="text-sm">npm run start:dev -w backend</code>
                </Alert>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`${apiUrl}/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  /health
                  <Icon icon={ExternalLink} size={16} aria-hidden />
                </a>
                <a
                  href={`${apiUrl}/apis`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Swagger /apis
                  <Icon icon={ExternalLink} size={16} aria-hidden />
                </a>
                <a
                  href={`${apiUrl}/dashboard`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Backend script dashboard
                  <Icon icon={ExternalLink} size={16} aria-hidden />
                </a>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon icon={Rocket} size={20} aria-hidden />
                  <h3 className="text-lg font-semibold">Staging deploy</h3>
                </div>
                <Button type="button" variant="secondary" onClick={() => setTab('deploy')}>
                  Full deploy guide
                </Button>
              </div>
              <p className="text-sm text-text-secondary">
                Repeatable checklist for Cloudflare Pages + Fly.io. CORS is one-time unless the web
                URL changes.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyValueRow label="Web (this browser)" value={currentWebUrl} />
                <CopyValueRow label="API" value={apiUrl} />
              </div>
              <CommandRow command="git push origin main && npm run deploy:api" />
              <p className="text-xs text-text-muted">
                Canonical URLs: {STAGING_URLS.web} · {STAGING_URLS.api}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon icon={Server} size={20} aria-hidden />
                <h3 className="text-lg font-semibold">Architecture snapshot</h3>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
                <li>
                  <strong className="text-text-primary">Web</strong> — React 19 + Vite on{' '}
                  <code>:5173</code> · TanStack Query + Redux (UI) · Storybook on{' '}
                  <code>:6006</code>
                </li>
                <li>
                  <strong className="text-text-primary">Backend</strong> — NestJS + Prisma on{' '}
                  <code>:3000</code> · JWT OTP auth · PostgreSQL (Docker local / Neon prod)
                </li>
                <li>
                  <strong className="text-text-primary">Deploy</strong> — Cloudflare Pages (web) ·
                  Fly.io Mumbai (API) · Neon Postgres
                </li>
              </ul>
            </CardBody>
          </Card>

          {profileQuery.data && (
            <Card>
              <CardBody className="space-y-2 text-sm">
                <p>
                  <span className="text-text-secondary">Signed in as super admin:</span>{' '}
                  <span className="font-medium">{profileQuery.data.phone}</span>
                </p>
                <p className="text-text-secondary">
                  Access is controlled by{' '}
                  <code>SUPER_ADMIN_PHONES</code> in backend env.
                </p>
              </CardBody>
            </Card>
          )}
        </PageSection>
      )}

      {tab === 'deploy' && (
        <PageSection aria-labelledby="deploy-heading" className="mt-8 space-y-6">
          <div className="flex items-center gap-2">
            <Icon icon={Rocket} size={20} aria-hidden />
            <h2 id="deploy-heading" className="text-lg font-semibold">
              Staging deployment guide
            </h2>
          </div>
          <p className="text-sm text-text-secondary">
            Friends beta stack: Cloudflare Pages (web) · Fly.io Mumbai (API) · Neon Postgres.
            Full runbook: <code>docs/plan/friends-beta-deploy.md</code>
          </p>

          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-text-primary">Live URLs</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyValueRow label="Web — current browser" value={currentWebUrl} />
                <CopyValueRow label="Web — production default" value={STAGING_URLS.web} />
                <CopyValueRow label="API (VITE_API_URL)" value={apiUrl} />
                <CopyValueRow label="Fly app" value={STAGING_URLS.flyApp} />
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={STAGING_URLS.web}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Open web
                  <Icon icon={ExternalLink} size={16} aria-hidden />
                </a>
                <a
                  href={`${apiUrl}/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  API /health
                  <Icon icon={ExternalLink} size={16} aria-hidden />
                </a>
                <a
                  href={STAGING_URLS.githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  GitHub repo
                  <Icon icon={ExternalLink} size={16} aria-hidden />
                </a>
              </div>
            </CardBody>
          </Card>

          <Alert variant="info">
            <strong>CORS</strong> uses your current web origin:{' '}
            <code className="text-sm">{corsOrigins}</code>. Set once on Fly — not on every deploy.
          </Alert>

          <ul className="space-y-4">
            {DEPLOYMENT_GUIDE_SECTIONS.map((section) => (
              <li key={section.id}>
                <Card>
                  <CardBody className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-text-primary">{section.title}</h3>
                      {section.summary && (
                        <p className="mt-1 text-sm text-text-secondary">{section.summary}</p>
                      )}
                    </div>
                    <ol className="space-y-3">
                      {section.steps.map((step, index) => {
                        const command =
                          step.command &&
                          section.id === 'cors' &&
                          step.command.startsWith('fly secrets set CORS_ORIGINS')
                            ? corsFlyCommand
                            : step.command

                        return (
                          <li key={`${section.id}-${index}`} className="space-y-1">
                            <p className="text-sm font-medium text-text-primary">
                              {index + 1}. {step.label}
                            </p>
                            {command && <CommandRow command={command} />}
                            {step.note && (
                              <p className="text-xs text-text-muted">{step.note}</p>
                            )}
                          </li>
                        )
                      })}
                    </ol>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      {tab === 'workflows' && (
        <PageSection aria-labelledby="workflows-heading" className="mt-8 space-y-6">
          <div className="flex items-center gap-2">
            <Icon icon={Workflow} size={20} aria-hidden />
            <h2 id="workflows-heading" className="text-lg font-semibold">
              Common workflows
            </h2>
          </div>
          <p className="text-sm text-text-secondary">
            Ordered command recipes — copy each step into your terminal.
          </p>
          <ul className="space-y-4">
            {WORKFLOW_RECIPES.map((recipe) => (
              <li key={recipe.id}>
                <Card>
                  <CardBody className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-text-primary">{recipe.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{recipe.summary}</p>
                    </div>
                    <ol className="space-y-3">
                      {recipe.steps.map((step, index) => (
                        <li key={step.command} className="space-y-1">
                          <p className="text-sm font-medium text-text-primary">
                            {index + 1}. {step.label}
                          </p>
                          <CommandRow command={step.command} />
                          {step.note && (
                            <p className="text-xs text-text-muted">{step.note}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      {tab === 'scripts' && (
        <PageSection aria-labelledby="scripts-heading" className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={Terminal} size={20} aria-hidden />
              <h2 id="scripts-heading" className="text-lg font-semibold">
                npm scripts
              </h2>
            </div>
            <SegmentedControl
              value={scriptFilter}
              onChange={setScriptFilter}
              size="compact"
              aria-label="Filter scripts by workspace"
              options={[
                { value: 'all', label: 'All' },
                { value: 'root', label: 'Root' },
                { value: 'web', label: 'Web' },
                { value: 'backend', label: 'Backend' },
              ]}
            />
          </div>
          <ScriptsPanel filter={scriptFilter} />
        </PageSection>
      )}

      {tab === 'docs' && (
        <PageSection aria-labelledby="docs-heading" className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={BookOpen} size={20} aria-hidden />
              <h2 id="docs-heading" className="text-lg font-semibold">
                Documentation catalog
              </h2>
            </div>
            <SegmentedControl
              value={docFilter}
              onChange={setDocFilter}
              size="compact"
              aria-label="Filter docs by category"
              options={[
                { value: 'all', label: 'All' },
                { value: 'monorepo', label: 'Monorepo' },
                { value: 'web', label: 'Web' },
                { value: 'backend', label: 'Backend' },
                { value: 'plan', label: 'Plan' },
                { value: 'ops', label: 'Ops' },
              ]}
            />
          </div>
          <DocsPanel category={docFilter} />
        </PageSection>
      )}

      {tab === 'ai' && (
        <PageSection aria-labelledby="ai-heading" className="mt-8 space-y-6">
          <div className="flex items-center gap-2">
            <Icon icon={Sparkles} size={20} aria-hidden />
            <h2 id="ai-heading" className="text-lg font-semibold">
              Sample AI commands
            </h2>
          </div>
          <p className="text-sm text-text-secondary">
            Paste into Cursor Agent — each prompt references repo docs as source of truth.
          </p>
          <ul className="space-y-4">
            {AI_PROMPT_SAMPLES.map((sample) => (
              <li key={sample.title}>
                <Card>
                  <CardBody className="space-y-3">
                    <h3 className="font-semibold">{sample.title}</h3>
                    <CommandRow command={sample.prompt} />
                    <div className="flex flex-wrap gap-2">
                      {sample.docs.map((doc) => (
                        <Badge key={doc} variant="neutral">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      {tab === 'ops' && (
        <PageSection aria-labelledby="ops-heading" className="mt-8 space-y-6">
          <h2 id="ops-heading" className="text-lg font-semibold">
            Ops & configuration
          </h2>
          <ul className="space-y-4">
            {OPS_CONFIG.map((entry) => (
              <li key={entry.location}>
                <Card>
                  <CardBody className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{entry.title}</h3>
                      <code className="text-xs text-text-secondary">{entry.location}</code>
                    </div>
                    <p className="text-sm text-text-secondary">{entry.purpose}</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
                      {entry.highlights.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </PageSection>
      )}
    </PageLayout>
  )
}
