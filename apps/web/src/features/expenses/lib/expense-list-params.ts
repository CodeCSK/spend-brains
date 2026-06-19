import type { ExpenseListParams } from '../../../types/expense'

const SORT_FIELDS = ['expenseDate', 'amount', 'createdAt', 'description'] as const
const SORT_ORDERS = ['asc', 'desc'] as const

export function parseExpenseListParams(searchParams: URLSearchParams): ExpenseListParams {
  const pageRaw = Number(searchParams.get('page') ?? '1')
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1

  const sortParam = searchParams.get('sort')
  const orderParam = searchParams.get('order')

  return {
    page,
    limit: 20,
    sort: SORT_FIELDS.includes(sortParam as (typeof SORT_FIELDS)[number])
      ? (sortParam as ExpenseListParams['sort'])
      : 'expenseDate',
    order: SORT_ORDERS.includes(orderParam as (typeof SORT_ORDERS)[number])
      ? (orderParam as ExpenseListParams['order'])
      : 'desc',
    categoryId: searchParams.get('categoryId') || undefined,
    paidBy: searchParams.get('paidBy') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    search: searchParams.get('search') || undefined,
  }
}

export function hasActiveExpenseFilters(params: ExpenseListParams): boolean {
  return Boolean(params.categoryId || params.search)
}

export type ExpenseSortColumn = 'expenseDate' | 'amount'

export function nextExpenseSortParams(
  current: Pick<ExpenseListParams, 'sort' | 'order'>,
  column: ExpenseSortColumn,
): Pick<ExpenseListParams, 'sort' | 'order'> {
  if (current.sort === column) {
    return { sort: column, order: current.order === 'desc' ? 'asc' : 'desc' }
  }
  return { sort: column, order: 'desc' }
}

export function formatExpenseDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
