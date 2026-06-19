import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { Alert, Button, Card, Checkbox, FormField, Input, Select, Textarea } from '../../../components/ui'
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
import {
  canDeleteExpense,
} from '../../events/lib/event-permissions'
import { sortMembers } from '../../members/lib/sort-members'
import {
  expenseFormSchema,
  toCreateExpensePayload,
  toUpdateExpensePayload,
  todayIsoDate,
  type ExpenseFormInput,
} from '../lib/expense-form-schema'

type ExpenseFormProps = {
  mode: 'create' | 'edit'
  expenseId?: string
  initialValues?: ExpenseFormInput
  createdBy?: string
}

export function ExpenseForm({ mode, expenseId, initialValues, createdBy }: ExpenseFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const { eventId, myRole } = useEventContext()

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
      navigate(`/app/events/${eventId}/expenses`, { replace: true })
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
      navigate(`/app/events/${eventId}/expenses`, { replace: true })
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

  if (isLoadingDeps) {
    return (
      <p className="text-sm text-text-secondary" role="status">
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

  return (
    <Card as="article">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      >
        <FormField
          id="expense-description"
          label="Description"
          error={form.formState.errors.description?.message}
        >
          <Input
            type="text"
            maxLength={500}
            placeholder="Dinner at beach shack"
            autoFocus
            {...form.register('description')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="expense-amount"
            label="Amount (₹)"
            error={form.formState.errors.amount?.message}
          >
            <Input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="1200"
              className="tabular-amount"
              {...form.register('amount')}
            />
          </FormField>

          <FormField
            id="expense-date"
            label="Expense date"
            error={form.formState.errors.expenseDate?.message}
          >
            <Input type="date" {...form.register('expenseDate')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

        <fieldset>
          <legend className="xp-label">Shared among</legend>
          <p className="mt-1 text-sm text-text-secondary">
            Split equally among selected members. The server calculates each person&apos;s share.
          </p>
          <Controller
            name="sharedAmong"
            control={form.control}
            render={({ field }) => (
              <div className="mt-3 space-y-2">
                {members.map((member) => {
                  const checked = field.value?.includes(member.userId) ?? false

                  return (
                    <label
                      key={member.userId}
                      className="flex cursor-pointer items-center gap-3 rounded-xp-lg border border-border px-3 py-2 has-[:checked]:border-border-focus has-[:checked]:bg-surface-subtle"
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...(field.value ?? []), member.userId]
                            : (field.value ?? []).filter((id) => id !== member.userId)
                          field.onChange(next)
                        }}
                      />
                      <span className="min-w-0 flex-1 text-sm font-medium">
                        {member.displayName ?? member.phone}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          />
          {form.formState.errors.sharedAmong && (
            <p className="mt-1 text-sm text-error-text">
              {form.formState.errors.sharedAmong.message}
            </p>
          )}
        </fieldset>

        <FormField
          id="expense-notes"
          label={
            <>
              Notes <span className="font-normal text-text-muted">(optional)</span>
            </>
          }
          error={form.formState.errors.notes?.message}
        >
          <Textarea rows={2} maxLength={2000} {...form.register('notes')} />
        </FormField>

        {saveError && <Alert variant="error">{saveError}</Alert>}
        {deleteError && <Alert variant="error">{deleteError}</Alert>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            loading={saveMutation.isPending}
            disabled={deleteMutation.isPending}
          >
            <Icon icon={Save} size={20} aria-hidden />
            {saveMutation.isPending
              ? 'Saving…'
              : mode === 'create'
                ? 'Add expense'
                : 'Save changes'}
          </Button>

          {showDelete && (
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              loading={deleteMutation.isPending}
              disabled={saveMutation.isPending}
              onClick={async () => {
                const confirmed = await confirm({
                  title: 'Delete expense',
                  message: 'Delete this expense? Settlements will be recalculated.',
                  confirmLabel: 'Delete',
                  destructive: true,
                })
                if (confirmed) {
                  deleteMutation.mutate()
                }
              }}
            >
              <Icon icon={Trash2} size={20} aria-hidden />
              {deleteMutation.isPending ? 'Deleting…' : 'Delete expense'}
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
