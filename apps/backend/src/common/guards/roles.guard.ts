import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { EventMembership } from './event-membership.types';

/**
 * Enforces `@Roles(...)` against the membership attached by EventMemberGuard.
 * Routes without `@Roles()` pass through (membership alone is enough).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ eventMembership?: EventMembership }>();
    const role = request.eventMembership?.role;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
    return true;
  }
}
