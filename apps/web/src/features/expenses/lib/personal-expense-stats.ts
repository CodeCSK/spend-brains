import { parseAmount } from '../../../lib/amount-display'
import type { Category } from '../../../types/category'
import type { Expense } from '../../../types/expense'

export type PersonalCategoryStat = {
  categoryId: string
  categoryName: string
  categoryIcon?: string
  amount: number
  expenseCount: number
  percent: number
}

export type PersonalExpenseStats = {
  totalShare: number
  expenseCount: number
  categories: PersonalCategoryStat[]
}

export function getUserShareAmount(expense: Expense, userId: string): number {
  const share = expense.shares.find((entry) => entry.userId === userId)
  return parseAmount(share?.amount ?? '0') ?? 0
}

export function buildPersonalExpenseStats(
  expenses: Expense[],
  categories: Category[],
  userId: string,
): PersonalExpenseStats {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const totalsByCategory = new Map<string, { amount: number; count: number }>()

  let totalShare = 0

  for (const expense of expenses) {
    const shareAmount = getUserShareAmount(expense, userId)
    if (shareAmount <= 0) continue

    totalShare += shareAmount

    const existing = totalsByCategory.get(expense.categoryId) ?? { amount: 0, count: 0 }
    totalsByCategory.set(expense.categoryId, {
      amount: existing.amount + shareAmount,
      count: existing.count + 1,
    })
  }

  const categoriesStats = [...totalsByCategory.entries()]
    .map(([categoryId, totals]) => {
      const category = categoryById.get(categoryId)
      return {
        categoryId,
        categoryName: category?.name ?? 'Uncategorized',
        categoryIcon: category?.icon,
        amount: totals.amount,
        expenseCount: totals.count,
        percent: totalShare > 0 ? (totals.amount / totalShare) * 100 : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)

  return {
    totalShare,
    expenseCount: expenses.length,
    categories: categoriesStats,
  }
}

export const PERSONAL_EXPENSE_CHART_COLORS = [
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0284c7',
  '#db2777',
  '#65a30d',
  '#0d9488',
  '#ea580c',
  '#475569',
] as const

export function buildPieChartGradient(categories: PersonalCategoryStat[]): string | undefined {
  if (categories.length === 0) return undefined

  let cursor = 0
  const stops = categories.map((category, index) => {
    const start = cursor
    cursor += category.percent
    const color =
      PERSONAL_EXPENSE_CHART_COLORS[index % PERSONAL_EXPENSE_CHART_COLORS.length]
    return `${color} ${start}% ${cursor}%`
  })

  return `conic-gradient(${stops.join(', ')})`
}
