import { useQuery } from '@tanstack/react-query'
import { UserCheck } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { PageSection } from '../../../components/layout'
import { Alert, Badge } from '../../../components/ui'
import { ApiError, listJoinRequests } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'
import { useEventContext } from '../../events/context/EventContext'
import { JoinRequestRow } from './JoinRequestRow'

type JoinRequestsSectionProps = {
  eventId: string
}

export function JoinRequestsSection({ eventId }: JoinRequestsSectionProps) {
  const { event } = useEventContext()

  const requestsQuery = useQuery({
    queryKey: eventKeys.joinRequests(eventId),
    queryFn: () => listJoinRequests(eventId),
    enabled: event.visibility === 'private',
  })

  if (event.visibility !== 'private') {
    return null
  }

  const pendingCount = requestsQuery.data?.length ?? 0

  return (
    <PageSection aria-labelledby="join-requests-heading">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="join-requests-heading" className="text-lg font-semibold text-text-label">
          Join requests
        </h2>
        {requestsQuery.isSuccess && pendingCount > 0 && (
          <Badge variant="info">{pendingCount} pending</Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        People who requested to join this private event. Approving adds them as members.
      </p>

      {requestsQuery.isLoading && (
        <ul className="mt-4 space-y-3" aria-hidden>
          <li className="xp-skeleton-card" />
        </ul>
      )}

      {requestsQuery.isError && (
        <Alert variant="error" className="mt-4">
          {requestsQuery.error instanceof ApiError
            ? requestsQuery.error.message
            : 'Failed to load join requests'}
        </Alert>
      )}

      {requestsQuery.isSuccess && pendingCount === 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted" role="status">
          <Icon icon={UserCheck} size={16} aria-hidden />
          No pending join requests.
        </p>
      )}

      {requestsQuery.isSuccess && pendingCount > 0 && (
        <ul className="mt-4 space-y-3">
          {requestsQuery.data!.map((request) => (
            <JoinRequestRow key={request.id} eventId={eventId} request={request} />
          ))}
        </ul>
      )}
    </PageSection>
  )
}
