import type { MemberRole } from '../../../types/event'
import type { Member } from '../../../types/member'

const ROLE_SORT_ORDER: Record<MemberRole, number> = {
  captain: 0,
  vice_captain: 1,
  member: 2,
}

export function sortMembers(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const roleDiff = ROLE_SORT_ORDER[a.role] - ROLE_SORT_ORDER[b.role]
    if (roleDiff !== 0) return roleDiff
    const nameA = a.displayName ?? a.phone
    const nameB = b.displayName ?? b.phone
    return nameA.localeCompare(nameB)
  })
}
