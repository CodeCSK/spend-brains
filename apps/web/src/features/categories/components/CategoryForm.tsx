import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '../../../components/Icon'
import { Alert, Button, Card, FormField, Input } from '../../../components/ui'
import { ApiError, createCategory, updateCategory } from '../../../lib/api'
import { categoryKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import type { Category } from '../../../types/category'
import { CATEGORY_ICON_KEYS, normalizeCategoryIconKey, type CategoryIconKey } from '../lib/category-icons'
import { CategoryIconPicker } from './CategoryIconPicker'

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  icon: z.enum(CATEGORY_ICON_KEYS),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export const CATEGORY_FORM_ID = 'category-form'

function toIconKey(icon: string): CategoryIconKey {
  return normalizeCategoryIconKey(icon)
}

type CategoryFormProps = {
  eventId: string
  mode: 'create' | 'edit'
  category?: Category
  layout?: 'page' | 'modal'
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({
  eventId,
  mode,
  category,
  layout = 'modal',
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      icon: category ? toIconKey(category.icon) : 'sparkles',
    },
  })

  useEffect(() => {
    form.reset({
      name: category?.name ?? '',
      icon: category ? toIconKey(category.icon) : 'sparkles',
    })
  }, [category, mode, form])

  const saveMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const payload = { name: values.name.trim(), icon: values.icon }
      if (mode === 'create') {
        return createCategory(eventId, payload)
      }
      return updateCategory(eventId, category!.id, payload)
    },
    onSuccess: async () => {
      toast.success(mode === 'create' ? 'Category added.' : 'Category updated.')
      await queryClient.invalidateQueries({ queryKey: categoryKeys.list(eventId) })
      onSuccess?.()
    },
  })

  const saveError =
    saveMutation.error instanceof ApiError
      ? saveMutation.error.message
      : saveMutation.error?.message

  const submitLabel =
    saveMutation.isPending
      ? 'Saving…'
      : mode === 'create'
        ? 'Add category'
        : 'Save changes'

  const footerActions = (
    <>
      {onCancel && layout !== 'modal' && (
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button type="submit" form={layout === 'modal' ? CATEGORY_FORM_ID : undefined} loading={saveMutation.isPending}>
        <Icon icon={Save} size={20} aria-hidden />
        {submitLabel}
      </Button>
    </>
  )

  const formFields = (
    <>
      <FormField
        id="category-name"
        label="Name"
        error={form.formState.errors.name?.message}
      >
        <Input
          type="text"
          maxLength={50}
          placeholder="Snacks"
          autoFocus={layout === 'modal'}
          {...form.register('name')}
        />
      </FormField>

      <FormField id="category-icon" label="Icon" error={form.formState.errors.icon?.message}>
        <Controller
          control={form.control}
          name="icon"
          render={({ field }) => (
            <CategoryIconPicker
              name={field.name}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      {saveError && <Alert variant="error">{saveError}</Alert>}
    </>
  )

  if (layout === 'modal') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <form
          id={CATEGORY_FORM_ID}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          {formFields}
        </form>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-surface-raised px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-4">
          {footerActions}
        </div>
      </div>
    )
  }

  return (
    <Card as="article">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      >
        {formFields}
        <div className="flex gap-2">{footerActions}</div>
      </form>
    </Card>
  )
}
