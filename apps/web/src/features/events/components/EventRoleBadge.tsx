import type { MemberRole } from '../../../types/event'
import { MEMBER_ROLE_LABELS } from '../lib/event-labels'
import { Badge } from '../../../components/ui'

type EventRoleBadgeProps = {
  role: MemberRole
  className?: string
}

export function EventRoleBadge({ role, className }: EventRoleBadgeProps) {
  return (
    <Badge variant="role" role={role} className={className}>
      {MEMBER_ROLE_LABELS[role]}
    </Badge>
  )
}
