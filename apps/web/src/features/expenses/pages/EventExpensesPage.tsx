import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Plus, Receipt, Sparkles } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { EmptyState, PageSection } from '../../../components/layout'
import { Alert, Button, PaginatedContent, SegmentedControl } from '../../../components/ui'
import { ApiError, getMe, listExpenses, listMembers } from '../../../lib/api'
import { expenseKeys, memberKeys, profileKeys } from '../../../lib/query-keys'
import { useCategories } from '../../categories/hooks/useCategories'
import { useEventContext } from '../../events/context/EventContext'
import { ExpenseFilters } from '../components/ExpenseFilters'
import { ExpenseFormDialog } from '../components/ExpenseFormDialog'
import { ExpensePagination } from '../components/ExpensePagination'
import { ExpenseCard, ExpenseListSkeleton, ExpenseRow, ExpenseTable } from '../components/ExpenseRow'
import { GroupExpenseSummary } from '../components/summary/GroupExpenseSummary'
import { IndividualExpenseSummary } from '../components/summary/IndividualExpenseSummary'
import { ExpenseSummarySkeleton } from '../components/summary/ExpenseSummarySkeleton'
import { useExpenseListParams } from '../hooks/useExpenseListParams'
import { hasActiveExpenseFilters, nextExpenseSortParams } from '../lib/expense-list-params'

type ExpenseViewMode = 'member' | 'all'

const SUMMARY_EXPENSE_LIMIT = 100

export function EventExpensesPage() {
  const { eventId, myRole } = useEventContext()
  const [params, setParams] = useExpenseListParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const createOpen = searchParams.get('action') === 'create'
  const editExpenseId = searchParams.get('edit') ?? undefined
  const viewMode: ExpenseViewMode = searchParams.get('view') === 'all' ? 'all' : 'member'
  const isMemberView = viewMode === 'member'

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  const currentUserId = profileQuery.data?.id ?? ''
  const selectedMemberId = searchParams.get('paidBy') ?? currentUserId

  const setViewMode = useCallback(
    (nextView: ExpenseViewMode) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (nextView === 'all') {
            next.set('view', 'all')
          } else {
            next.delete('view')
            next.delete('page')
            next.delete('search')
            next.delete('categoryId')
            if (!next.get('paidBy') && currentUserId) {
              next.set('paidBy', currentUserId)
            }
          }
          return next
        },
        { replace: true },
      )
    },
    [currentUserId, setSearchParams],
  )

  const setSelectedMember = useCallback(
    (memberId: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('paidBy', memberId)
          next.delete('page')
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

  const categoriesQuery = useCategories(eventId)

  const membersQuery = useQuery({
    queryKey: memberKeys.list(eventId),
    queryFn: () => listMembers(eventId),
  })

  const groupSummaryQuery = useQuery({
    queryKey: expenseKeys.list(eventId, { scope: 'group-summary', limit: SUMMARY_EXPENSE_LIMIT }),
    queryFn: () =>
      listExpenses(eventId, {
        limit: SUMMARY_EXPENSE_LIMIT,
        sort: 'expenseDate',
        order: 'desc',
      }),
    enabled: isMemberView === false,
  })

  const memberSummaryQuery = useQuery({
    queryKey: expenseKeys.list(eventId, {
      scope: 'member-summary',
      paidBy: selectedMemberId,
      limit: SUMMARY_EXPENSE_LIMIT,
    }),
    queryFn: () =>
      listExpenses(eventId, {
        paidBy: selectedMemberId,
        limit: SUMMARY_EXPENSE_LIMIT,
        sort: 'expenseDate',
        order: 'desc',
      }),
    enabled: isMemberView && Boolean(selectedMemberId),
  })

  const tableParams = isMemberView
    ? { ...params, paidBy: selectedMemberId }
    : params

  const expensesQuery = useQuery({
    queryKey: expenseKeys.list(eventId, tableParams),
    queryFn: () => listExpenses(eventId, tableParams),
    enabled: isMemberView ? Boolean(selectedMemberId) : true,
    placeholderData: keepPreviousData,
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
  const groupSummaryExpenses = groupSummaryQuery.data?.data ?? []
  const memberSummaryExpenses = memberSummaryQuery.data?.data ?? []
  const meta = expensesQuery.data?.meta
  const totalItems = meta?.total ?? 0
  const currentPage = params.page ?? 1
  const showPagination = Boolean(expensesQuery.isSuccess && meta && totalItems > 0)
  const showToolbar = showPagination && (meta?.totalPages ?? 0) > 1
  const isTrulyEmpty = expensesQuery.isSuccess && totalItems === 0
  const isEmptyPage = expensesQuery.isSuccess && totalItems > 0 && expenses.length === 0
  const members = membersQuery.data ?? []

  const getMemberLabel = useCallback(
    (userId: string) => memberLabelById.get(userId) ?? 'Unknown member',
    [memberLabelById],
  )

  const summaryLoading = isMemberView
    ? memberSummaryQuery.isLoading || membersQuery.isLoading || profileQuery.isLoading
    : groupSummaryQuery.isLoading

  const summaryReady = isMemberView
    ? memberSummaryQuery.isSuccess && membersQuery.isSuccess && Boolean(selectedMemberId)
    : groupSummaryQuery.isSuccess

  const handlePageChange = useCallback(
    (page: number) => {
      setParams({ page })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setParams],
  )

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      setParams({ limit, page: 1 })
    },
    [setParams],
  )

  useEffect(() => {
    if (!expensesQuery.isSuccess || !meta) return

    if (currentPage > meta.totalPages) {
      setParams({ page: Math.max(1, meta.totalPages) }, { replace: true })
    }
  }, [currentPage, expensesQuery.isSuccess, meta, setParams])

  return (
    <div className="space-y-5">
      <ExpenseFormDialog open={createOpen} onClose={closeFormDialog} mode="create" />
      <ExpenseFormDialog
        open={!!editExpenseId}
        onClose={closeFormDialog}
        mode="edit"
        expenseId={editExpenseId}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
          Expenses
        </h2>
        <Button type="button" className="w-full min-h-11 shrink-0 sm:w-auto" onClick={openCreateDialog}>
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
          { value: 'member', label: 'By member' },
          { value: 'all', label: 'All expenses' },
        ]}
      />

      {(groupSummaryQuery.isError || memberSummaryQuery.isError) && (
        <Alert variant="error">
          {groupSummaryQuery.error instanceof ApiError
            ? groupSummaryQuery.error.message
            : memberSummaryQuery.error instanceof ApiError
              ? memberSummaryQuery.error.message
              : 'Failed to load expense summary'}
        </Alert>
      )}

      {summaryLoading && <ExpenseSummarySkeleton variant={isMemberView ? 'member' : 'group'} />}

      {summaryReady && isMemberView && (
        <IndividualExpenseSummary
          expenses={memberSummaryExpenses}
          categories={categoriesQuery.data ?? []}
          members={members}
          selectedMemberId={selectedMemberId}
          currentUserId={currentUserId}
          onMemberChange={setSelectedMember}
        />
      )}

      {summaryReady && !isMemberView && (
        <GroupExpenseSummary
          expenses={groupSummaryExpenses}
          categories={categoriesQuery.data ?? []}
          getMemberLabel={getMemberLabel}
        />
      )}

      {(summaryReady || groupSummaryQuery.isError || memberSummaryQuery.isError) && (
      <PageSection aria-label="Expense list" className="space-y-4 border-t border-border pt-5">
        <h3 className="text-base font-semibold text-text-primary">Expenses</h3>

        {!isMemberView && (
          <ExpenseFilters
            params={params}
            categories={categoriesQuery.data ?? []}
            onApply={(filters) => setParams(filters)}
            onClear={() =>
              setParams({ search: undefined, categoryId: undefined, page: 1 }, { replace: true })
            }
          />
        )}

        {expensesQuery.isLoading && (
          <ExpenseListSkeleton rows={params.limit ?? 20} />
        )}

        {expensesQuery.isError && (
          <Alert variant="error">
            {expensesQuery.error instanceof ApiError
              ? expensesQuery.error.message
              : 'Failed to load expenses'}
          </Alert>
        )}

        {isTrulyEmpty && !filtersActive && (
          <EmptyState
            icon={isMemberView ? Sparkles : Receipt}
            title={isMemberView ? 'No payments yet' : 'No expenses found'}
            description={
              isMemberView
                ? 'Expenses paid by this member will appear here.'
                : 'Start adding expenses to track this event.'
            }
            action={
              <Button type="button" variant="primary" className="min-h-11" onClick={openCreateDialog}>
                <Icon icon={Plus} size={20} aria-hidden />
                Add expense
              </Button>
            }
          />
        )}

        {!isMemberView && isTrulyEmpty && filtersActive && (
          <EmptyState
            icon={Receipt}
            title="No expenses found"
            description="Try adjusting your filters or search terms."
            action={
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                onClick={() =>
                  setParams({ search: undefined, categoryId: undefined, page: 1 }, { replace: true })
                }
              >
                Clear filters
              </Button>
            }
          />
        )}

        {showToolbar && meta && (
          <ExpensePagination
            meta={meta}
            variant="toolbar"
            loading={expensesQuery.isFetching}
            onPageChange={handlePageChange}
          />
        )}

        {expenses.length > 0 && (
          <PaginatedContent
            loading={expensesQuery.isLoading}
            fetching={expensesQuery.isFetching}
          >
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
          </PaginatedContent>
        )}

        {isEmptyPage && (
          <EmptyState
            icon={Receipt}
            title="No expenses on this page"
            description="This page is empty. Go back to see your expenses."
            action={
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                onClick={() => setParams({ page: Math.max(1, currentPage - 1) })}
              >
                Go to previous page
              </Button>
            }
          />
        )}

        {showPagination && meta && (
          <ExpensePagination
            meta={meta}
            className="mt-3 sm:mt-4"
            loading={expensesQuery.isFetching}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </PageSection>
      )}
    </div>
  )
}
