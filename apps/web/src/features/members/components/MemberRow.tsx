import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Avatar, Select } from '../../../components/ui'
import { ApiError, removeMember, updateMemberRole } from '../../../lib/api'
import { useConfirm } from '../../../lib/store/useConfirm'
import { useToast } from '../../../lib/store/useToast'
import { eventKeys, memberKeys } from '../../../lib/query-keys'
import type { MemberRole } from '../../../types/event'
import type { Member } from '../../../types/member'
import { EventRoleBadge } from '../../events/components/EventRoleBadge'
import { MEMBER_ROLE_LABELS } from '../../events/lib/event-labels'

type MemberRowProps = {
  eventId: string
  member: Member
  canChangeRole: boolean
  canRemove: boolean
}

const ASSIGNABLE_ROLES = ['vice_captain', 'member'] as const satisfies readonly MemberRole[]

export function MemberRow({ eventId, member, canChangeRole, canRemove }: MemberRowProps) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const invalidateMembers = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: memberKeys.list(eventId) }),
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
    ])
  }

  const roleMutation = useMutation({
    mutationFn: (role: (typeof ASSIGNABLE_ROLES)[number]) =>
      updateMemberRole(eventId, member.userId, { role }),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Role updated.')
      await invalidateMembers()
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to update role')
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => removeMember(eventId, member.userId),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Member removed.')
      await invalidateMembers()
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to remove member')
    },
  })

  const displayName = member.displayName ?? 'No display name'
  const isUpdating = roleMutation.isPending || removeMutation.isPending
  const showActions = canChangeRole || canRemove

  async function handleRemove() {
    const label = member.displayName ?? member.phone
    const confirmed = await confirm({
      title: 'Remove member',
      message: `Remove ${label} from this event? They will lose access to expenses and settlements.`,
      confirmLabel: 'Remove',
      destructive: true,
    })
    if (confirmed) {
      removeMutation.mutate()
    }
  }

  return (
    <li className="xp-compact-list-row">
      <Avatar src={member.avatarUrl} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium">{displayName}</p>
          {!canChangeRole && (
            <EventRoleBadge role={member.role} className="px-1.5 py-0 text-[10px]" />
          )}
        </div>
        <p className="truncate text-xs text-text-muted">{member.phone}</p>
        {actionError && <p className="mt-0.5 text-xs text-error-text">{actionError}</p>}
      </div>

      {showActions && (
        <div className="flex shrink-0 items-center gap-1">
          {canChangeRole && (
            <>
              <label htmlFor={`role-${member.userId}`} className="sr-only">
                Role for {displayName}
              </label>
              <Select
                id={`role-${member.userId}`}
                sizeVariant="compact"
                wrapperClassName="w-[6.75rem] shrink-0 sm:w-[7.25rem]"
                value={member.role}
                disabled={isUpdating}
                onChange={(event) => {
                  const role = event.target.value as (typeof ASSIGNABLE_ROLES)[number]
                  if (role !== member.role) {
                    roleMutation.mutate(role)
                  }
                }}
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {MEMBER_ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </>
          )}

          {canRemove && (
            <button
              type="button"
              className="xp-icon-btn-sm-danger"
              aria-label={`Remove ${displayName}`}
              disabled={isUpdating}
              onClick={handleRemove}
            >
              <Icon icon={Trash2} size={16} aria-hidden />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
