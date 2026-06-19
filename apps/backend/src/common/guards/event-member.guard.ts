import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveEventId } from '../ids/resolve-event-id';
import type { RequestUser } from '../../auth/types/request-user';
import type { EventMembership } from './event-membership.types';

interface MembershipRequest {
  user?: RequestUser;
  params: Record<string, string | undefined>;
  eventMembership?: EventMembership;
}

/**
 * Ensures the current user is a member of the event referenced in the route
 * (`:eventId` for nested resources, `:id` on the events controller) and
 * attaches the membership to the request for `@EventMember()` / RolesGuard.
 */
@Injectable()
export class EventMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MembershipRequest>();
    const userId = request.user?.id;
    const eventRef = request.params.eventId ?? request.params.id;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }
    if (!eventRef) {
      throw new NotFoundException('Event not found');
    }

    const eventId = await resolveEventId(this.prisma, eventRef);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const membership = await this.prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { role: true },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this event');
    }

    request.eventMembership = { eventId, userId, role: membership.role };
    return true;
  }
}
