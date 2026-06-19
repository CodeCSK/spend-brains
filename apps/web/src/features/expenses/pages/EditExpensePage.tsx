import { useQuery } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { PageHeader } from '../../../components/layout'
import { BackLink, Card } from '../../../components/ui'
import { ApiError, getExpense, getMe } from '../../../lib/api'
import { expenseKeys, profileKeys } from '../../../lib/query-keys'
import { useEventContext } from '../../events/context/EventContext'
import { canEditExpense } from '../../events/lib/event-permissions'
import { ExpenseForm } from '../components/ExpenseForm'
import type { ExpenseFormInput } from '../lib/expense-form-schema'

export function EditExpensePage() {
  const { eventId, myRole } = useEventContext()
  const { expenseId } = useParams<{ expenseId: string }>()

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  const expenseQuery = useQuery({
    queryKey: expenseKeys.detail(eventId, expenseId ?? ''),
    queryFn: () => getExpense(eventId, expenseId!),
    enabled: !!expenseId,
    retry: false,
  })

  if (expenseQuery.isLoading || profileQuery.isLoading) {
    return (
      <p className="text-sm text-text-secondary" role="status">
        Loading expense…
      </p>
    )
  }

  if (expenseQuery.isError || !expenseQuery.data) {
    return (
      <Card as="article">
        <h1 className="text-xl font-semibold">Could not load expense</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {expenseQuery.error instanceof ApiError
            ? expenseQuery.error.message
            : 'This expense may have been deleted.'}
        </p>
        <BackLink
          to={`/app/events/${eventId}/expenses`}
          variant="secondary"
          className="mb-0 mt-6"
        >
          Back to expenses
        </BackLink>
      </Card>
    )
  }

  const expense = expenseQuery.data
  const currentUserId = profileQuery.data?.id ?? ''
  const isOwner = expense.createdBy === currentUserId

  if (!canEditExpense(myRole, isOwner)) {
    return (
      <Card as="article">
        <h1 className="text-xl font-semibold">Cannot edit this expense</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Members can only edit their own expenses. Captain and vice captain can edit any
          expense.
        </p>
        <BackLink
          to={`/app/events/${eventId}/expenses`}
          variant="secondary"
          className="mb-0 mt-6"
        >
          Back to expenses
        </BackLink>
      </Card>
    )
  }

  const initialValues: ExpenseFormInput = {
    description: expense.description,
    amount: expense.amount,
    expenseDate: expense.expenseDate,
    categoryId: expense.categoryId,
    paidBy: expense.paidBy,
    sharedAmong: expense.shares.map((share) => share.userId),
    notes: expense.notes ?? '',
  }

  return (
    <>
      <BackLink to={`/app/events/${eventId}/expenses`}>Back to expenses</BackLink>

      <PageHeader
        title={
          <>
            <Icon icon={Receipt} size={24} className="text-primary" aria-hidden />
            Edit expense
          </>
        }
        description={expense.description}
      />

      <div className="mt-6 sm:mt-8">
        <ExpenseForm
          mode="edit"
          expenseId={expense.id}
          initialValues={initialValues}
          createdBy={expense.createdBy}
        />
      </div>
    </>
  )
}
