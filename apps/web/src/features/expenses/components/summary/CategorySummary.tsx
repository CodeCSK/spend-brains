import { PieChart } from 'lucide-react'

import { EmptyState } from '../../../../components/layout'
import { Amount } from '../../../../components/ui'
import type { Category } from '../../../../types/category'
import type { Expense } from '../../../../types/expense'
import {
  buildCategorySpendStats,
  getCategoryChartColor,
  type CategorySpendStat,
} from '../../lib/expense-summary-stats'
import { ChartLegendMarker } from './ChartLegendMarker'
import { ExpenseDoughnutChart } from './ExpenseDoughnutChart'

type CategorySpendProps = {
  expenses: Expense[]
  categories: Category[]
  totalLabel: string
  centerLabel: string
  emptyTitle?: string
}

export function useCategorySpendStats(expenses: Expense[], categories: Category[]) {
  return buildCategorySpendStats(expenses, categories)
}

export function CategorySpendEmpty({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  return (
    <EmptyState
      icon={PieChart}
      title={title}
      className={className ?? 'border-0 bg-transparent p-4 shadow-none sm:p-6'}
    />
  )
}

export function CategorySpendChart({
  categories,
  totalLabel,
  centerLabel,
  className,
}: {
  categories: CategorySpendStat[]
  totalLabel: string
  centerLabel: string
  className?: string
}) {
  if (categories.length === 0) {
    return null
  }

  return (
    <ExpenseDoughnutChart
      categories={categories}
      totalLabel={totalLabel}
      centerLabel={centerLabel}
      className={className}
    />
  )
}

export function CategorySpendBreakdown({ categories }: { categories: CategorySpendStat[] }) {
  if (categories.length === 0) {
    return null
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-label="Category breakdown">
      {categories.map((category, index) => {
        const color = getCategoryChartColor(index)

        return (
          <li key={category.categoryId}>
            <div className="xp-category-chip">
              <span className="flex min-w-0 items-center gap-2">
                <ChartLegendMarker color={color} iconKey={category.categoryIcon} />
                <span className="truncate text-sm font-medium text-text-primary">
                  {category.categoryName}
                </span>
              </span>
              <span className="ml-2 flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium text-text-muted">
                  {Math.round(category.percent)}%
                </span>
                <Amount value={category.amount} className="text-sm" />
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** @deprecated Prefer CategorySpendChart + CategorySpendBreakdown in ExpenseSummaryOverview */
export function CategorySummary({
  expenses,
  categories,
  totalLabel,
  centerLabel,
  emptyTitle = 'No spending yet',
}: CategorySpendProps) {
  const categoryStats = useCategorySpendStats(expenses, categories)

  if (expenses.length === 0) {
    return <CategorySpendEmpty title={emptyTitle} />
  }

  return (
    <div className="space-y-5">
      <CategorySpendChart
        categories={categoryStats}
        totalLabel={totalLabel}
        centerLabel={centerLabel}
      />
      <CategorySpendBreakdown categories={categoryStats} />
    </div>
  )
}
