import { Amount } from '../../../../components/ui'
import { cn } from '../../../../lib/cn'
import {
  getCategoryChartColor,
  type CategorySpendStat,
} from '../../lib/expense-summary-stats'
import { ChartLegendMarker } from './ChartLegendMarker'

type SpendingBreakdownProps = {
  categories: CategorySpendStat[]
  title?: string
  subtitle?: string
}

export function SpendingBreakdown({
  categories,
  title = 'Spending breakdown',
  subtitle = 'Share of total by category',
}: SpendingBreakdownProps) {
  if (categories.length === 0) return null

  return (
    <section aria-labelledby="spending-breakdown-heading" className="xp-summary-panel">
      <div className="xp-summary-panel-header">
        <h2 id="spending-breakdown-heading" className="xp-summary-panel-title">
          {title}
        </h2>
        <p className="xp-summary-panel-subtitle">{subtitle}</p>
      </div>

      <ul className="mt-4 space-y-4">
        {categories.map((category, index) => {
          const color = getCategoryChartColor(index)

          return (
          <li key={category.categoryId}>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-2">
                <ChartLegendMarker color={color} iconKey={category.categoryIcon} size={20} />
                <span className="truncate text-sm font-medium text-text-primary">
                  {category.categoryName}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-text-muted">{Math.round(category.percent)}%</span>
                <Amount value={category.amount} className="text-sm" />
              </span>
            </div>

            <div
              className="xp-summary-progress-track mt-2"
              role="progressbar"
              aria-valuenow={Math.round(category.percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${category.categoryName} spending`}
            >
              <div
                className={cn('xp-summary-progress-fill')}
                style={{
                  width: `${Math.max(category.percent, category.percent > 0 ? 2 : 0)}%`,
                  backgroundColor: color,
                  transitionDelay: `${index * 40}ms`,
                }}
              />
            </div>
          </li>
          )
        })}
      </ul>
    </section>
  )
}
