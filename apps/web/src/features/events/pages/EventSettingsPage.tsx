import { Settings } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { Card } from '../../../components/ui'
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
      <Card as="article">
        <h2 className="text-lg font-semibold text-text-label">Settings</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Only the captain and vice captain can edit event details, archive, or delete the event.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Icon icon={Settings} size={16} aria-hidden />
        {event.isArchived ? 'This event is archived.' : 'Manage event details and lifecycle.'}
      </div>

      <EditEventForm event={event} eventId={eventId} />
      <EventArchiveSection event={event} eventId={eventId} />
      {permissions.isCaptain && (
        <EventDeleteSection eventId={eventId} eventName={event.name} />
      )}
    </div>
  )
}
