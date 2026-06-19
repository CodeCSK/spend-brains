import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Archive, ArchiveRestore } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Alert, Button, Card } from '../../../components/ui'
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

  return (
    <Card as="article">
      <h2 className="text-lg font-semibold text-text-label">Archive</h2>
      <p className="mt-1 text-sm text-text-secondary">
        {event.isArchived
          ? 'This event is archived and hidden from your active list. Unarchive to restore it.'
          : 'Archive when the trip is done. Archived events move out of your active list but remain accessible here.'}
      </p>

      <Button
        type="button"
        variant="secondary"
        className="mt-4"
        loading={archiveMutation.isPending}
        onClick={() => archiveMutation.mutate()}
      >
        <Icon icon={event.isArchived ? ArchiveRestore : Archive} size={20} aria-hidden />
        {archiveMutation.isPending
          ? 'Saving…'
          : event.isArchived
            ? 'Unarchive event'
            : 'Archive event'}
      </Button>

      {actionError && (
        <Alert variant="error" className="mt-3">
          {actionError}
        </Alert>
      )}
    </Card>
  )
}
