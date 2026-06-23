import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { ExpenseListParams } from '../../../types/expense'
import { parseExpenseListParams } from '../lib/expense-list-params'

type ExpenseListState = Omit<ExpenseListParams, 'page' | 'paidBy'>

const LIST_QUERY_KEYS = ['sort', 'order', 'limit', 'categoryId', 'search', 'dateFrom', 'dateTo'] as const

function readPage(searchParams: URLSearchParams): number {
  const pageRaw = Number(searchParams.get('page') ?? '1')
  return Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
}

function toListState(parsed: ExpenseListParams): ExpenseListState {
  return {
    limit: parsed.limit,
    sort: parsed.sort,
    order: parsed.order,
    categoryId: parsed.categoryId,
    dateFrom: parsed.dateFrom,
    dateTo: parsed.dateTo,
    search: parsed.search,
  }
}

function stripListQueryKeys(current: URLSearchParams): URLSearchParams {
  const updated = new URLSearchParams(current)
  let changed = false

  for (const key of LIST_QUERY_KEYS) {
    if (updated.has(key)) {
      updated.delete(key)
      changed = true
    }
  }

  return changed ? updated : current
}

function applyPageToUrl(current: URLSearchParams, page: number): URLSearchParams {
  const updated = new URLSearchParams(current)

  if (page > 1) {
    updated.set('page', String(page))
  } else {
    updated.delete('page')
  }

  return updated
}

function shouldResetPage(next: Partial<ExpenseListParams>): boolean {
  return (
    next.search !== undefined ||
    next.categoryId !== undefined ||
    next.limit !== undefined ||
    next.sort !== undefined ||
    next.order !== undefined ||
    next.dateFrom !== undefined ||
    next.dateTo !== undefined
  )
}

export function useExpenseListParams(): [
  ExpenseListParams,
  (next: Partial<ExpenseListParams>, options?: { replace?: boolean }) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()
  const cleanedUrl = useRef(false)

  const [listState, setListState] = useState<ExpenseListState>(() =>
    toListState(parseExpenseListParams(searchParams)),
  )

  const page = readPage(searchParams)
  const params: ExpenseListParams = { ...listState, page }

  useEffect(() => {
    if (cleanedUrl.current) return
    cleanedUrl.current = true
    setSearchParams((current) => stripListQueryKeys(current), { replace: true })
  }, [setSearchParams])

  const setParams = useCallback(
    (next: Partial<ExpenseListParams>, options?: { replace?: boolean }) => {
      const replace = options?.replace ?? true
      const { page: nextPage, paidBy: _paidBy, ...stateNext } = next

      if (Object.keys(stateNext).length > 0) {
        setListState((previous) => ({ ...previous, ...stateNext }))
      }

      const pageToApply = nextPage ?? (shouldResetPage(next) ? 1 : undefined)

      if (pageToApply !== undefined) {
        setSearchParams((current) => applyPageToUrl(current, pageToApply), { replace })
      }
    },
    [setSearchParams],
  )

  return [params, setParams]
}
