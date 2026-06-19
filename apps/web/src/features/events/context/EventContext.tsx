import { createContext, useContext, useMemo, type ReactNode } from 'react'

import type { Event, MemberRole } from '../../../types/event'
import { getEventPermissions, type EventPermissions } from '../lib/event-permissions'

type EventContextValue = {
  event: Event
  /** Internal UUID — use for API calls. */
  eventId: string
  /** Public join code — use in URLs. */
  eventCode: string
  myRole: MemberRole
  permissions: EventPermissions
}

const EventContext = createContext<EventContextValue | null>(null)

type EventProviderProps = {
  event: Event
  children: ReactNode
}

export function EventProvider({ event, children }: EventProviderProps) {
  const value = useMemo<EventContextValue>(
    () => ({
      event,
      eventId: event.id,
      eventCode: event.publicId,
      myRole: event.myRole,
      permissions: getEventPermissions(event.myRole),
    }),
    [event],
  )

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEventContext(): EventContextValue {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEventContext must be used within EventProvider')
  }
  return context
}
