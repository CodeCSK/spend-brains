import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { EventMembership } from '../guards/event-membership.types';

/**
 * Reads the current user's verified membership for the event in the route.
 * Only valid on routes protected by EventMemberGuard.
 */
export const EventMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): EventMembership => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ eventMembership: EventMembership }>();
    return request.eventMembership;
  },
);
