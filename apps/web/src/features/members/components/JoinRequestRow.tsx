import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Avatar } from '../../../components/ui'
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
    <li className="xp-compact-list-row">
      <Avatar src={request.user.avatarUrl} size="sm" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="truncate text-xs text-text-muted">{request.user.phone}</p>
        {actionError && <p className="mt-0.5 text-xs text-error-text">{actionError}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          className="xp-icon-btn-sm text-primary hover:bg-success-bg hover:text-success-text"
          aria-label={`Approve ${displayName}`}
          disabled={isPending}
          onClick={() => approveMutation.mutate()}
        >
          <Icon icon={Check} size={16} aria-hidden />
        </button>
        <button
          type="button"
          className="xp-icon-btn-sm-danger"
          aria-label={`Reject ${displayName}`}
          disabled={isPending}
          onClick={() => rejectMutation.mutate()}
        >
          <Icon icon={X} size={16} aria-hidden />
        </button>
      </div>
    </li>
  )
}
