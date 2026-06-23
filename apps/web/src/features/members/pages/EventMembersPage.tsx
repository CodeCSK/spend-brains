import { useQuery } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { EmptyState, ListRowsSkeleton, PageSection } from '../../../components/layout'
import { Alert, Button } from '../../../components/ui'
import { ApiError, listMembers } from '../../../lib/api'
import { memberKeys } from '../../../lib/query-keys'
import { useEventContext } from '../../events/context/EventContext'
import { EventCategoriesSection } from '../../categories/components/EventCategoriesSection'
import { AddMemberFormDialog } from '../components/AddMemberFormDialog'
import { JoinRequestsSection } from '../components/JoinRequestsSection'
import { MemberRow } from '../components/MemberRow'
import { sortMembers } from '../lib/sort-members'

export function EventMembersPage() {
  const { eventId, permissions } = useEventContext()
  const [addMemberOpen, setAddMemberOpen] = useState(false)

  const membersQuery = useQuery({
    queryKey: memberKeys.list(eventId),
    queryFn: () => listMembers(eventId),
  })

  const members = membersQuery.data ? sortMembers(membersQuery.data) : []

  return (
    <div className="space-y-4">
      {permissions.canManageMembers && <JoinRequestsSection eventId={eventId} />}

      <AddMemberFormDialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        eventId={eventId}
      />

      <PageSection aria-labelledby="members-list-heading" className="xp-section-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="members-list-heading" className="text-sm font-semibold text-text-label sm:text-base">
            {membersQuery.data
              ? `${members.length} member${members.length === 1 ? '' : 's'}`
              : 'Members'}
          </h2>

          {permissions.canManageMembers && (
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-2.5 text-xs sm:text-sm"
              onClick={() => setAddMemberOpen(true)}
            >
              <Icon icon={Plus} size={16} aria-hidden />
              Add
            </Button>
          )}
        </div>

        {membersQuery.isLoading && <ListRowsSkeleton />}

        {membersQuery.isError && (
          <Alert variant="error" className="mt-3">
            {membersQuery.error instanceof ApiError
              ? membersQuery.error.message
              : 'Failed to load members'}
          </Alert>
        )}

        {membersQuery.isSuccess && members.length === 0 && (
          <EmptyState
            icon={Users}
            title="No members yet"
            className="mt-3 border-solid p-6 sm:p-8"
          />
        )}

        {membersQuery.isSuccess && members.length > 0 && (
          <ul className="xp-compact-list mt-3">
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                eventId={eventId}
                member={member}
                canChangeRole={permissions.isCaptain && member.role !== 'captain'}
                canRemove={permissions.isCaptain && member.role !== 'captain'}
              />
            ))}
          </ul>
        )}

        {!permissions.canManageMembers && membersQuery.isSuccess && members.length > 0 && (
          <p className="mt-3 text-xs text-text-muted">
            Only captain and vice captain can add members.
          </p>
        )}
      </PageSection>

      <EventCategoriesSection eventId={eventId} />
    </div>
  )
}
