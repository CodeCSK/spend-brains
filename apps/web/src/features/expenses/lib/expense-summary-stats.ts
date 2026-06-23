import { parseAmount } from '../../../lib/amount-display'
import type { Category } from '../../../types/category'
import type { Expense } from '../../../types/expense'

export type CategorySpendStat = {
  categoryId: string
  categoryName: string
  categoryIcon?: string
  amount: number
  expenseCount: number
  percent: number
}

export type GroupExpenseMetrics = {
  totalSpent: number
  expenseCount: number
}

export type MemberExpenseMetrics = {
  totalPaid: number
  expenseCount: number
}

export type MemberPaidStat = {
  userId: string
  displayName: string
  amount: number
  expenseCount: number
  percent: number
}

export const EXPENSE_CHART_COLORS = [
  '#8453AC',
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#FB7185',
  '#06B6D4',
] as const

export function getCategoryChartColor(index: number): string {
  return EXPENSE_CHART_COLORS[index % EXPENSE_CHART_COLORS.length]
}

export function getExpenseAmount(expense: Expense): number {
  return parseAmount(expense.amount) ?? 0
}

export function buildGroupExpenseMetrics(expenses: Expense[]): GroupExpenseMetrics {
  return {
    totalSpent: expenses.reduce((sum, expense) => sum + getExpenseAmount(expense), 0),
    expenseCount: expenses.length,
  }
}

export function buildMemberExpenseMetrics(expenses: Expense[]): MemberExpenseMetrics {
  return {
    totalPaid: expenses.reduce((sum, expense) => sum + getExpenseAmount(expense), 0),
    expenseCount: expenses.length,
  }
}

export function buildCategorySpendStats(
  expenses: Expense[],
  categories: Category[],
): CategorySpendStat[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const totalsByCategory = new Map<string, { amount: number; count: number }>()
  let total = 0

  for (const expense of expenses) {
    const amount = getExpenseAmount(expense)
    if (amount <= 0) continue

    total += amount
    const existing = totalsByCategory.get(expense.categoryId) ?? { amount: 0, count: 0 }
    totalsByCategory.set(expense.categoryId, {
      amount: existing.amount + amount,
      count: existing.count + 1,
    })
  }

  return [...totalsByCategory.entries()]
    .map(([categoryId, totals]) => {
      const category = categoryById.get(categoryId)
      return {
        categoryId,
        categoryName: category?.name ?? 'Uncategorized',
        categoryIcon: category?.icon,
        amount: totals.amount,
        expenseCount: totals.count,
        percent: total > 0 ? (totals.amount / total) * 100 : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

export function buildMemberPaidStats(
  expenses: Expense[],
  getMemberLabel: (userId: string) => string,
): MemberPaidStat[] {
  const totalsByMember = new Map<string, { amount: number; count: number }>()
  let total = 0

  for (const expense of expenses) {
    const amount = getExpenseAmount(expense)
    if (amount <= 0) continue

    total += amount
    const existing = totalsByMember.get(expense.paidBy) ?? { amount: 0, count: 0 }
    totalsByMember.set(expense.paidBy, {
      amount: existing.amount + amount,
      count: existing.count + 1,
    })
  }

  return [...totalsByMember.entries()]
    .map(([userId, totals]) => ({
      userId,
      displayName: getMemberLabel(userId),
      amount: totals.amount,
      expenseCount: totals.count,
      percent: total > 0 ? (totals.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}
