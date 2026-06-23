import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Badge } from '../../../components/ui'
import { ApiError, deleteCategory } from '../../../lib/api'
import { categoryKeys } from '../../../lib/query-keys'
import { useConfirm } from '../../../lib/store/useConfirm'
import { useToast } from '../../../lib/store/useToast'
import type { Category } from '../../../types/category'
import { CategoryIcon } from './CategoryIcon'

type CategoryRowProps = {
  eventId: string
  category: Category
  canEdit: boolean
  canDelete: boolean
  onEdit: (category: Category) => void
}

export function CategoryRow({ eventId, category, canEdit, canDelete, onEdit }: CategoryRowProps) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(eventId, category.id),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Category deleted.')
      await queryClient.invalidateQueries({ queryKey: categoryKeys.list(eventId) })
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to delete category')
    },
  })

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

  const showActions = canEdit || canDelete

  return (
    <li className="xp-compact-list-row">
      <CategoryIcon iconKey={category.icon} size={16} variant="badge" />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium">{category.name}</p>
          {category.isDefault && (
            <Badge variant="neutral" className="px-1.5 py-0 text-[10px]">
              Default
            </Badge>
          )}
        </div>
        {actionError && <p className="mt-0.5 text-xs text-error-text">{actionError}</p>}
      </div>

      {showActions && (
        <div className="flex shrink-0 items-center gap-0.5">
          {canEdit && (
            <button
              type="button"
              className="xp-icon-btn-sm"
              aria-label={`Edit ${category.name}`}
              disabled={deleteMutation.isPending}
              onClick={() => onEdit(category)}
            >
              <Icon icon={Pencil} size={16} aria-hidden />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="xp-icon-btn-sm-danger"
              aria-label={`Delete ${category.name}`}
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              <Icon icon={Trash2} size={16} aria-hidden />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
