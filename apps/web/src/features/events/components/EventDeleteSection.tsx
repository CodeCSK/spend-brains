import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Icon } from '../../../components/Icon'
import { Alert, Button, Card } from '../../../components/ui'
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
    <Card as="article" className="border-error-bg">
      <h2 className="text-lg font-semibold text-error-text-strong">Danger zone</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Permanently delete this event. Only the captain can do this.
      </p>

      <Button
        type="button"
        variant="destructive"
        className="mt-4"
        loading={deleteMutation.isPending}
        onClick={handleDelete}
      >
        <Icon icon={Trash2} size={20} aria-hidden />
        {deleteMutation.isPending ? 'Deleting…' : 'Delete event'}
      </Button>

      {actionError && (
        <Alert variant="error" className="mt-3">
          {actionError}
        </Alert>
      )}
    </Card>
  )
}
