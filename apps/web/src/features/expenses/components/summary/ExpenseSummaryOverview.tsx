import type { ReactNode } from 'react'

import { cn } from '../../../../lib/cn'

type ExpenseSummaryOverviewProps = {
  title: string
  titleId: string
  metrics: ReactNode
  chart: ReactNode
  breakdown?: ReactNode
  className?: string
}

export function ExpenseSummaryOverview({
  title,
  titleId,
  metrics,
  chart,
  breakdown,
  className,
}: ExpenseSummaryOverviewProps) {
  return (
    <section aria-labelledby={titleId} className={cn('space-y-4', className)}>
      <div className="xp-summary-panel xp-chart-enter">
        <h2 id={titleId} className="xp-summary-panel-title">
          {title}
        </h2>

        <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-8 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
          <div className="min-w-0">{metrics}</div>
          <div className="min-w-0 flex justify-center md:justify-end">{chart}</div>
        </div>

        {breakdown ? (
          <div className="mt-5 border-t border-border pt-5">{breakdown}</div>
        ) : null}
      </div>
    </section>
  )
}
