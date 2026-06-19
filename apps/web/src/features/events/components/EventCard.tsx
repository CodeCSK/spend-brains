import { Chip, Card } from '../../../components/ui'
import type { Event } from '../../../types/event'
import { EVENT_TYPE_LABELS, formatEventDateRange } from '../lib/event-labels'
import { eventExpensesPath } from '../lib/event-routes'
import { EventTypeBanner } from './EventTypeBanner'
import { EventRoleBadge } from './EventRoleBadge'

type EventCardProps = {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const dateLabel = formatEventDateRange(event.startDate, event.endDate)

  return (
    <Card
      as="link"
      to={eventExpensesPath(event.publicId)}
      className="group block overflow-hidden p-0 transition-shadow hover:shadow-xp-md focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
    >
      <EventTypeBanner eventType={event.eventType} variant="card" archived={event.isArchived} />

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 text-lg font-semibold leading-snug group-hover:text-primary">
            {event.name}
          </h2>
          <EventRoleBadge role={event.myRole} />
        </div>

        <p className="mt-1 text-sm text-text-secondary">{dateLabel}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <Chip>{EVENT_TYPE_LABELS[event.eventType]}</Chip>
          <Chip mono>{event.publicId}</Chip>
          <span>
            {event.memberCount} member{event.memberCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </Card>
  )
}
