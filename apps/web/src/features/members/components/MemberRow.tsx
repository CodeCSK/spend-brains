import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Avatar, Button, Card, Select } from '../../../components/ui'
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
    <Card
      as="li"
      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={member.avatarUrl} size="md" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">{displayName}</p>
            <EventRoleBadge role={member.role} />
          </div>
          <p className="truncate text-sm text-text-secondary">{member.phone}</p>
        </div>
      </div>

      {(canChangeRole || canRemove) && (
        <div className="flex flex-col gap-2 sm:items-end">
          {canChangeRole && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={`role-${member.userId}`} className="sr-only">
                Role for {displayName}
              </label>
              <Select
                id={`role-${member.userId}`}
                className="w-full min-w-40 py-2 sm:w-auto"
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
            </div>
          )}

          {canRemove && (
            <Button
              type="button"
              variant="destructive"
              disabled={isUpdating}
              loading={removeMutation.isPending}
              onClick={handleRemove}
              aria-label={`Remove ${displayName}`}
            >
              <Icon icon={Trash2} size={20} aria-hidden />
              Remove
            </Button>
          )}
        </div>
      )}

      {actionError && <p className="w-full text-sm text-error-text sm:col-span-2">{actionError}</p>}
    </Card>
  )
}
