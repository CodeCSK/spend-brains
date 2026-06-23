import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Pencil, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Amount } from '../../../components/ui'
import { ApiError, deleteExpense } from '../../../lib/api'
import { expenseKeys, settlementKeys } from '../../../lib/query-keys'
import { cn } from '../../../lib/cn'
import { useConfirm } from '../../../lib/store/useConfirm'
import { useToast } from '../../../lib/store/useToast'
import type { Category } from '../../../types/category'
import type { Expense, ExpenseListParams } from '../../../types/expense'
import type { MemberRole } from '../../../types/event'
import { CategoryIcon } from '../../categories/components/CategoryIcon'
import {
  canDeleteExpense,
  canEditExpense,
} from '../../events/lib/event-permissions'
import { formatExpenseDate, type ExpenseSortColumn } from '../lib/expense-list-params'
import { ExpenseSplitCell } from './ExpenseSplitCell'

type ExpenseRowProps = {
  eventId: string
  expense: Expense
  category?: Category
  paidByLabel: string
  getMemberLabel: (userId: string) => string
  myRole: MemberRole
  currentUserId: string
  onEdit?: (expenseId: string) => void
}

function useExpenseRowActions({
  eventId,
  expense,
  myRole,
  currentUserId,
}: Pick<ExpenseRowProps, 'eventId' | 'expense' | 'myRole' | 'currentUserId'>) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const isOwner = expense.createdBy === currentUserId
  const showEdit = canEditExpense(myRole, isOwner)
  const showDelete = canDeleteExpense(myRole, isOwner)
  const hasActions = showEdit || showDelete

  const deleteMutation = useMutation({
    mutationFn: () => deleteExpense(eventId, expense.id),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Expense deleted.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: settlementKeys.all }),
      ])
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to delete expense')
    },
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete expense',
      message: `Delete expense "${expense.description}"? Settlements will be recalculated.`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (confirmed) {
      deleteMutation.mutate()
    }
  }

  return {
    actionError,
    showEdit,
    showDelete,
    hasActions,
    deleteMutation,
    handleDelete,
  }
}

type ExpenseRowActionsProps = {
  expense: Expense
  showEdit: boolean
  showDelete: boolean
  deletePending: boolean
  onEdit?: (expenseId: string) => void
  onDelete: () => void
}

function ExpenseRowActions({
  expense,
  showEdit,
  showDelete,
  deletePending,
  onEdit,
  onDelete,
}: ExpenseRowActionsProps) {
  if (!showEdit && !showDelete) {
    return null
  }

  return (
    <div className="inline-flex items-center justify-end gap-0.5">
      {showEdit && (
        <button
          type="button"
          className="xp-icon-btn"
          aria-label={`Edit ${expense.description}`}
          onClick={() => onEdit?.(expense.id)}
        >
          <Icon icon={Pencil} size={16} aria-hidden />
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          className="xp-icon-btn-danger"
          aria-label={`Delete ${expense.description}`}
          disabled={deletePending}
          onClick={onDelete}
        >
          <Icon icon={Trash2} size={16} aria-hidden />
        </button>
      )}
    </div>
  )
}

export function ExpenseCard({
  eventId,
  expense,
  category,
  paidByLabel,
  getMemberLabel,
  myRole,
  currentUserId,
  onEdit,
}: ExpenseRowProps) {
  const {
    actionError,
    showEdit,
    showDelete,
    hasActions,
    deleteMutation,
    handleDelete,
  } = useExpenseRowActions({ eventId, expense, myRole, currentUserId })

  return (
    <article className="xp-expense-card" title={actionError ?? undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text-primary">{expense.description}</p>
          <p className="mt-0.5 text-xs text-text-muted">{formatExpenseDate(expense.expenseDate)}</p>
        </div>
        <Amount value={expense.amount} className="shrink-0 text-sm" />
      </div>

      <div className="xp-expense-card-meta mt-2">
        {category ? (
          <span className="inline-flex max-w-full items-center gap-1 truncate">
            <CategoryIcon iconKey={category.icon} size={16} variant="badge" />
            <span className="truncate">{category.name}</span>
          </span>
        ) : null}
        <span className="inline-flex max-w-full items-center gap-1 truncate">
          <Icon icon={UserRound} size={16} className="shrink-0 text-text-muted" aria-hidden />
          <span className="truncate">{paidByLabel}</span>
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <ExpenseSplitCell shares={expense.shares} getMemberLabel={getMemberLabel} />
        {hasActions ? (
          <ExpenseRowActions
            expense={expense}
            showEdit={showEdit}
            showDelete={showDelete}
            deletePending={deleteMutation.isPending}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ) : (
          <span className="text-text-muted">—</span>
        )}
      </div>

      {actionError && <p className="mt-2 text-sm text-error-text">{actionError}</p>}
    </article>
  )
}

export function ExpenseRow({
  eventId,
  expense,
  category,
  paidByLabel,
  getMemberLabel,
  myRole,
  currentUserId,
  onEdit,
}: ExpenseRowProps) {
  const {
    actionError,
    showEdit,
    showDelete,
    hasActions,
    deleteMutation,
    handleDelete,
  } = useExpenseRowActions({ eventId, expense, myRole, currentUserId })

  return (
    <tr title={actionError ?? undefined}>
      <td className="whitespace-nowrap text-text-secondary">
        {formatExpenseDate(expense.expenseDate)}
      </td>
      <td className="max-w-[12rem]">
        <p className="truncate font-medium text-text-primary">{expense.description}</p>
      </td>
      <td className="hidden xl:table-cell">
        {category ? (
          <span className="inline-flex max-w-[8rem] items-center gap-1.5 truncate text-text-secondary">
            <CategoryIcon iconKey={category.icon} size={16} variant="badge" />
            <span className="truncate">{category.name}</span>
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        )}
      </td>
      <td>
        <span className="inline-flex max-w-[7rem] items-center gap-1.5 truncate text-text-secondary">
          <Icon icon={UserRound} size={16} className="shrink-0 text-text-muted" aria-hidden />
          <span className="truncate">{paidByLabel}</span>
        </span>
      </td>
      <td>
        <ExpenseSplitCell shares={expense.shares} getMemberLabel={getMemberLabel} />
      </td>
      <td className="whitespace-nowrap text-right">
        <Amount value={expense.amount} className="text-sm" />
      </td>
      <td className="text-right">
        {hasActions ? (
          <ExpenseRowActions
            expense={expense}
            showEdit={showEdit}
            showDelete={showDelete}
            deletePending={deleteMutation.isPending}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ) : (
          <span className="text-text-muted">—</span>
        )}
      </td>
    </tr>
  )
}

export function ExpenseListSkeleton({ rows = 5 }: { rows?: number }) {
  const rowKeys = Array.from({ length: Math.min(Math.max(rows, 3), 10) }, (_, index) => index)

  return (
    <>
      <ul className="space-y-3 xl:hidden" aria-hidden>
        {rowKeys.map((key) => (
          <li key={key} className="xp-skeleton-card min-h-24 space-y-2 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="xp-skeleton h-4 w-3/5 rounded-xp-md" />
                <div className="xp-skeleton h-3 w-24 rounded-xp-md" />
              </div>
              <div className="xp-skeleton h-4 w-16 rounded-xp-md" />
            </div>
            <div className="flex gap-2">
              <div className="xp-skeleton h-3 w-20 rounded-xp-md" />
              <div className="xp-skeleton h-3 w-24 rounded-xp-md" />
            </div>
          </li>
        ))}
      </ul>
      <div className="xp-data-table-wrap hidden xl:block" aria-hidden>
        <table className="xp-data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th className="hidden xl:table-cell">Category</th>
              <th>Paid by</th>
              <th className="w-[6.5rem]">Split</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rowKeys.map((key) => (
              <tr key={key}>
                <td>
                  <div className="xp-skeleton h-4 w-16 rounded-xp-md" />
                </td>
                <td>
                  <div className="xp-skeleton h-4 w-40 max-w-full rounded-xp-md" />
                </td>
                <td className="hidden xl:table-cell">
                  <div className="xp-skeleton h-4 w-20 rounded-xp-md" />
                </td>
                <td>
                  <div className="xp-skeleton h-4 w-24 rounded-xp-md" />
                </td>
                <td>
                  <div className="xp-skeleton h-4 w-14 rounded-xp-md" />
                </td>
                <td className="text-right">
                  <div className="xp-skeleton ml-auto h-4 w-16 rounded-xp-md" />
                </td>
                <td className="text-right">
                  <div className="xp-skeleton ml-auto h-8 w-16 rounded-xp-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/** @deprecated Use ExpenseListSkeleton */
export function ExpenseTableSkeleton() {
  return <ExpenseListSkeleton />
}

type ExpenseTableProps = {
  children: ReactNode
  sort: ExpenseListParams['sort']
  order: ExpenseListParams['order']
  onSort: (column: ExpenseSortColumn) => void
}

type SortableHeaderProps = {
  label: string
  column: ExpenseSortColumn
  sort: ExpenseListParams['sort']
  order: ExpenseListParams['order']
  align?: 'left' | 'right'
  className?: string
  onSort: (column: ExpenseSortColumn) => void
}

function SortableHeader({
  label,
  column,
  sort,
  order,
  align = 'left',
  className,
  onSort,
}: SortableHeaderProps) {
  const active = sort === column
  const SortIcon = active && order === 'asc' ? ArrowUp : ArrowDown

  return (
    <th className={className}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 font-medium transition-colors hover:text-text-primary',
          align === 'right' && 'ml-auto',
          active ? 'text-text-primary' : 'text-text-muted',
        )}
        aria-label={`Sort by ${label}${active ? `, ${order === 'asc' ? 'ascending' : 'descending'}` : ''}`}
        onClick={() => onSort(column)}
      >
        {label}
        <Icon
          icon={SortIcon}
          size={16}
          className={cn(!active && 'opacity-40')}
          aria-hidden
        />
      </button>
    </th>
  )
}

export function ExpenseTable({ children, sort, order, onSort }: ExpenseTableProps) {
  return (
    <div className="xp-data-table-wrap hidden xl:block">
      <table className="xp-data-table">
        <thead>
          <tr>
            <SortableHeader
              label="Date"
              column="expenseDate"
              sort={sort}
              order={order}
              className="w-[5.5rem]"
              onSort={onSort}
            />
            <th>Description</th>
            <th className="hidden w-[7rem] xl:table-cell">Category</th>
            <th className="w-[7rem]">Paid by</th>
            <th className="w-[6.5rem]">Split</th>
            <SortableHeader
              label="Amount"
              column="amount"
              sort={sort}
              order={order}
              align="right"
              className="w-[5.5rem] text-right"
              onSort={onSort}
            />
            <th className="w-[4.5rem] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
