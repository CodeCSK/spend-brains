import type { Meta, StoryObj } from '@storybook/react'

type TypeSampleProps = {
  label: string
  token: string
  className?: string
  sample?: string
}

function TypeSample({
  label,
  token,
  className = '',
  sample = 'The quick brown fox jumps over the lazy dog.',
}: TypeSampleProps) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-text-label">{label}</span>
        <span className="font-mono text-xs text-text-muted">{token}</span>
      </div>
      <p className={className}>{sample}</p>
    </div>
  )
}

function TypographyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-label">Typography</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Inter variable via <code className="font-mono">@fontsource-variable/inter</code>.
          Scale defined in tokens.css.
        </p>
      </header>

      <section className="xp-card p-5 sm:p-6">
        <TypeSample
          label="Display"
          token="--text-display · 2rem · semibold"
          className="text-[length:var(--text-display)] font-semibold leading-tight"
          sample="Weekend in Goa"
        />
        <TypeSample
          label="Heading 1"
          token="--text-h1 · 1.5rem · semibold"
          className="text-[length:var(--text-h1)] font-semibold"
          sample="Event expenses"
        />
        <TypeSample
          label="Heading 2"
          token="--text-h2 · 1.25rem · semibold"
          className="text-[length:var(--text-h2)] font-semibold"
          sample="Member balances"
        />
        <TypeSample
          label="Heading 3"
          token="--text-h3 · 1.125rem · medium"
          className="text-[length:var(--text-h3)] font-medium"
          sample="Settlement summary"
        />
        <TypeSample
          label="Body"
          token="--text-body · 0.9375rem"
          className="text-[length:var(--text-body)]"
        />
        <TypeSample
          label="Body small"
          token="--text-body-sm · 0.875rem"
          className="text-[length:var(--text-body-sm)] text-text-secondary"
        />
        <TypeSample
          label="Caption"
          token="--text-caption · 0.75rem"
          className="text-[length:var(--text-caption)] text-text-muted"
          sample="Requested 19 Jun 2026, 10:30 AM"
        />
        <TypeSample
          label="Amount (large)"
          token="--text-amount-lg · tabular-nums"
          className="text-[length:var(--text-amount-lg)] font-semibold tabular-nums"
          sample="₹12,450.00"
        />
        <TypeSample
          label="Amount"
          token="--text-amount · tabular-nums"
          className="text-[length:var(--text-amount)] font-medium tabular-nums"
          sample="₹850.00"
        />
      </section>

      <section className="xp-card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-label">Font weights</h2>
        <div className="space-y-2 text-[length:var(--text-body)]">
          <p style={{ fontWeight: 'var(--font-weight-regular)' }}>Regular (400) — body copy</p>
          <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Medium (500) — labels</p>
          <p style={{ fontWeight: 'var(--font-weight-semibold)' }}>Semibold (600) — headings</p>
          <p style={{ fontWeight: 'var(--font-weight-bold)' }}>Bold (700) — emphasis</p>
        </div>
      </section>

      <section className="xp-card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-label">Global classes</h2>
        <div className="space-y-4">
          <div>
            <p className="xp-page-title">xp-page-title</p>
            <p className="xp-page-subtitle">xp-page-subtitle — secondary line under a page title</p>
          </div>
          <p className="xp-label">xp-label — form field label</p>
        </div>
      </section>
    </div>
  )
}

const meta = {
  title: 'Foundation/Typography',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Type scale and global heading classes used across the app.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => <TypographyPage />,
}
