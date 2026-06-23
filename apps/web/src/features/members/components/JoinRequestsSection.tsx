import { useQuery } from '@tanstack/react-query'
import { UserCheck } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { ListRowsSkeleton, PageSection } from '../../../components/layout'
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
    <PageSection aria-labelledby="join-requests-heading" className="xp-section-card">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="join-requests-heading" className="text-sm font-semibold text-text-label sm:text-base">
          Join requests
        </h2>
        {requestsQuery.isSuccess && pendingCount > 0 && (
          <Badge variant="info" className="px-1.5 py-0 text-[10px]">
            {pendingCount}
          </Badge>
        )}
      </div>

      {requestsQuery.isLoading && <ListRowsSkeleton rows={1} />}

      {requestsQuery.isError && (
        <Alert variant="error" className="mt-3">
          {requestsQuery.error instanceof ApiError
            ? requestsQuery.error.message
            : 'Failed to load join requests'}
        </Alert>
      )}

      {requestsQuery.isSuccess && pendingCount === 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-text-muted" role="status">
          <Icon icon={UserCheck} size={16} aria-hidden />
          No pending requests.
        </p>
      )}

      {requestsQuery.isSuccess && pendingCount > 0 && (
        <ul className="xp-compact-list mt-3">
          {requestsQuery.data!.map((request) => (
            <JoinRequestRow key={request.id} eventId={eventId} request={request} />
          ))}
        </ul>
      )}
    </PageSection>
  )
}
