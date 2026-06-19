import { createContext, useContext, useMemo, type ReactNode } from 'react'

import type { Event, MemberRole } from '../../../types/event'
import { getEventPermissions, type EventPermissions } from '../lib/event-permissions'

type EventContextValue = {
  event: Event
  eventId: string
  myRole: MemberRole
  permissions: EventPermissions
}

const EventContext = createContext<EventContextValue | null>(null)

type EventProviderProps = {
  event: Event
  eventId: string
  children: ReactNode
}

export function EventProvider({ event, eventId, children }: EventProviderProps) {
  const value = useMemo<EventContextValue>(
    () => ({
      event,
      eventId,
      myRole: event.myRole,
      permissions: getEventPermissions(event.myRole),
    }),
    [event, eventId],
  )

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

// Hook colocated with provider — standard context pattern; not a Fast Refresh component export.
// eslint-disable-next-line react-refresh/only-export-components
export function useEventContext(): EventContextValue {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEventContext must be used within EventProvider')
  }
  return context
}
