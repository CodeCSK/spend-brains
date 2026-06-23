import type { ReactNode } from 'react'

import { Amount } from '../../../../components/ui'
import { cn } from '../../../../lib/cn'

type ExpenseSummaryMetricCardProps = {
  label: string
  value: number | string
  hint?: string
  tone?: 'neutral' | 'positive' | 'negative' | 'muted'
  featured?: boolean
  className?: string
  children?: ReactNode
}

export function ExpenseSummaryMetricCard({
  label,
  value,
  hint,
  tone = 'neutral',
  featured = false,
  className,
  children,
}: ExpenseSummaryMetricCardProps) {
  return (
    <article
      className={cn(
        'xp-summary-metric-card group',
        featured && 'xp-summary-metric-card-featured',
        className,
      )}
    >
      <p className="xp-summary-metric-label">{label}</p>
      {typeof value === 'number' ? (
        <Amount
          value={value}
          tone={tone === 'neutral' ? undefined : tone}
          className={cn(
            'xp-summary-metric-value',
            featured && 'xp-summary-metric-value-featured',
          )}
        />
      ) : (
        <p
          className={cn(
            'xp-summary-metric-value tabular-amount font-semibold text-text-primary',
            featured && 'xp-summary-metric-value-featured',
          )}
        >
          {value}
        </p>
      )}
      {hint ? <p className="xp-summary-metric-hint">{hint}</p> : null}
      {children}
    </article>
  )
}
