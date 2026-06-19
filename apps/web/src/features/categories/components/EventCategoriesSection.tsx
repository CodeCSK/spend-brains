import { Tags } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { PageSection } from '../../../components/layout'
import { Alert } from '../../../components/ui'
import { ApiError } from '../../../lib/api'
import { useEventContext } from '../../events/context/EventContext'
import { useCategories } from '../hooks/useCategories'
import { AddCategoryForm } from './AddCategoryForm'
import { CategoryRow } from './CategoryRow'

type EventCategoriesSectionProps = {
  eventId: string
}

export function EventCategoriesSection({ eventId }: EventCategoriesSectionProps) {
  const { permissions } = useEventContext()
  const categoriesQuery = useCategories(eventId)

  const categories = categoriesQuery.data ?? []

  return (
    <PageSection aria-labelledby="categories-heading">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="categories-heading" className="text-lg font-semibold text-text-label">
          Expense categories
        </h2>
        {categoriesQuery.isSuccess && (
          <span className="text-sm text-text-muted">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        {permissions.canManageMembers
          ? 'Default categories are seeded when an event is created. Add custom ones for your group.'
          : 'Categories used when logging expenses. Captain and vice captain can manage them.'}
      </p>

      {categoriesQuery.isLoading && (
        <ul className="mt-4 space-y-2" aria-hidden>
          {[0, 1, 2].map((key) => (
            <li key={key} className="xp-skeleton h-14 rounded-xp-lg" />
          ))}
        </ul>
      )}

      {categoriesQuery.isError && (
        <Alert variant="error" className="mt-4">
          {categoriesQuery.error instanceof ApiError
            ? categoriesQuery.error.message
            : 'Failed to load categories'}
        </Alert>
      )}

      {categoriesQuery.isSuccess && categories.length === 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted" role="status">
          <Icon icon={Tags} size={16} aria-hidden />
          No categories yet.
        </p>
      )}

      {categoriesQuery.isSuccess && categories.length > 0 && (
        <ul className="mt-4 space-y-2">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              eventId={eventId}
              category={category}
              canEdit={permissions.canManageMembers}
              canDelete={permissions.isCaptain}
            />
          ))}
        </ul>
      )}

      {permissions.canManageMembers && categoriesQuery.isSuccess && (
        <AddCategoryForm eventId={eventId} />
      )}
    </PageSection>
  )
}
