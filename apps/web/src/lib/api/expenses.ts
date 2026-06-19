import type { PaginatedResponse } from '../../types/common'
import type { Expense, ExpenseListParams } from '../../types/expense'
import { apiFetch } from './client'

function buildExpenseQuery(params?: ExpenseListParams): string {
  if (!params) return ''

  const search = new URLSearchParams()

  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.sort) search.set('sort', params.sort)
  if (params.order) search.set('order', params.order)
  if (params.categoryId) search.set('categoryId', params.categoryId)
  if (params.paidBy) search.set('paidBy', params.paidBy)
  if (params.dateFrom) search.set('dateFrom', params.dateFrom)
  if (params.dateTo) search.set('dateTo', params.dateTo)
  if (params.search) search.set('search', params.search)

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function listExpenses(
  eventId: string,
  params?: ExpenseListParams,
): Promise<PaginatedResponse<Expense>> {
  const query = buildExpenseQuery(params)
  return apiFetch<PaginatedResponse<Expense>>(
    `/v1/events/${encodeURIComponent(eventId)}/expenses${query}`,
    {
      method: 'GET',
      auth: true,
    },
  )
}

export function getExpense(eventId: string, expenseId: string): Promise<Expense> {
  return apiFetch<Expense>(
    `/v1/events/${encodeURIComponent(eventId)}/expenses/${encodeURIComponent(expenseId)}`,
    {
      method: 'GET',
      auth: true,
    },
  )
}

export type CreateExpensePayload = {
  description: string
  amount: number
  paidBy: string
  sharedAmong: string[]
  expenseDate: string
  categoryId: string
  notes?: string | null
}

export type UpdateExpensePayload = {
  description?: string
  amount?: number
  paidBy?: string
  sharedAmong?: string[]
  expenseDate?: string
  categoryId?: string
  notes?: string | null
}

export function createExpense(
  eventId: string,
  payload: CreateExpensePayload,
): Promise<Expense> {
  return apiFetch<Expense>(`/v1/events/${encodeURIComponent(eventId)}/expenses`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function updateExpense(
  eventId: string,
  expenseId: string,
  payload: UpdateExpensePayload,
): Promise<Expense> {
  return apiFetch<Expense>(
    `/v1/events/${encodeURIComponent(eventId)}/expenses/${encodeURIComponent(expenseId)}`,
    {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    },
  )
}

export function deleteExpense(eventId: string, expenseId: string): Promise<void> {
  return apiFetch<void>(
    `/v1/events/${encodeURIComponent(eventId)}/expenses/${encodeURIComponent(expenseId)}`,
    {
      method: 'DELETE',
      auth: true,
    },
  )
}
