import { Receipt, Scale, Settings, Users } from 'lucide-react'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageLayout, EventPageLoadingSkeleton } from '../../../components/layout'
import { BackLink, Tab, Tabs } from '../../../components/ui'
import { EventTypeBanner } from '../components/EventTypeBanner'
import { EventAccessError } from '../components/EventAccessError'
import { EventRoleBadge } from '../components/EventRoleBadge'
import { EventProvider } from '../context/EventContext'
import { useEvent } from '../hooks/useEvent'
import {
  EVENT_TYPE_LABELS,
  EVENT_VISIBILITY_LABELS,
  formatEventDateRange,
} from '../lib/event-labels'
import { eventPath } from '../lib/event-routes'

const tabs = [
  { to: 'expenses', label: 'Expenses', shortLabel: 'Spend', icon: Receipt },
  { to: 'members', label: 'Members', shortLabel: 'People', icon: Users },
  { to: 'settlements', label: 'Settlements', shortLabel: 'Settle', icon: Scale },
  { to: 'settings', label: 'Settings', shortLabel: 'Setup', icon: Settings },
] as const

export function EventLayout() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const eventQuery = useEvent(eventCode)

  const event = eventQuery.data

  useEffect(() => {
    if (!event || !eventCode) return

    const canonical = event.publicId
    if (eventCode.toUpperCase() === canonical) return

    const prefix = `/app/events/${eventCode}`
    const suffix = location.pathname.startsWith(prefix)
      ? location.pathname.slice(prefix.length)
      : ''

    navigate(`${eventPath(canonical)}${suffix}${location.search}`, { replace: true })
  }, [event, eventCode, location.pathname, location.search, navigate])

  if (eventQuery.isLoading) {
    return <EventPageLoadingSkeleton />
  }

  if (eventQuery.isError || !event) {
    return <EventAccessError error={eventQuery.error} />
  }

  const dateLabel = formatEventDateRange(event.startDate, event.endDate)

  return (
    <EventProvider event={event}>
      <PageLayout width="wide">
        <BackLink to="/app/events">All events</BackLink>

        <header className="overflow-hidden rounded-xp-lg border border-border bg-surface-raised shadow-xp-sm">
          <EventTypeBanner eventType={event.eventType} variant="compact" archived={event.isArchived} />

          <div className="p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-bold md:text-2xl">{event.name}</h1>
                <p className="mt-0.5 text-base text-text-secondary">{dateLabel}</p>
              </div>
              <EventRoleBadge role={event.myRole} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-base md:grid-cols-4 md:gap-x-8">
              <div>
                <dt className="text-text-muted">Type</dt>
                <dd className="font-medium">{EVENT_TYPE_LABELS[event.eventType]}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Visibility</dt>
                <dd className="font-medium">{EVENT_VISIBILITY_LABELS[event.visibility]}</dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="text-text-muted">Join code</dt>
                <dd className="truncate font-mono font-medium">{event.publicId}</dd>
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

        <Tabs aria-label="Event sections" className="mt-5 md:mt-6">
          {tabs.map(({ to, label, shortLabel, icon }) => (
            <Tab key={to} to={to} icon={icon} shortLabel={shortLabel}>
              {label}
            </Tab>
          ))}
        </Tabs>

        <div className="mt-5 md:mt-6">
          <Outlet />
        </div>
      </PageLayout>
    </EventProvider>
  )
}
