import { Filter } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Button, Card, FormField, Input, Select } from '../../../components/ui'
import type { Category } from '../../../types/category'
import type { Member } from '../../../types/member'
import type { ExpenseListParams } from '../../../types/expense'

type ExpenseFiltersProps = {
  params: ExpenseListParams
  categories: Category[]
  members: Member[]
  onApply: (filters: Partial<ExpenseListParams>) => void
  onClear: () => void
}

function filterDraftKey(params: ExpenseListParams): string {
  return [
    params.categoryId ?? '',
    params.paidBy ?? '',
    params.dateFrom ?? '',
    params.dateTo ?? '',
    params.search ?? '',
  ].join('\0')
}

function ExpenseFiltersForm({
  params,
  categories,
  members,
  onApply,
  onClear,
}: ExpenseFiltersProps) {
  const [categoryId, setCategoryId] = useState(params.categoryId ?? '')
  const [paidBy, setPaidBy] = useState(params.paidBy ?? '')
  const [dateFrom, setDateFrom] = useState(params.dateFrom ?? '')
  const [dateTo, setDateTo] = useState(params.dateTo ?? '')
  const [search, setSearch] = useState(params.search ?? '')

  return (
    <Card as="article">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-text-label">
        <Icon icon={Filter} size={20} className="text-primary" aria-hidden />
        Filters
      </h2>

      <form
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault()
          onApply({
            page: 1,
            categoryId: categoryId || undefined,
            paidBy: paidBy || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            search: search.trim() || undefined,
          })
        }}
      >
        <FormField id="expense-search" label="Search description" className="sm:col-span-2 lg:col-span-3">
          <Input
            type="search"
            placeholder="Dinner, taxi…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </FormField>

        <FormField id="expense-category" label="Category">
          <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="expense-paid-by" label="Paid by">
          <Select value={paidBy} onChange={(event) => setPaidBy(event.target.value)}>
            <option value="">Anyone</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.displayName ?? member.phone}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="expense-date-from" label="From date">
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </FormField>

        <FormField id="expense-date-to" label="To date">
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </FormField>

        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="submit">Apply filters</Button>
          <Button type="button" variant="secondary" onClick={onClear}>
            Clear
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function ExpenseFilters(props: ExpenseFiltersProps) {
  return <ExpenseFiltersForm key={filterDraftKey(props.params)} {...props} />
}
