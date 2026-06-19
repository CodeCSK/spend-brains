import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { Alert, AmountInput, Button, Card, FormField, Input, Select, Textarea } from '../../../components/ui'
import {
  ApiError,
  createExpense,
  deleteExpense,
  getMe,
  listMembers,
  updateExpense,
} from '../../../lib/api'
import { expenseKeys, memberKeys, profileKeys, settlementKeys } from '../../../lib/query-keys'
import { useConfirm } from '../../../lib/store/useConfirm'
import { useToast } from '../../../lib/store/useToast'
import { useCategories } from '../../categories/hooks/useCategories'
import { useEventContext } from '../../events/context/EventContext'
import { eventExpensesPath } from '../../events/lib/event-routes'
import { canDeleteExpense } from '../../events/lib/event-permissions'
import { sortMembers } from '../../members/lib/sort-members'
import {
  expenseFormSchema,
  toCreateExpensePayload,
  toUpdateExpensePayload,
  todayIsoDate,
  type ExpenseFormInput,
} from '../lib/expense-form-schema'
import { ExpenseMemberSplitField } from './ExpenseMemberSplitField'

export const EXPENSE_FORM_ID = 'expense-form'

type ExpenseFormProps = {
  mode: 'create' | 'edit'
  expenseId?: string
  initialValues?: ExpenseFormInput
  createdBy?: string
  /** Page keeps card wrapper; modal is bare fields for dialog shell. */
  layout?: 'page' | 'modal'
  formId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ExpenseForm({
  mode,
  expenseId,
  initialValues,
  createdBy,
  layout = 'page',
  formId = EXPENSE_FORM_ID,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const { eventId, eventCode, myRole } = useEventContext()
  const notesId = useId()

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  const membersQuery = useQuery({
    queryKey: memberKeys.list(eventId),
    queryFn: () => listMembers(eventId),
  })

  const categoriesQuery = useCategories(eventId)

  const form = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialValues ?? {
      description: '',
      amount: '',
      expenseDate: todayIsoDate(),
      categoryId: '',
      paidBy: '',
      sharedAmong: [],
      notes: '',
    },
  })

  const initializedRef = useRef(false)

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues)
      return
    }

    if (
      mode === 'create' &&
      !initializedRef.current &&
      membersQuery.data &&
      categoriesQuery.data &&
      profileQuery.data
    ) {
      initializedRef.current = true
      form.reset({
        description: '',
        amount: '',
        expenseDate: todayIsoDate(),
        categoryId: categoriesQuery.data[0]?.id ?? '',
        paidBy: profileQuery.data.id,
        sharedAmong: membersQuery.data.map((member) => member.userId),
        notes: '',
      })
    }
  }, [mode, initialValues, membersQuery.data, categoriesQuery.data, profileQuery.data, form])

  const saveMutation = useMutation({
    mutationFn: (values: ExpenseFormInput) => {
      const parsed = expenseFormSchema.parse(values)
      if (mode === 'create') {
        return createExpense(eventId, toCreateExpensePayload(parsed))
      }
      return updateExpense(eventId, expenseId!, toUpdateExpensePayload(parsed))
    },
    onSuccess: async () => {
      toast.success(mode === 'create' ? 'Expense added.' : 'Expense saved.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: settlementKeys.all }),
      ])
      if (onSuccess) {
        onSuccess()
        return
      }
      navigate(eventExpensesPath(eventCode), { replace: true })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteExpense(eventId, expenseId!),
    onSuccess: async () => {
      toast.success('Expense deleted.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: settlementKeys.all }),
      ])
      if (onSuccess) {
        onSuccess()
        return
      }
      navigate(eventExpensesPath(eventCode), { replace: true })
    },
  })

  const saveError =
    saveMutation.error instanceof ApiError
      ? saveMutation.error.message
      : saveMutation.error?.message

  const deleteError =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.error?.message

  const members = membersQuery.data ? sortMembers(membersQuery.data) : []
  const categories = categoriesQuery.data ?? []
  const isOwner = createdBy != null && profileQuery.data?.id === createdBy
  const showDelete =
    mode === 'edit' && expenseId && createdBy != null && canDeleteExpense(myRole, isOwner)

  const isLoadingDeps =
    membersQuery.isLoading || categoriesQuery.isLoading || profileQuery.isLoading

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete expense',
      message: 'Delete this expense? Settlements will be recalculated.',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (confirmed) {
      deleteMutation.mutate()
    }
  }

  if (isLoadingDeps) {
    return (
      <p className="py-6 text-sm text-text-secondary" role="status">
        Loading form…
      </p>
    )
  }

  if (members.length === 0 || categories.length === 0) {
    return (
      <Alert variant="warning">
        Add members and categories before logging expenses.
      </Alert>
    )
  }

  const submitLabel =
    saveMutation.isPending
      ? 'Saving…'
      : mode === 'create'
        ? 'Add expense'
        : 'Save changes'

  const footerActions = (
    <>
      {showDelete && (
        <Button
          type="button"
          variant="destructive"
          className="w-full sm:mr-auto sm:w-auto"
          loading={deleteMutation.isPending}
          disabled={saveMutation.isPending}
          onClick={handleDelete}
        >
          <Icon icon={Trash2} size={20} aria-hidden />
          {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      )}
      {onCancel && layout !== 'modal' && (
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={saveMutation.isPending || deleteMutation.isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      <Button
        type="submit"
        form={layout === 'modal' ? formId : undefined}
        className="w-full sm:w-auto"
        loading={saveMutation.isPending}
        disabled={deleteMutation.isPending}
      >
        <Icon icon={Save} size={20} aria-hidden />
        {submitLabel}
      </Button>
    </>
  )

  const formFields = (
    <>
      <section className="space-y-4" aria-label="Expense basics">
        <FormField
          id="expense-description"
          label="Description"
          error={form.formState.errors.description?.message}
        >
          <Input
            type="text"
            maxLength={500}
            placeholder="Dinner at beach shack"
            autoFocus={layout === 'modal'}
            {...form.register('description')}
          />
        </FormField>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <FormField
            id="expense-amount"
            label="Amount"
            error={form.formState.errors.amount?.message}
          >
            <AmountInput
              type="number"
              min="0.01"
              step="0.01"
              placeholder="1,200"
              className="text-base sm:text-sm"
              {...form.register('amount')}
            />
          </FormField>

          <FormField
            id="expense-date"
            label="Date"
            error={form.formState.errors.expenseDate?.message}
          >
            <Input type="date" {...form.register('expenseDate')} />
          </FormField>
        </div>
      </section>

      <section
        className="space-y-3 rounded-xp-lg border border-border bg-surface-subtle/30 p-3 sm:space-y-4 sm:p-4"
        aria-label="Payment details"
      >
        <h3 className="text-sm font-medium text-text-label">Payment details</h3>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <FormField
            id="expense-category"
            label="Category"
            error={form.formState.errors.categoryId?.message}
          >
            <Select {...form.register('categoryId')}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            id="expense-paid-by"
            label="Paid by"
            error={form.formState.errors.paidBy?.message}
          >
            <Select {...form.register('paidBy')}>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName ?? member.phone}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </section>

      <Controller
        name="sharedAmong"
        control={form.control}
        render={({ field }) => (
          <ExpenseMemberSplitField
            members={members}
            value={field.value ?? []}
            onChange={field.onChange}
            error={form.formState.errors.sharedAmong?.message}
          />
        )}
      />

      <FormField
        id={notesId}
        label={
          <>
            Notes <span className="font-normal text-text-muted">(optional)</span>
          </>
        }
        error={form.formState.errors.notes?.message}
      >
        <Textarea rows={2} maxLength={2000} placeholder="Receipt link, context…" {...form.register('notes')} />
      </FormField>

      {saveError && <Alert variant="error">{saveError}</Alert>}
      {deleteError && <Alert variant="error">{deleteError}</Alert>}
    </>
  )

  if (layout === 'modal') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <form
          id={formId}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          {formFields}
        </form>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-surface-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          {footerActions}
        </div>
      </div>
    )
  }

  const formContent = (
    <form
      id={formId}
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
    >
      {formFields}
      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        {footerActions}
      </div>
    </form>
  )

  return <Card as="article">{formContent}</Card>
}
