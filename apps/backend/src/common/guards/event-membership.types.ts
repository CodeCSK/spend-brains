import { MemberRole } from '@prisma/client';

/** Attached to the request by EventMemberGuard once membership is verified. */
export interface EventMembership {
  eventId: string;
  userId: string;
  role: MemberRole;
}
