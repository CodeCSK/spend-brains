import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'

type SwatchProps = {
  name: string
  cssVar: string
  textClass?: string
}

function Swatch({ name, cssVar, textClass = 'text-text-primary' }: SwatchProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-14 w-full rounded-xp-md border border-border shadow-xp-sm"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <p className={`text-xs font-medium ${textClass}`}>{name}</p>
      <p className="font-mono text-[10px] text-text-muted">{cssVar}</p>
    </div>
  )
}

function SwatchGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{children}</div>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text-label">{title}</h2>
      {children}
    </section>
  )
}

function DesignTokensPage() {
  const brandSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-label">Design tokens</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Source of truth: <code className="font-mono">src/styles/tokens.css</code>. Tailwind
          utilities map via <code className="font-mono">src/index.css</code>.
        </p>
      </header>

      <Section title="Brand — lavender purple">
        <SwatchGrid>
          {brandSteps.map((step) => (
            <Swatch
              key={step}
              name={`${step}`}
              cssVar={`--color-lavender-purple-${step}`}
              textClass={step >= 600 ? 'text-text-inverse' : 'text-text-primary'}
            />
          ))}
        </SwatchGrid>
      </Section>

      <Section title="Surfaces">
        <SwatchGrid>
          <Swatch name="Page" cssVar="--color-surface-page" />
          <Swatch name="Subtle" cssVar="--color-surface-subtle" />
          <Swatch name="Raised" cssVar="--color-surface-raised" />
          <Swatch name="Inverse" cssVar="--color-surface-inverse" textClass="text-text-inverse" />
        </SwatchGrid>
      </Section>

      <Section title="Actions">
        <SwatchGrid>
          <Swatch name="Primary" cssVar="--color-primary" textClass="text-text-inverse" />
          <Swatch name="Primary hover" cssVar="--color-primary-hover" textClass="text-text-inverse" />
          <Swatch name="Secondary" cssVar="--color-secondary" />
          <Swatch name="Secondary border" cssVar="--color-secondary-border" />
        </SwatchGrid>
      </Section>

      <Section title="Status">
        <SwatchGrid>
          <Swatch name="Success bg" cssVar="--color-success-bg" />
          <Swatch name="Success text" cssVar="--color-success-text" textClass="text-text-inverse" />
          <Swatch name="Error bg" cssVar="--color-error-bg" />
          <Swatch name="Error text" cssVar="--color-error-text" textClass="text-text-inverse" />
          <Swatch name="Warning bg" cssVar="--color-warning-bg" />
          <Swatch name="Warning text" cssVar="--color-warning-text" />
          <Swatch name="Info bg" cssVar="--color-info-bg" />
          <Swatch name="Info text" cssVar="--color-info-text" />
        </SwatchGrid>
      </Section>

      <Section title="Border radius">
        <div className="flex flex-wrap gap-4">
          {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 border-2 border-primary bg-surface-subtle"
                style={{ borderRadius: `var(--radius-${size})` }}
              />
              <span className="font-mono text-xs text-text-muted">--radius-{size}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Elevation">
        <div className="grid gap-4 sm:grid-cols-3">
          {(['sm', 'md', 'lg'] as const).map((level) => (
            <div
              key={level}
              className="rounded-xp-lg bg-surface-raised p-6"
              style={{ boxShadow: `var(--shadow-${level})` }}
            >
              <p className="font-medium">shadow-{level}</p>
              <p className="mt-1 font-mono text-xs text-text-muted">--shadow-{level}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

const meta = {
  title: 'Foundation/Design Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Visual reference for CSS custom properties in tokens.css.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Palette: Story = {
  render: () => <DesignTokensPage />,
}
