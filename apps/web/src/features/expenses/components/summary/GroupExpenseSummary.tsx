import { Amount } from '../../../../components/ui'
import type { Category } from '../../../../types/category'
import type { Expense } from '../../../../types/expense'
import {
  buildGroupExpenseMetrics,
  buildMemberPaidStats,
  getCategoryChartColor,
} from '../../lib/expense-summary-stats'
import {
  CategorySpendBreakdown,
  CategorySpendChart,
  CategorySpendEmpty,
  useCategorySpendStats,
} from './CategorySummary'
import { ChartLegendMarker } from './ChartLegendMarker'
import { ExpenseSummaryMetricCard } from './ExpenseSummaryMetricCard'
import { ExpenseSummaryOverview } from './ExpenseSummaryOverview'

type GroupExpenseSummaryProps = {
  expenses: Expense[]
  categories: Category[]
  getMemberLabel: (userId: string) => string
}

export function GroupExpenseSummary({
  expenses,
  categories,
  getMemberLabel,
}: GroupExpenseSummaryProps) {
  const metrics = buildGroupExpenseMetrics(expenses)
  const memberStats = buildMemberPaidStats(expenses, getMemberLabel)
  const categoryStats = useCategorySpendStats(expenses, categories)
  const hasExpenses = expenses.length > 0

  return (
    <>
      <ExpenseSummaryOverview
        title="Group total"
        titleId="group-expense-summary-heading"
        metrics={
          <ExpenseSummaryMetricCard
            label="Total spent"
            value={metrics.totalSpent}
            featured
            className="w-full"
            hint={
              metrics.expenseCount > 0
                ? `${metrics.expenseCount} expense${metrics.expenseCount === 1 ? '' : 's'}`
                : undefined
            }
          />
        }
        chart={
          hasExpenses ? (
            <CategorySpendChart
              categories={categoryStats}
              totalLabel="Group total"
              centerLabel="Total"
              className="w-full max-w-[15rem] sm:max-w-[16rem] lg:max-w-[18rem]"
            />
          ) : (
            <CategorySpendEmpty title="No expenses yet" />
          )
        }
        breakdown={hasExpenses ? <CategorySpendBreakdown categories={categoryStats} /> : undefined}
      />

      {memberStats.length > 0 && (
        <div className="xp-summary-panel">
          <h3 className="xp-summary-panel-title">Paid by member</h3>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Member payments">
            {memberStats.map((member, index) => (
              <li key={member.userId}>
                <div className="xp-category-chip">
                  <span className="flex min-w-0 items-center gap-2">
                    <ChartLegendMarker color={getCategoryChartColor(index)} />
                    <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                      {member.displayName}
                    </span>
                  </span>
                  <span className="ml-2 flex shrink-0 items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {Math.round(member.percent)}%
                    </span>
                    <Amount value={member.amount} className="text-sm" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
