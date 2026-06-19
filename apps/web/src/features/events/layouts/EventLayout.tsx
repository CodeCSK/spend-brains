import { Receipt, Scale, Settings, Users } from 'lucide-react'
import { Outlet, useParams } from 'react-router-dom'

import { PageLayout } from '../../../components/layout'
import { BackLink, Skeleton, Tab, Tabs } from '../../../components/ui'
import { EventAccessError } from '../components/EventAccessError'
import { EventRoleBadge } from '../components/EventRoleBadge'
import { EventProvider } from '../context/EventContext'
import { useEvent } from '../hooks/useEvent'
import {
  EVENT_TYPE_LABELS,
  EVENT_VISIBILITY_LABELS,
  formatEventDateRange,
} from '../lib/event-labels'

const tabs = [
  { to: 'expenses', label: 'Expenses', icon: Receipt },
  { to: 'members', label: 'Members', icon: Users },
  { to: 'settlements', label: 'Settlements', icon: Scale },
  { to: 'settings', label: 'Settings', icon: Settings },
] as const

export function EventLayout() {
  const { eventId } = useParams<{ eventId: string }>()
  const eventQuery = useEvent(eventId)

  if (eventQuery.isLoading) {
    return (
      <PageLayout width="wide">
        <Skeleton variant="rect" className="h-48 rounded-xp-xl" />
        <Skeleton variant="text" className="mt-6" />
        <Skeleton variant="text" className="mt-2 w-1/2" />
        <p className="mt-6 text-sm text-text-secondary" role="status">
          Loading event…
        </p>
      </PageLayout>
    )
  }

  if (eventQuery.isError || !eventQuery.data) {
    return <EventAccessError error={eventQuery.error} />
  }

  const event = eventQuery.data
  const dateLabel = formatEventDateRange(event.startDate, event.endDate)

  return (
    <EventProvider event={event} eventId={eventId!}>
      <PageLayout width="wide">
        <BackLink to="/app/events">All events</BackLink>

        <header className="overflow-hidden rounded-xp-xl border border-border bg-surface-raised shadow-xp-sm">
          <div className="relative aspect-[21/9] max-h-56 overflow-hidden bg-surface-subtle sm:aspect-[3/1]">
            {event.coverImageUrl ? (
              <img
                src={event.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                {EVENT_TYPE_LABELS[event.eventType]}
              </div>
            )}
            {event.isArchived && (
              <span className="absolute left-3 top-3 rounded-xp-md bg-surface-inverse px-2 py-0.5 text-xs font-medium text-text-inverse">
                Archived
              </span>
            )}
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold sm:text-2xl">{event.name}</h1>
                <p className="mt-1 text-sm text-text-secondary">{dateLabel}</p>
              </div>
              <EventRoleBadge role={event.myRole} />
            </div>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-text-muted">Type</dt>
                <dd className="font-medium">{EVENT_TYPE_LABELS[event.eventType]}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Visibility</dt>
                <dd className="font-medium">{EVENT_VISIBILITY_LABELS[event.visibility]}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Join code</dt>
                <dd className="font-mono font-medium">{event.publicId}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Members</dt>
                <dd className="font-medium">
                  {event.memberCount} member{event.memberCount === 1 ? '' : 's'}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <Tabs aria-label="Event sections" className="mt-6">
          {tabs.map(({ to, label, icon }) => (
            <Tab key={to} to={to} icon={icon}>
              {label}
            </Tab>
          ))}
        </Tabs>

        <div className="mt-6 sm:mt-8">
          <Outlet />
        </div>
      </PageLayout>
    </EventProvider>
  )
}
