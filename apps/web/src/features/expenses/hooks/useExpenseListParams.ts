import { useSearchParams } from 'react-router-dom'

import type { ExpenseListParams } from '../../../types/expense'
import { parseExpenseListParams } from '../lib/expense-list-params'

export function useExpenseListParams(): [
  ExpenseListParams,
  (next: Partial<ExpenseListParams>, options?: { replace?: boolean }) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseExpenseListParams(searchParams)

  function setParams(next: Partial<ExpenseListParams>, options?: { replace?: boolean }) {
    const merged: ExpenseListParams = { ...params, ...next }
    const updated = new URLSearchParams()

    if (merged.page && merged.page > 1) updated.set('page', String(merged.page))
    if (merged.sort && merged.sort !== 'expenseDate') updated.set('sort', merged.sort)
    if (merged.order && merged.order !== 'desc') updated.set('order', merged.order)
    if (merged.categoryId) updated.set('categoryId', merged.categoryId)
    if (merged.paidBy) updated.set('paidBy', merged.paidBy)
    if (merged.dateFrom) updated.set('dateFrom', merged.dateFrom)
    if (merged.dateTo) updated.set('dateTo', merged.dateTo)
    if (merged.search) updated.set('search', merged.search)

    setSearchParams(updated, { replace: options?.replace ?? false })
  }

  return [params, setParams]
}
