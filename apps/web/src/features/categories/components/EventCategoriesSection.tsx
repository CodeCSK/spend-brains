import { Plus, Tags } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { ListRowsSkeleton, PageSection } from '../../../components/layout'
import { Alert, Button } from '../../../components/ui'
import { ApiError } from '../../../lib/api'
import type { Category } from '../../../types/category'
import { useEventContext } from '../../events/context/EventContext'
import { useCategories } from '../hooks/useCategories'
import { CategoryFormDialog } from './CategoryFormDialog'
import { CategoryRow } from './CategoryRow'

type EventCategoriesSectionProps = {
  eventId: string
}

type CategoryDialogState =
  | { mode: 'create' }
  | { mode: 'edit'; category: Category }
  | null

export function EventCategoriesSection({ eventId }: EventCategoriesSectionProps) {
  const { permissions } = useEventContext()
  const categoriesQuery = useCategories(eventId)
  const [dialogState, setDialogState] = useState<CategoryDialogState>(null)

  const categories = categoriesQuery.data ?? []

  return (
    <PageSection aria-labelledby="categories-heading" className="xp-section-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 id="categories-heading" className="text-sm font-semibold text-text-label sm:text-base">
            Categories
          </h2>
          {categoriesQuery.isSuccess && (
            <span className="text-xs text-text-muted">
              {categories.length}
            </span>
          )}
        </div>

        {permissions.canManageMembers && categoriesQuery.isSuccess && (
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-2.5 text-xs sm:text-sm"
            onClick={() => setDialogState({ mode: 'create' })}
          >
            <Icon icon={Plus} size={16} aria-hidden />
            Add
          </Button>
        )}
      </div>

      <CategoryFormDialog
        open={dialogState != null}
        onClose={() => setDialogState(null)}
        eventId={eventId}
        mode={dialogState?.mode ?? 'create'}
        category={dialogState?.mode === 'edit' ? dialogState.category : undefined}
      />

      {categoriesQuery.isLoading && <ListRowsSkeleton />}

      {categoriesQuery.isError && (
        <Alert variant="error" className="mt-3">
          {categoriesQuery.error instanceof ApiError
            ? categoriesQuery.error.message
            : 'Failed to load categories'}
        </Alert>
      )}

      {categoriesQuery.isSuccess && categories.length === 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs text-text-muted" role="status">
          <Icon icon={Tags} size={16} aria-hidden />
          No categories yet.
        </p>
      )}

      {categoriesQuery.isSuccess && categories.length > 0 && (
        <ul className="xp-compact-list mt-3">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              eventId={eventId}
              category={category}
              canEdit={permissions.canManageMembers}
              canDelete={permissions.isCaptain}
              onEdit={(cat) => setDialogState({ mode: 'edit', category: cat })}
            />
          ))}
        </ul>
      )}
    </PageSection>
  )
}
