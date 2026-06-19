import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '../../../components/Icon'
import { Alert, Button, FormField, Input, Select } from '../../../components/ui'
import { ApiError, createCategory } from '../../../lib/api'
import { categoryKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import {
  CATEGORY_ICON_KEYS,
  CATEGORY_ICON_LABELS,
  type CategoryIconKey,
} from '../lib/category-icons'

const addCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  icon: z.enum(CATEGORY_ICON_KEYS),
})

type AddCategoryFormValues = z.infer<typeof addCategorySchema>

type AddCategoryFormProps = {
  eventId: string
}

export function AddCategoryForm({ eventId }: AddCategoryFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const form = useForm<AddCategoryFormValues>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: { name: '', icon: 'other' },
  })

  const createMutation = useMutation({
    mutationFn: (values: AddCategoryFormValues) =>
      createCategory(eventId, {
        name: values.name.trim(),
        icon: values.icon,
      }),
    onSuccess: async () => {
      form.reset({ name: '', icon: 'other' })
      toast.success('Category added.')
      await queryClient.invalidateQueries({ queryKey: categoryKeys.list(eventId) })
    },
  })

  const createError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error?.message

  return (
    <form
      className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-start"
      onSubmit={form.handleSubmit((values) => {
        createMutation.mutate(values)
      })}
    >
      <FormField
        id="category-name"
        label="New category name"
        error={form.formState.errors.name?.message}
        className="min-w-0 flex-1"
      >
        <Input type="text" maxLength={50} placeholder="Snacks" {...form.register('name')} />
      </FormField>

      <FormField id="category-icon" label="Icon" className="sm:w-40">
        <Select {...form.register('icon')}>
          {CATEGORY_ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {CATEGORY_ICON_LABELS[key as CategoryIconKey]}
            </option>
          ))}
        </Select>
      </FormField>

      <Button
        type="submit"
        loading={createMutation.isPending}
        className="shrink-0 sm:mt-[1.625rem]"
      >
        <Icon icon={Plus} size={20} aria-hidden />
        {createMutation.isPending ? 'Adding…' : 'Add category'}
      </Button>

      {createError && (
        <Alert variant="error" className="w-full">
          {createError}
        </Alert>
      )}
    </form>
  )
}
