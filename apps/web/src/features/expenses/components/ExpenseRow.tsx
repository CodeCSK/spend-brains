import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Button, Card } from '../../../components/ui'
import { ApiError, deleteExpense } from '../../../lib/api'
import { formatInr, TABULAR_AMOUNT_CLASS } from '../../../lib/format-inr'
import { expenseKeys, settlementKeys } from '../../../lib/query-keys'
import { useConfirm } from '../../../lib/store/useConfirm'
import { useToast } from '../../../lib/store/useToast'
import type { Category } from '../../../types/category'
import type { Expense } from '../../../types/expense'
import type { MemberRole } from '../../../types/event'
import { CategoryIcon } from '../../categories/components/CategoryIcon'
import {
  canDeleteExpense,
  canEditExpense,
} from '../../events/lib/event-permissions'
import { formatExpenseDate } from '../lib/expense-list-params'

type ExpenseRowProps = {
  eventId: string
  expense: Expense
  category?: Category
  paidByLabel: string
  myRole: MemberRole
  currentUserId: string
}

export function ExpenseRow({
  eventId,
  expense,
  category,
  paidByLabel,
  myRole,
  currentUserId,
}: ExpenseRowProps) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const isOwner = expense.createdBy === currentUserId
  const showEdit = canEditExpense(myRole, isOwner)
  const showDelete = canDeleteExpense(myRole, isOwner)

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

  return (
    <Card as="li" className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{expense.description}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {formatExpenseDate(expense.expenseDate)}
              </p>
            </div>
            <p className={`shrink-0 text-lg font-semibold ${TABULAR_AMOUNT_CLASS}`}>
              {formatInr(expense.amount)}
            </p>
          </div>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <dt className="text-text-muted">Category</dt>
              <dd className="flex items-center gap-1.5 font-medium">
                {category ? (
                  <>
                    <CategoryIcon iconKey={category.icon} size={16} />
                    {category.name}
                  </>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Paid by</dt>
              <dd className="font-medium">{paidByLabel}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Split</dt>
              <dd className="font-medium">
                {expense.shares.length} member{expense.shares.length === 1 ? '' : 's'}
              </dd>
            </div>
          </dl>
        </div>

        {(showEdit || showDelete) && (
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            {showEdit && (
              <Button
                as="link"
                to={`/app/events/${eventId}/expenses/${expense.id}/edit`}
                variant="secondary"
              >
                <Icon icon={Pencil} size={20} aria-hidden />
                Edit
              </Button>
            )}
            {showDelete && (
              <Button
                type="button"
                variant="destructive"
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                <Icon icon={Trash2} size={20} aria-hidden />
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            )}
          </div>
        )}
      </div>

      {actionError && <p className="mt-3 text-sm text-error-text">{actionError}</p>}
    </Card>
  )
}
