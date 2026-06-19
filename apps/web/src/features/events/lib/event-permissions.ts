import type { MemberRole } from '../../../types/event'

export function isCaptain(role: MemberRole): boolean {
  return role === 'captain'
}

export function isCaptainOrVice(role: MemberRole): boolean {
  return role === 'captain' || role === 'vice_captain'
}

export type EventPermissions = {
  isCaptain: boolean
  isCaptainOrVice: boolean
  canManageMembers: boolean
  canSettle: boolean
  canArchiveEvent: boolean
  canDeleteEvent: boolean
}

export function getEventPermissions(role: MemberRole): EventPermissions {
  return {
    isCaptain: isCaptain(role),
    isCaptainOrVice: isCaptainOrVice(role),
    canManageMembers: isCaptainOrVice(role),
    canSettle: isCaptainOrVice(role),
    canArchiveEvent: isCaptainOrVice(role),
    canDeleteEvent: isCaptain(role),
  }
}

export function canEditEvent(role: MemberRole): boolean {
  return isCaptainOrVice(role)
}

export function canEditExpense(role: MemberRole, isOwner: boolean): boolean {
  return isCaptainOrVice(role) || isOwner
}

export function canDeleteExpense(role: MemberRole, isOwner: boolean): boolean {
  return isCaptain(role) || isOwner
}
