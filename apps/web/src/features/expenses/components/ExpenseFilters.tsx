import { Search, X } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Button, Input, Select } from '../../../components/ui'
import type { Category } from '../../../types/category'
import type { ExpenseListParams } from '../../../types/expense'
import { hasActiveExpenseFilters } from '../lib/expense-list-params'

type ExpenseFiltersProps = {
  params: ExpenseListParams
  categories: Category[]
  onApply: (filters: Partial<ExpenseListParams>) => void
  onClear: () => void
}

function filterDraftKey(params: ExpenseListParams): string {
  return [params.categoryId ?? '', params.search ?? ''].join('\0')
}

function ExpenseFiltersForm({ params, categories, onApply, onClear }: ExpenseFiltersProps) {
  const [categoryId, setCategoryId] = useState(params.categoryId ?? '')
  const [search, setSearch] = useState(params.search ?? '')
  const filtersActive = hasActiveExpenseFilters(params)

  function applySearchAndCategory(nextCategoryId = categoryId) {
    onApply({
      page: 1,
      categoryId: nextCategoryId || undefined,
      search: search.trim() || undefined,
    })
  }

  return (
    <form
      className="rounded-xp-lg border border-border bg-surface-subtle/60 p-2 sm:border-0 sm:bg-transparent sm:p-0"
      onSubmit={(event) => {
        event.preventDefault()
        applySearchAndCategory()
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Icon
            icon={Search}
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search…"
            value={search}
            className="mt-0 pl-9"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Select
          id="expense-category"
          aria-label="Filter by category"
          value={categoryId}
          wrapperClassName="w-[7.75rem] shrink-0 sm:w-44"
          className="mt-0"
          onChange={(event) => {
            const value = event.target.value
            setCategoryId(value)
            onApply({
              page: 1,
              categoryId: value || undefined,
              search: search.trim() || undefined,
            })
          }}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        {filtersActive && (
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 shrink-0 px-0 sm:w-auto sm:px-3"
            aria-label="Clear filters"
            onClick={onClear}
          >
            <Icon icon={X} size={16} aria-hidden />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>
    </form>
  )
}

export function ExpenseFilters(props: ExpenseFiltersProps) {
  return <ExpenseFiltersForm key={filterDraftKey(props.params)} {...props} />
}
