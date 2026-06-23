import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { FormLoadingSkeleton } from '../../../components/layout'
import { Alert, Dialog } from '../../../components/ui'
import { ApiError, getExpense, getMe } from '../../../lib/api'
import { expenseKeys, profileKeys } from '../../../lib/query-keys'
import { useEventContext } from '../../events/context/EventContext'
import { canEditExpense } from '../../events/lib/event-permissions'
import type { ExpenseFormInput } from '../lib/expense-form-schema'
import { ExpenseForm } from './ExpenseForm'

type ExpenseFormDialogProps = {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  expenseId?: string
}

export function ExpenseFormDialog({
  open,
  onClose,
  mode,
  expenseId,
}: ExpenseFormDialogProps) {
  const { eventId, myRole } = useEventContext()

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
    enabled: open && mode === 'edit',
  })

  const expenseQuery = useQuery({
    queryKey: expenseKeys.detail(eventId, expenseId ?? ''),
    queryFn: () => getExpense(eventId, expenseId!),
    enabled: open && mode === 'edit' && !!expenseId,
    retry: false,
  })

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const title = mode === 'create' ? 'Add expense' : 'Edit expense'
  const description = mode === 'edit' ? expenseQuery.data?.description : undefined

  const expense = expenseQuery.data
  const isOwner = expense != null && expense.createdBy === profileQuery.data?.id
  const canEdit =
    mode === 'create' ||
    (expense != null && canEditExpense(myRole, isOwner))

  let body = null

  if (mode === 'edit') {
    if (expenseQuery.isLoading || profileQuery.isLoading) {
      body = <FormLoadingSkeleton />
    } else if (expenseQuery.isError || !expense) {
      body = (
        <div className="px-4 py-4 sm:px-5">
          <Alert variant="error">
            {expenseQuery.error instanceof ApiError
              ? expenseQuery.error.message
              : 'Could not load this expense.'}
          </Alert>
        </div>
      )
    } else if (!canEdit) {
      body = (
        <div className="px-4 py-4 sm:px-5">
          <Alert variant="warning">
            You can only edit your own expenses.
          </Alert>
        </div>
      )
    } else {
      const initialValues: ExpenseFormInput = {
        description: expense.description,
        amount: expense.amount,
        expenseDate: expense.expenseDate,
        categoryId: expense.categoryId,
        paidBy: expense.paidBy,
        sharedAmong: expense.shares.map((share) => share.userId),
        notes: expense.notes ?? '',
      }

      body = (
        <ExpenseForm
          key={expense.id}
          mode="edit"
          expenseId={expense.id}
          initialValues={initialValues}
          createdBy={expense.createdBy}
          layout="modal"
          onSuccess={handleClose}
        />
      )
    }
  } else {
    body = (
      <ExpenseForm
        key={open ? 'create-open' : 'create-closed'}
        mode="create"
        layout="modal"
        onSuccess={handleClose}
      />
    )
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      variant="form"
      size="lg"
    >
      {body}
    </Dialog>
  )
}
