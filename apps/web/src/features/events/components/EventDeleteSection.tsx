import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { Alert, Button } from '../../../components/ui'
import { ApiError, deleteEvent } from '../../../lib/api'
import { useConfirm } from '../../../lib/store/useConfirm'
import { useToast } from '../../../lib/store/useToast'
import { eventKeys } from '../../../lib/query-keys'

type EventDeleteSectionProps = {
  eventId: string
  eventName: string
}

export function EventDeleteSection({ eventId, eventName }: EventDeleteSectionProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(eventId),
    onSuccess: async () => {
      toast.success('Event deleted.')
      await queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      navigate('/app/events', { replace: true })
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to delete event')
    },
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete event',
      message: `Delete "${eventName}" permanently? All expenses, members, and settlements will be removed. This cannot be undone.`,
      confirmLabel: 'Delete event',
      destructive: true,
    })
    if (confirmed) {
      deleteMutation.mutate()
    }
  }

  return (
    <section
      aria-labelledby="event-delete-heading"
      className="xp-section-card border-error-bg/60"
    >
      <div className="xp-settings-action-row">
        <div className="min-w-0">
          <h2 id="event-delete-heading" className="text-sm font-semibold text-error-text-strong sm:text-base">
            Delete event
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            Permanently remove this event and all its data. Captain only.
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          className="h-8 w-full shrink-0 px-2.5 text-xs sm:w-auto sm:text-sm"
          loading={deleteMutation.isPending}
          onClick={handleDelete}
        >
          <Icon icon={Trash2} size={16} aria-hidden />
          {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
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
