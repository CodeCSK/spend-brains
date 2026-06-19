import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '@prisma/client';

export const ROLES_KEY = 'eventRoles';

/**
 * Restrict a route to the given event roles. Requires EventMemberGuard to run
 * first (it attaches the membership) and RolesGuard to enforce.
 */
export const Roles = (...roles: MemberRole[]) => SetMetadata(ROLES_KEY, roles);
