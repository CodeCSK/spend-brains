import { Archive } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { useEventContext } from '../context/EventContext'
import { canEditEvent } from '../lib/event-permissions'
import { EditEventForm } from '../components/EditEventForm'
import { EventArchiveSection } from '../components/EventArchiveSection'
import { EventDeleteSection } from '../components/EventDeleteSection'

export function EventSettingsPage() {
  const { event, eventId, permissions, myRole } = useEventContext()
  const canManage = canEditEvent(myRole)

  if (!canManage) {
    return (
      <section aria-labelledby="settings-denied-heading" className="xp-section-card">
        <h2 id="settings-denied-heading" className="text-sm font-semibold text-text-label sm:text-base">
          Settings
        </h2>
        <p className="mt-1.5 text-xs text-text-secondary sm:text-sm">
          Only the captain and vice captain can edit event details, archive, or delete the event.
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      {event.isArchived && (
        <p className="flex items-center gap-1.5 text-xs text-text-muted" role="status">
          <Icon icon={Archive} size={16} aria-hidden />
          This event is archived.
        </p>
      )}

      <EditEventForm event={event} eventId={eventId} />
      <EventArchiveSection event={event} eventId={eventId} />
      {permissions.isCaptain && (
        <EventDeleteSection eventId={eventId} eventName={event.name} />
      )}
    </div>
  )
}
