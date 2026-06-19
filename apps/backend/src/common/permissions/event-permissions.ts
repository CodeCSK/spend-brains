import { MemberRole } from '@prisma/client';

/**
 * Central authorization rules for events, derived from the app-story role
 * matrix. Keep all role logic here so controllers/services stay declarative.
 *
 * | Action            | Captain | Vice-captain | Member        |
 * |-------------------|---------|--------------|---------------|
 * | Delete event      | yes     | no           | no            |
 * | Edit event        | yes     | yes          | no            |
 * | Archive event     | yes     | yes          | no            |
 * | Manage members    | add/edit| add/edit     | no (remove=captain only) |
 * | Add/edit category | yes     | yes          | no            |
 * | Delete category   | yes     | no           | no            |
 * | Add expense       | yes     | yes          | yes           |
 * | Edit expense      | any     | any          | own only      |
 * | Delete expense    | any     | own only     | own only      |
 * | Mark settled      | yes     | yes          | no            |
 */

export function isCaptain(role: MemberRole): boolean {
  return role === MemberRole.captain;
}

export function isViceCaptain(role: MemberRole): boolean {
  return role === MemberRole.vice_captain;
}

/** Captain or vice-captain — the "manager" tier for non-destructive admin. */
export function isManager(role: MemberRole): boolean {
  return role === MemberRole.captain || role === MemberRole.vice_captain;
}

export function canEditEvent(role: MemberRole): boolean {
  return isManager(role);
}

export function canDeleteEvent(role: MemberRole): boolean {
  return isCaptain(role);
}

export function canArchiveEvent(role: MemberRole): boolean {
  return isManager(role);
}

export function canManageMembers(role: MemberRole): boolean {
  return isManager(role);
}

export function canRemoveMember(role: MemberRole): boolean {
  return isCaptain(role);
}

export function canAssignRoles(role: MemberRole): boolean {
  return isCaptain(role);
}

export function canApproveJoinRequests(role: MemberRole): boolean {
  return isManager(role);
}

export function canManageCategories(role: MemberRole): boolean {
  return isManager(role);
}

export function canDeleteCategory(role: MemberRole): boolean {
  return isCaptain(role);
}

export function canEditExpense(role: MemberRole, isOwner: boolean): boolean {
  return isManager(role) || isOwner;
}

export function canDeleteExpense(role: MemberRole, isOwner: boolean): boolean {
  return isCaptain(role) || isOwner;
}

export function canManageSettlements(role: MemberRole): boolean {
  return isManager(role);
}
