import { useQuery } from '@tanstack/react-query'

import { getEvent } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(eventId ?? ''),
    queryFn: () => getEvent(eventId!),
    enabled: !!eventId,
    retry: false,
  })
}
