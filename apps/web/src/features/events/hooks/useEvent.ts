import { useQuery } from '@tanstack/react-query'

import { getEvent } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'
import { normalizeEventCode } from '../lib/event-routes'

/** Load event by join code (preferred) or legacy UUID. */
export function useEvent(eventRef: string | undefined) {
  const normalizedRef = eventRef ? normalizeEventCode(eventRef) : undefined

  return useQuery({
    queryKey: eventKeys.detail(normalizedRef ?? ''),
    queryFn: () => getEvent(normalizedRef!),
    enabled: !!normalizedRef,
    retry: false,
  })
}
