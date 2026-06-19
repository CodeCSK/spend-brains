import { useQuery } from '@tanstack/react-query'

import { listCategories } from '../../../lib/api'
import { categoryKeys } from '../../../lib/query-keys'

export function useCategories(eventId: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.list(eventId ?? ''),
    queryFn: () => listCategories(eventId!),
    enabled: !!eventId,
  })
}
