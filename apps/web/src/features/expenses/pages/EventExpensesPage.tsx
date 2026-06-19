import { useQuery } from '@tanstack/react-query'
import { Plus, Receipt } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { EmptyState, PageSection } from '../../../components/layout'
import { Alert, Button } from '../../../components/ui'
import { ApiError, getMe, listExpenses, listMembers } from '../../../lib/api'
import { expenseKeys, memberKeys, profileKeys } from '../../../lib/query-keys'
import { useCategories } from '../../categories/hooks/useCategories'
import { useEventContext } from '../../events/context/EventContext'
import { ExpenseFilters } from '../components/ExpenseFilters'
import { ExpensePagination } from '../components/ExpensePagination'
import { ExpenseRow } from '../components/ExpenseRow'
import { useExpenseListParams } from '../hooks/useExpenseListParams'
import { hasActiveExpenseFilters } from '../lib/expense-list-params'

export function EventExpensesPage() {
  const { eventId, myRole } = useEventContext()
  const [params, setParams] = useExpenseListParams()

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  const categoriesQuery = useCategories(eventId)

  const membersQuery = useQuery({
    queryKey: memberKeys.list(eventId),
    queryFn: () => listMembers(eventId),
  })

  const expensesQuery = useQuery({
    queryKey: expenseKeys.list(eventId, params),
    queryFn: () => listExpenses(eventId, params),
  })

  const categoryById = new Map(categoriesQuery.data?.map((category) => [category.id, category]))
  const memberLabelById = new Map(
    membersQuery.data?.map((member) => [
      member.userId,
      member.displayName ?? member.phone,
    ]) ?? [],
  )

  const currentUserId = profileQuery.data?.id ?? ''
  const filtersActive = hasActiveExpenseFilters(params)
  const expenses = expensesQuery.data?.data ?? []
  const meta = expensesQuery.data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-label">Expenses</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Shared costs split equally among selected members.
          </p>
        </div>
        <Button
          as="link"
          to={`/app/events/${eventId}/expenses/new`}
          className="shrink-0"
        >
          <Icon icon={Plus} size={20} aria-hidden />
          Add expense
        </Button>
      </div>

      <ExpenseFilters
        params={params}
        categories={categoriesQuery.data ?? []}
        members={membersQuery.data ?? []}
        onApply={(filters) => setParams(filters)}
        onClear={() => setParams({}, { replace: true })}
      />

      <PageSection aria-label="Expense list">
        {expensesQuery.isLoading && (
          <ul className="space-y-3" aria-hidden>
            {[0, 1, 2].map((key) => (
              <li key={key} className="xp-skeleton-card" />
            ))}
          </ul>
        )}

        {expensesQuery.isError && (
          <Alert variant="error">
            {expensesQuery.error instanceof ApiError
              ? expensesQuery.error.message
              : 'Failed to load expenses'}
          </Alert>
        )}

        {expensesQuery.isSuccess && expenses.length === 0 && !filtersActive && (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Log shared costs to track who paid and who owes what."
            action={
              <Button as="link" to={`/app/events/${eventId}/expenses/new`} variant="primary">
                <Icon icon={Plus} size={20} aria-hidden />
                Add expense
              </Button>
            }
          />
        )}

        {expensesQuery.isSuccess && expenses.length === 0 && filtersActive && (
          <EmptyState
            icon={Receipt}
            title="No matching expenses"
            description="Try adjusting your filters or search term."
            action={
              <Button type="button" variant="secondary" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </Button>
            }
          />
        )}

        {expensesQuery.isSuccess && expenses.length > 0 && (
          <>
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  eventId={eventId}
                  expense={expense}
                  category={categoryById.get(expense.categoryId)}
                  paidByLabel={memberLabelById.get(expense.paidBy) ?? 'Unknown member'}
                  myRole={myRole}
                  currentUserId={currentUserId}
                />
              ))}
            </ul>

            {meta && (
              <div className="mt-6">
                <ExpensePagination
                  meta={meta}
                  onPageChange={(page) => setParams({ page })}
                />
              </div>
            )}
          </>
        )}
      </PageSection>
    </div>
  )
}
