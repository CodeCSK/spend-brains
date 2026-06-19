import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { PageSection } from '../../../components/layout'
import { Alert } from '../../../components/ui'
import { ApiError, listMembers } from '../../../lib/api'
import { memberKeys } from '../../../lib/query-keys'
import { useEventContext } from '../../events/context/EventContext'
import { EventCategoriesSection } from '../../categories/components/EventCategoriesSection'
import { AddMemberForm } from '../components/AddMemberForm'
import { JoinRequestsSection } from '../components/JoinRequestsSection'
import { MemberRow } from '../components/MemberRow'
import { sortMembers } from '../lib/sort-members'

export function EventMembersPage() {
  const { eventId, permissions } = useEventContext()

  const membersQuery = useQuery({
    queryKey: memberKeys.list(eventId),
    queryFn: () => listMembers(eventId),
  })

  const members = membersQuery.data ? sortMembers(membersQuery.data) : []

  return (
    <div className="space-y-6">
      {permissions.canManageMembers && <JoinRequestsSection eventId={eventId} />}
      {permissions.canManageMembers && <AddMemberForm eventId={eventId} />}

      <PageSection aria-labelledby="members-list-heading">
        <h2 id="members-list-heading" className="text-lg font-semibold text-text-label">
          {membersQuery.data
            ? `${members.length} member${members.length === 1 ? '' : 's'}`
            : 'Members'}
        </h2>

        {membersQuery.isLoading && (
          <ul className="mt-4 space-y-3" aria-hidden>
            {[0, 1, 2].map((key) => (
              <li key={key} className="xp-skeleton-card" />
            ))}
          </ul>
        )}

        {membersQuery.isError && (
          <Alert variant="error" className="mt-4">
            {membersQuery.error instanceof ApiError
              ? membersQuery.error.message
              : 'Failed to load members'}
          </Alert>
        )}

        {membersQuery.isSuccess && members.length === 0 && (
          <p className="mt-4 text-sm text-text-secondary" role="status">
            No members found.
          </p>
        )}

        {membersQuery.isSuccess && members.length > 0 && (
          <ul className="mt-4 space-y-3">
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

        {!permissions.canManageMembers && membersQuery.isSuccess && (
          <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
            <Icon icon={Users} size={16} aria-hidden />
            Only the captain and vice captain can add members. Role changes and removal are
            captain-only.
          </p>
        )}
      </PageSection>

      <EventCategoriesSection eventId={eventId} />
    </div>
  )
}
