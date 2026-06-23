import { useQuery } from '@tanstack/react-query'
import { Plus, Receipt } from 'lucide-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { EmptyState, PageSection } from '../../../components/layout'
import { Alert, Button, SegmentedControl } from '../../../components/ui'
import { ApiError, getMe, listExpenses, listMembers } from '../../../lib/api'
import { expenseKeys, memberKeys, profileKeys } from '../../../lib/query-keys'
import { useCategories } from '../../categories/hooks/useCategories'
import { useEventContext } from '../../events/context/EventContext'
import { ExpenseFilters } from '../components/ExpenseFilters'
import { ExpenseFormDialog } from '../components/ExpenseFormDialog'
import { ExpensePagination } from '../components/ExpensePagination'
import { ExpenseCard, ExpenseListSkeleton, ExpenseRow, ExpenseTable } from '../components/ExpenseRow'
import { PersonalExpenseView } from '../components/PersonalExpenseView'
import { useExpenseListParams } from '../hooks/useExpenseListParams'
import { hasActiveExpenseFilters, nextExpenseSortParams } from '../lib/expense-list-params'

type ExpenseViewMode = 'all' | 'mine'

const PERSONAL_EXPENSE_LIMIT = 100

export function EventExpensesPage() {
  const { eventId, myRole } = useEventContext()
  const [params, setParams] = useExpenseListParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const createOpen = searchParams.get('action') === 'create'
  const editExpenseId = searchParams.get('edit') ?? undefined
  const viewMode: ExpenseViewMode = searchParams.get('view') === 'mine' ? 'mine' : 'all'
  const isPersonalView = viewMode === 'mine'

  const setViewMode = useCallback(
    (nextView: ExpenseViewMode) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (nextView === 'mine') {
            next.set('view', 'mine')
            next.delete('page')
            next.delete('search')
            next.delete('categoryId')
          } else {
            next.delete('view')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

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

  const currentUserId = profileQuery.data?.id ?? ''

  const categoriesQuery = useCategories(eventId)

  const membersQuery = useQuery({
    queryKey: memberKeys.list(eventId),
    queryFn: () => listMembers(eventId),
  })

  const expensesQuery = useQuery({
    queryKey: expenseKeys.list(eventId, params),
    queryFn: () => listExpenses(eventId, params),
    enabled: !isPersonalView,
  })

  const personalExpensesQuery = useQuery({
    queryKey: expenseKeys.list(eventId, {
      view: 'mine',
      sharedWith: currentUserId,
      limit: PERSONAL_EXPENSE_LIMIT,
    }),
    queryFn: () =>
      listExpenses(eventId, {
        sharedWith: currentUserId,
        limit: PERSONAL_EXPENSE_LIMIT,
        sort: 'expenseDate',
        order: 'desc',
      }),
    enabled: isPersonalView && Boolean(currentUserId),
  })

  const categoryById = new Map(categoriesQuery.data?.map((category) => [category.id, category]))
  const memberLabelById = new Map(
    membersQuery.data?.map((member) => [
      member.userId,
      member.displayName ?? member.phone,
    ]) ?? [],
  )

  const filtersActive = hasActiveExpenseFilters(params)
  const expenses = expensesQuery.data?.data ?? []
  const personalExpenses = personalExpensesQuery.data?.data ?? []
  const meta = expensesQuery.data?.meta
  const getMemberLabel = useCallback(
    (userId: string) => memberLabelById.get(userId) ?? 'Unknown member',
    [memberLabelById],
  )

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
            {isPersonalView
              ? 'Your share of costs in this event, grouped by category.'
              : 'Shared costs split among selected members.'}
          </p>
        </div>
        <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={openCreateDialog}>
          <Icon icon={Plus} size={20} aria-hidden />
          Add expense
        </Button>
      </div>

      <SegmentedControl
        aria-label="Expense view"
        value={viewMode}
        onChange={setViewMode}
        stretch
        options={[
          { value: 'all', label: 'All expenses' },
          { value: 'mine', label: 'My expenses' },
        ]}
      />

      {!isPersonalView && (
        <ExpenseFilters
          params={params}
          categories={categoriesQuery.data ?? []}
          onApply={(filters) => setParams(filters)}
          onClear={() =>
            setParams({ search: undefined, categoryId: undefined, page: 1 }, { replace: true })
          }
        />
      )}

      <PageSection aria-label={isPersonalView ? 'My expenses' : 'Expense list'}>
        {isPersonalView && (
          <>
            {(profileQuery.isLoading || personalExpensesQuery.isLoading) && <ExpenseListSkeleton />}

            {personalExpensesQuery.isError && (
              <Alert variant="error">
                {personalExpensesQuery.error instanceof ApiError
                  ? personalExpensesQuery.error.message
                  : 'Failed to load your expenses'}
              </Alert>
            )}

            {personalExpensesQuery.isSuccess && (
              <PersonalExpenseView
                expenses={personalExpenses}
                categories={categoriesQuery.data ?? []}
                currentUserId={currentUserId}
                getMemberLabel={getMemberLabel}
              />
            )}
          </>
        )}

        {!isPersonalView && expensesQuery.isLoading && <ExpenseListSkeleton />}

        {!isPersonalView && expensesQuery.isError && (
          <Alert variant="error">
            {expensesQuery.error instanceof ApiError
              ? expensesQuery.error.message
              : 'Failed to load expenses'}
          </Alert>
        )}

        {!isPersonalView && expensesQuery.isSuccess && expenses.length === 0 && !filtersActive && (
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

        {!isPersonalView && expensesQuery.isSuccess && expenses.length === 0 && filtersActive && (
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

        {!isPersonalView && expensesQuery.isSuccess && expenses.length > 0 && (
          <>
            <ul className="space-y-3 md:hidden" aria-label="Expense list">
              {expenses.map((expense) => (
                <li key={expense.id}>
                  <ExpenseCard
                    eventId={eventId}
                    expense={expense}
                    category={categoryById.get(expense.categoryId)}
                    paidByLabel={getMemberLabel(expense.paidBy)}
                    getMemberLabel={getMemberLabel}
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
                  paidByLabel={getMemberLabel(expense.paidBy)}
                  getMemberLabel={getMemberLabel}
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
