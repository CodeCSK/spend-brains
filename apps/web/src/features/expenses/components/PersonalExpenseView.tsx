import { Receipt, UserRound } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { EmptyState } from '../../../components/layout'
import { Amount } from '../../../components/ui'
import { formatInr } from '../../../lib/format-inr'
import type { Category } from '../../../types/category'
import type { Expense } from '../../../types/expense'
import { CategoryIcon } from '../../categories/components/CategoryIcon'
import {
  buildPersonalExpenseStats,
  buildPieChartGradient,
  getUserShareAmount,
  PERSONAL_EXPENSE_CHART_COLORS,
} from '../lib/personal-expense-stats'
import { formatExpenseDate } from '../lib/expense-list-params'

type PersonalExpenseViewProps = {
  expenses: Expense[]
  categories: Category[]
  currentUserId: string
  getMemberLabel: (userId: string) => string
}

function PersonalExpenseSummary({
  totalShare,
  expenseCount,
  pieGradient,
}: {
  totalShare: number
  expenseCount: number
  pieGradient?: string
}) {
  return (
    <article className="xp-section-card" aria-labelledby="personal-expense-summary-heading">
      <h2
        id="personal-expense-summary-heading"
        className="text-sm font-semibold text-text-label sm:text-base"
      >
        My spending
      </h2>
      <p className="mt-0.5 text-xs text-text-secondary">
        Your share across {expenseCount} expense{expenseCount === 1 ? '' : 's'} in this event.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div
          className="relative h-36 w-36 shrink-0 rounded-xp-full border border-border bg-surface-subtle"
          role="img"
          aria-label={`Category breakdown pie chart, total ${formatInr(totalShare)}`}
        >
          {pieGradient ? (
            <div
              className="absolute inset-2 rounded-xp-full"
              style={{ background: pieGradient }}
            />
          ) : (
            <div className="absolute inset-2 rounded-xp-full bg-surface-subtle" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="rounded-xp-full bg-surface-raised px-3 py-2 text-center shadow-xp-sm">
              <span className="block text-[10px] text-text-muted">Your share</span>
              <Amount value={totalShare} className="text-base" />
            </span>
          </div>
        </div>

        <dl className="grid w-full flex-1 grid-cols-2 gap-2">
          <div className="xp-stat-pill">
            <dt className="xp-amount-label">Total share</dt>
            <dd>
              <Amount value={totalShare} className="mt-0.5 block text-sm sm:text-base" />
            </dd>
          </div>
          <div className="xp-stat-pill">
            <dt className="xp-amount-label">Expenses</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-amount text-text-primary sm:text-base">
              {expenseCount}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

function CategoryBreakdown({
  categories,
}: {
  categories: ReturnType<typeof buildPersonalExpenseStats>['categories']
}) {
  if (categories.length === 0) return null

  return (
    <section aria-labelledby="category-breakdown-heading" className="xp-section-card">
      <h2 id="category-breakdown-heading" className="text-sm font-semibold text-text-label sm:text-base">
        By category
      </h2>

      <ul className="xp-compact-list mt-3">
        {categories.map((category, index) => (
          <li key={category.categoryId} className="xp-compact-list-row">
            <span className="inline-flex min-w-0 items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-xp-full"
                style={{
                  backgroundColor:
                    PERSONAL_EXPENSE_CHART_COLORS[index % PERSONAL_EXPENSE_CHART_COLORS.length],
                }}
                aria-hidden
              />
              {category.categoryIcon ? (
                <CategoryIcon iconKey={category.categoryIcon} size={16} />
              ) : null}
              <span className="truncate font-medium text-text-primary">{category.categoryName}</span>
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-3 text-sm">
              <span className="text-text-muted">
                {Math.round(category.percent)}%
              </span>
              <Amount value={category.amount} className="text-sm" />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PersonalExpenseCard({
  expense,
  category,
  paidByLabel,
  shareAmount,
}: {
  expense: Expense
  category?: Category
  paidByLabel: string
  shareAmount: number
}) {
  return (
    <article className="xp-expense-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text-primary">{expense.description}</p>
          <p className="mt-0.5 text-xs text-text-muted">{formatExpenseDate(expense.expenseDate)}</p>
        </div>
        <Amount value={shareAmount} className="shrink-0 text-sm" />
      </div>

      <div className="xp-expense-card-meta mt-2">
        {category ? (
          <span className="inline-flex max-w-full items-center gap-1 truncate">
            <CategoryIcon iconKey={category.icon} size={16} />
            <span className="truncate">{category.name}</span>
          </span>
        ) : null}
        <span className="inline-flex max-w-full items-center gap-1 truncate">
          <Icon icon={UserRound} size={16} className="shrink-0 text-text-muted" aria-hidden />
          <span className="truncate">{paidByLabel}</span>
        </span>
      </div>

      <p className="mt-2 text-xs text-text-muted">
        Total expense <Amount value={expense.amount} tone="muted" className="text-xs font-medium" />
      </p>
    </article>
  )
}

export function PersonalExpenseView({
  expenses,
  categories,
  currentUserId,
  getMemberLabel,
}: PersonalExpenseViewProps) {
  const stats = buildPersonalExpenseStats(expenses, categories, currentUserId)
  const pieGradient = buildPieChartGradient(stats.categories)
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No personal expenses yet"
        description="Expenses you are included in will appear here with your share and category breakdown."
      />
    )
  }

  return (
    <div className="space-y-4">
      <PersonalExpenseSummary
        totalShare={stats.totalShare}
        expenseCount={stats.expenseCount}
        pieGradient={pieGradient}
      />

      <CategoryBreakdown categories={stats.categories} />

      <section aria-labelledby="personal-expense-list-heading" className="xp-section-card">
        <h2 id="personal-expense-list-heading" className="text-sm font-semibold text-text-label sm:text-base">
          Your expenses
        </h2>

        <ul className="mt-3 space-y-3 md:hidden" aria-label="Your expenses">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <PersonalExpenseCard
                expense={expense}
                category={categoryById.get(expense.categoryId)}
                paidByLabel={getMemberLabel(expense.paidBy)}
                shareAmount={getUserShareAmount(expense, currentUserId)}
              />
            </li>
          ))}
        </ul>

        <div className="xp-data-table-wrap mt-3 hidden overflow-x-auto md:block">
          <table className="xp-data-table">
            <thead>
              <tr>
                <th className="w-[5.5rem]">Date</th>
                <th>Description</th>
                <th className="hidden w-[7rem] md:table-cell">Category</th>
                <th className="w-[7rem]">Paid by</th>
                <th className="w-[5.5rem] text-right">Total</th>
                <th className="w-[5.5rem] text-right">Your share</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const category = categoryById.get(expense.categoryId)
                const shareAmount = getUserShareAmount(expense, currentUserId)

                return (
                  <tr key={expense.id}>
                    <td className="whitespace-nowrap text-text-secondary">
                      {formatExpenseDate(expense.expenseDate)}
                    </td>
                    <td className="max-w-[12rem]">
                      <p className="truncate font-medium text-text-primary">{expense.description}</p>
                    </td>
                    <td className="hidden md:table-cell">
                      {category ? (
                        <span className="inline-flex max-w-[8rem] items-center gap-1.5 truncate text-text-secondary">
                          <CategoryIcon iconKey={category.icon} size={16} />
                          <span className="truncate">{category.name}</span>
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="inline-flex max-w-[7rem] items-center gap-1.5 truncate text-text-secondary">
                        <Icon icon={UserRound} size={16} className="shrink-0 text-text-muted" aria-hidden />
                        <span className="truncate">{getMemberLabel(expense.paidBy)}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <Amount value={expense.amount} tone="muted" className="text-sm" />
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <Amount value={shareAmount} className="text-sm" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
