import { Select } from '../../../../components/ui'
import type { Category } from '../../../../types/category'
import type { Expense } from '../../../../types/expense'
import type { Member } from '../../../../types/member'
import { buildMemberExpenseMetrics } from '../../lib/expense-summary-stats'
import {
  CategorySpendBreakdown,
  CategorySpendChart,
  CategorySpendEmpty,
  useCategorySpendStats,
} from './CategorySummary'
import { ExpenseSummaryMetricCard } from './ExpenseSummaryMetricCard'
import { ExpenseSummaryOverview } from './ExpenseSummaryOverview'

type IndividualExpenseSummaryProps = {
  expenses: Expense[]
  categories: Category[]
  members: Member[]
  selectedMemberId: string
  currentUserId: string
  onMemberChange: (memberId: string) => void
}

function memberLabel(member: Member, currentUserId: string): string {
  const name = member.displayName ?? member.phone
  return member.userId === currentUserId ? `${name} (You)` : name
}

export function IndividualExpenseSummary({
  expenses,
  categories,
  members,
  selectedMemberId,
  currentUserId,
  onMemberChange,
}: IndividualExpenseSummaryProps) {
  const metrics = buildMemberExpenseMetrics(expenses)
  const categoryStats = useCategorySpendStats(expenses, categories)
  const hasExpenses = expenses.length > 0

  return (
    <ExpenseSummaryOverview
      title="By member"
      titleId="individual-expense-summary-heading"
      metrics={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="expense-member-select" className="xp-label">
              Paid by
            </label>
            <Select
              id="expense-member-select"
              className="mt-1.5 min-h-11"
              value={selectedMemberId}
              onChange={(event) => onMemberChange(event.target.value)}
            >
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {memberLabel(member, currentUserId)}
                </option>
              ))}
            </Select>
          </div>

          <ExpenseSummaryMetricCard
            label="Total paid"
            value={metrics.totalPaid}
            featured
            className="w-full"
            hint={
              metrics.expenseCount > 0
                ? `${metrics.expenseCount} payment${metrics.expenseCount === 1 ? '' : 's'}`
                : undefined
            }
          />
        </div>
      }
      chart={
        hasExpenses ? (
          <CategorySpendChart
            categories={categoryStats}
            totalLabel="Total paid"
            centerLabel="Paid"
            className="w-full max-w-[15rem] sm:max-w-[16rem] md:max-w-[18rem] xl:max-w-[20rem]"
          />
        ) : (
          <CategorySpendEmpty title="No payments yet" />
        )
      }
      breakdown={hasExpenses ? <CategorySpendBreakdown categories={categoryStats} /> : undefined}
    />
  )
}
