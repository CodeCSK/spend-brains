import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Avatar, Button, Card } from '../../../components/ui'
import { ApiError, approveJoinRequest, rejectJoinRequest } from '../../../lib/api'
import { eventKeys, memberKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import type { JoinRequest } from '../../../types/join-request'

type JoinRequestRowProps = {
  eventId: string
  request: JoinRequest
}

export function JoinRequestRow({ eventId, request }: JoinRequestRowProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: eventKeys.joinRequests(eventId) }),
      queryClient.invalidateQueries({ queryKey: memberKeys.list(eventId) }),
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
    ])
  }

  const approveMutation = useMutation({
    mutationFn: () => approveJoinRequest(eventId, request.id),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Join request approved.')
      await invalidate()
    },
    onError: (error) => {
      setActionError(
        error instanceof ApiError ? error.message : 'Failed to approve request',
      )
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectJoinRequest(eventId, request.id),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Join request rejected.')
      await queryClient.invalidateQueries({ queryKey: eventKeys.joinRequests(eventId) })
    },
    onError: (error) => {
      setActionError(
        error instanceof ApiError ? error.message : 'Failed to reject request',
      )
    },
  })

  const isPending = approveMutation.isPending || rejectMutation.isPending
  const displayName = request.user.displayName ?? 'No display name'

  return (
    <Card
      as="li"
      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={request.user.avatarUrl} size="md" />

        <div className="min-w-0">
          <p className="truncate font-medium">{displayName}</p>
          <p className="truncate text-sm text-text-secondary">{request.user.phone}</p>
          <p className="mt-1 text-xs text-text-muted">
            Requested {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isPending}
          loading={approveMutation.isPending}
          onClick={() => approveMutation.mutate()}
        >
          <Icon icon={Check} size={20} aria-hidden />
          {approveMutation.isPending ? 'Approving…' : 'Approve'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          loading={rejectMutation.isPending}
          onClick={() => rejectMutation.mutate()}
        >
          <Icon icon={X} size={20} aria-hidden />
          {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
        </Button>
      </div>

      {actionError && <p className="w-full text-sm text-error-text">{actionError}</p>}
    </Card>
  )
}
