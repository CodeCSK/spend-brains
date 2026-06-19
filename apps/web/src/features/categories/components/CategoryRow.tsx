import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '../../../components/Icon'
import { Button, FormField, Input, Select } from '../../../components/ui'
import { ApiError, deleteCategory, updateCategory } from '../../../lib/api'
import { categoryKeys } from '../../../lib/query-keys'
import { useConfirm } from '../../../lib/store/useConfirm'
import { useToast } from '../../../lib/store/useToast'
import type { Category } from '../../../types/category'
import {
  CATEGORY_ICON_KEYS,
  CATEGORY_ICON_LABELS,
  isCategoryIconKey,
  type CategoryIconKey,
} from '../lib/category-icons'
import { CategoryIcon } from './CategoryIcon'

const editCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  icon: z.enum(CATEGORY_ICON_KEYS),
})

function toIconKey(icon: string): CategoryIconKey {
  return isCategoryIconKey(icon) ? icon : 'other'
}

type EditCategoryFormValues = z.infer<typeof editCategorySchema>

type CategoryRowProps = {
  eventId: string
  category: Category
  canEdit: boolean
  canDelete: boolean
}

export function CategoryRow({ eventId, category, canEdit, canDelete }: CategoryRowProps) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const form = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: category.name,
      icon: toIconKey(category.icon),
    },
  })

  const invalidateCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: categoryKeys.list(eventId) })
  }

  const updateMutation = useMutation({
    mutationFn: (values: EditCategoryFormValues) =>
      updateCategory(eventId, category.id, {
        name: values.name.trim(),
        icon: values.icon,
      }),
    onSuccess: async () => {
      setActionError(null)
      setIsEditing(false)
      toast.success('Category updated.')
      await invalidateCategories()
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to update category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(eventId, category.id),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Category deleted.')
      await invalidateCategories()
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to delete category')
    },
  })

  const isPending = updateMutation.isPending || deleteMutation.isPending

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete category',
      message: `Delete category "${category.name}"? This only works if no expenses use it.`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (confirmed) {
      deleteMutation.mutate()
    }
  }

  function startEditing() {
    form.reset({
      name: category.name,
      icon: toIconKey(category.icon),
    })
    setActionError(null)
    setIsEditing(true)
  }

  if (isEditing) {
    return (
      <li className="rounded-xp-lg border border-border bg-surface-subtle p-3">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
        >
          <FormField
            id={`edit-name-${category.id}`}
            label="Name"
            error={form.formState.errors.name?.message}
            className="min-w-0 flex-1"
          >
            <Input type="text" maxLength={50} {...form.register('name')} />
          </FormField>

          <FormField id={`edit-icon-${category.id}`} label="Icon" className="sm:w-40">
            <Select {...form.register('icon')}>
              {CATEGORY_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_ICON_LABELS[key]}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex flex-wrap gap-2 sm:mt-[1.625rem]">
            <Button type="submit" loading={isPending}>
              <Icon icon={Save} size={20} aria-hidden />
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => setIsEditing(false)}
            >
              <Icon icon={X} size={20} aria-hidden />
              Cancel
            </Button>
          </div>
        </form>
        {actionError && <p className="mt-2 text-sm text-error-text">{actionError}</p>}
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-3 rounded-xp-lg border border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xp-full bg-surface-subtle">
          <CategoryIcon iconKey={category.icon} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{category.name}</p>
          <p className="text-xs text-text-muted">
            {category.isDefault ? 'Default category' : 'Custom category'}
          </p>
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button type="button" variant="secondary" disabled={isPending} onClick={startEditing}>
              <Icon icon={Pencil} size={20} aria-hidden />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Icon icon={Trash2} size={20} aria-hidden />
              Delete
            </Button>
          )}
        </div>
      )}

      {actionError && <p className="w-full text-sm text-error-text">{actionError}</p>}
    </li>
  )
}
