import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Archive, ArchiveRestore } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Alert, Button } from '../../../components/ui'
import { ApiError, archiveEvent, unarchiveEvent } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import type { Event } from '../../../types/event'

type EventArchiveSectionProps = {
  event: Event
  eventId: string
}

export function EventArchiveSection({ event, eventId }: EventArchiveSectionProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() }),
    ])
  }

  const archiveMutation = useMutation({
    mutationFn: () => (event.isArchived ? unarchiveEvent(eventId) : archiveEvent(eventId)),
    onSuccess: async () => {
      setActionError(null)
      toast.success(event.isArchived ? 'Event unarchived.' : 'Event archived.')
      await invalidate()
    },
    onError: (error) => {
      setActionError(
        error instanceof ApiError ? error.message : 'Failed to update archive status',
      )
    },
  })

  const actionLabel = event.isArchived ? 'Unarchive' : 'Archive'
  const hint = event.isArchived
    ? 'Hidden from your active list until unarchived.'
    : 'Move out of your active list when the trip is done.'

  return (
    <section aria-labelledby="event-archive-heading" className="xp-section-card">
      <div className="xp-settings-action-row">
        <div className="min-w-0">
          <h2 id="event-archive-heading" className="text-sm font-semibold text-text-label sm:text-base">
            Archive
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">{hint}</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-8 w-full shrink-0 px-2.5 text-xs sm:w-auto sm:text-sm"
          loading={archiveMutation.isPending}
          onClick={() => archiveMutation.mutate()}
        >
          <Icon icon={event.isArchived ? ArchiveRestore : Archive} size={16} aria-hidden />
          {archiveMutation.isPending ? 'Saving…' : actionLabel}
        </Button>
      </div>

      {actionError && (
        <Alert variant="error" className="mt-2.5">
          {actionError}
        </Alert>
      )}
    </section>
  )
}
