import { useQuery } from '@tanstack/react-query'
import { Plus, Receipt } from 'lucide-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { EmptyState, PageSection } from '../../../components/layout'
import { Alert, Button } from '../../../components/ui'
import { ApiError, getMe, listExpenses, listMembers } from '../../../lib/api'
import { expenseKeys, memberKeys, profileKeys } from '../../../lib/query-keys'
import { useCategories } from '../../categories/hooks/useCategories'
import { useEventContext } from '../../events/context/EventContext'
import { ExpenseFilters } from '../components/ExpenseFilters'
import { ExpenseFormDialog } from '../components/ExpenseFormDialog'
import { ExpensePagination } from '../components/ExpensePagination'
import { ExpenseCard, ExpenseListSkeleton, ExpenseRow, ExpenseTable } from '../components/ExpenseRow'
import { useExpenseListParams } from '../hooks/useExpenseListParams'
import { hasActiveExpenseFilters, nextExpenseSortParams } from '../lib/expense-list-params'

export function EventExpensesPage() {
  const { eventId, myRole } = useEventContext()
  const [params, setParams] = useExpenseListParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const createOpen = searchParams.get('action') === 'create'
  const editExpenseId = searchParams.get('edit') ?? undefined

  const closeFormDialog = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('action')
        next.delete('edit')
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const openCreateDialog = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set('action', 'create')
        next.delete('edit')
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const openEditDialog = useCallback(
    (expenseId: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('edit', expenseId)
          next.delete('action')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

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

  const handlePageChange = useCallback(
    (page: number) => {
      setParams({ page })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setParams],
  )

  return (
    <div className="space-y-4">
      <ExpenseFormDialog
        open={createOpen}
        onClose={closeFormDialog}
        mode="create"
      />

      <ExpenseFormDialog
        open={!!editExpenseId}
        onClose={closeFormDialog}
        mode="edit"
        expenseId={editExpenseId}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-label">Expenses</h2>
          <p className="text-sm text-text-secondary">
            Shared costs split among selected members.
          </p>
        </div>
        <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={openCreateDialog}>
          <Icon icon={Plus} size={20} aria-hidden />
          Add expense
        </Button>
      </div>

      <ExpenseFilters
        params={params}
        categories={categoriesQuery.data ?? []}
        onApply={(filters) => setParams(filters)}
        onClear={() =>
          setParams({ search: undefined, categoryId: undefined, page: 1 }, { replace: true })
        }
      />

      <PageSection aria-label="Expense list">
        {expensesQuery.isLoading && <ExpenseListSkeleton />}

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
              <Button type="button" variant="primary" onClick={openCreateDialog}>
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
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setParams({ search: undefined, categoryId: undefined, page: 1 }, { replace: true })
                }
              >
                Clear filters
              </Button>
            }
          />
        )}

        {expensesQuery.isSuccess && expenses.length > 0 && (
          <>
            <ul className="space-y-3 md:hidden" aria-label="Expense list">
              {expenses.map((expense) => (
                <li key={expense.id}>
                  <ExpenseCard
                    eventId={eventId}
                    expense={expense}
                    category={categoryById.get(expense.categoryId)}
                    paidByLabel={memberLabelById.get(expense.paidBy) ?? 'Unknown member'}
                    getMemberLabel={(userId) => memberLabelById.get(userId) ?? 'Unknown member'}
                    myRole={myRole}
                    currentUserId={currentUserId}
                    onEdit={openEditDialog}
                  />
                </li>
              ))}
            </ul>

            <ExpenseTable
              sort={params.sort}
              order={params.order}
              onSort={(column) =>
                setParams({ ...nextExpenseSortParams(params, column), page: 1 })
              }
            >
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  eventId={eventId}
                  expense={expense}
                  category={categoryById.get(expense.categoryId)}
                  paidByLabel={memberLabelById.get(expense.paidBy) ?? 'Unknown member'}
                  getMemberLabel={(userId) => memberLabelById.get(userId) ?? 'Unknown member'}
                  myRole={myRole}
                  currentUserId={currentUserId}
                  onEdit={openEditDialog}
                />
              ))}
            </ExpenseTable>

            {meta && (
              <ExpensePagination
                meta={meta}
                className="mt-3 shadow-xp-sm backdrop-blur-sm max-md:sticky max-md:bottom-2 max-md:z-10 sm:mt-4 md:shadow-none md:backdrop-blur-none"
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </PageSection>
    </div>
  )
}
