import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Plus, UserPlus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { EmptyState, PageHeader, PageLayout, PageSection } from '../../../components/layout'
import { Alert, Button, SegmentedControl } from '../../../components/ui'
import { ApiError, listEvents } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'
import { EventCard } from '../components/EventCard'

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const showArchived = searchParams.get('archived') === 'true'

  const eventsQuery = useQuery({
    queryKey: eventKeys.list({ archived: showArchived }),
    queryFn: () => listEvents({ archived: showArchived }),
  })

  const headerActions = (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
      <Button as="link" to="/app/join" variant="secondary" className="w-full sm:w-auto">
        <Icon icon={UserPlus} size={20} aria-hidden />
        Join event
      </Button>
      <Button as="link" to="/app/events/new" variant="primary" className="w-full sm:w-auto">
        <Icon icon={Plus} size={20} aria-hidden />
        Create event
      </Button>
    </div>
  )

  function setArchivedFilter(archived: boolean) {
    if (archived) {
      setSearchParams({ archived: 'true' })
    } else {
      setSearchParams({})
    }
  }

  return (
    <PageLayout width="wide">
      <PageHeader
        title={
          <>
            <Icon icon={CalendarDays} size={24} className="text-primary" aria-hidden />
            Events
          </>
        }
        action={headerActions}
      />

      <SegmentedControl
        aria-label="Event list filter"
        className="mt-6 sm:mt-8"
        value={showArchived ? 'archived' : 'active'}
        onChange={(value) => setArchivedFilter(value === 'archived')}
        stretch
        options={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
      />

      <PageSection aria-label="Your events" className="mt-6 sm:mt-8">
        {eventsQuery.isLoading && (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
            {[0, 1, 2].map((key) => (
              <li key={key} className="xp-skeleton-card" />
            ))}
          </ul>
        )}

        {eventsQuery.isError && (
          <Alert variant="error">
            {eventsQuery.error instanceof ApiError
              ? eventsQuery.error.message
              : 'Failed to load events'}
          </Alert>
        )}

        {eventsQuery.isSuccess && eventsQuery.data.length === 0 && !showArchived && (
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            description="Create an event to start tracking shared expenses."
            action={
              <Button as="link" to="/app/events/new" variant="primary">
                <Icon icon={Plus} size={20} aria-hidden />
                Create event
              </Button>
            }
          />
        )}

        {eventsQuery.isSuccess && eventsQuery.data.length === 0 && showArchived && (
          <EmptyState
            icon={CalendarDays}
            title="No archived events"
            description="Archived events appear here."
            action={
              <Button type="button" variant="secondary" onClick={() => setArchivedFilter(false)}>
                View active events
              </Button>
            }
          />
        )}

        {eventsQuery.isSuccess && eventsQuery.data.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {eventsQuery.data.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </PageLayout>
  )
}
