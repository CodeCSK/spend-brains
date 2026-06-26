import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EventType,
  EventVisibility,
  JoinRequestStatus,
  MemberRole,
  Prisma,
} from '@prisma/client';
import type { Event } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  defaultCoverImageFor,
} from '../common/constants/events.constants';
import { generatePublicId } from '../common/ids/public-id';
import type { CreateEventDto } from './dto/create-event.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { EventDto, EventLookupDto } from './dto/event-response.dto';
import type { JoinRequestDto } from './dto/join-request-response.dto';

const MAX_PUBLIC_ID_ATTEMPTS = 5;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto): Promise<EventDto> {
    this.assertDateOrder(dto.startDate, dto.endDate);

    const eventType = dto.eventType ?? EventType.general;
    const publicId = await this.generateUniquePublicId();

    const event = await this.prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          publicId,
          name: dto.name,
          description: dto.description ?? null,
          location: dto.location ?? null,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          eventType,
          coverImageUrl: defaultCoverImageFor(eventType),
          visibility: dto.visibility ?? EventVisibility.private,
          captainId: userId,
          members: {
            create: { userId, role: MemberRole.captain },
          },
          categories: {
            create: DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
              name: c.name,
              icon: c.icon,
              isDefault: true,
            })),
          },
        },
      });
      return created;
    });

    return this.toEventDto(event, MemberRole.captain, 1);
  }

  async list(userId: string, archived?: boolean): Promise<EventDto[]> {
    const events = await this.prisma.event.findMany({
      where: {
        members: { some: { userId } },
        ...(archived !== undefined && { isArchived: archived }),
      },
      include: {
        _count: { select: { members: true } },
        members: { where: { userId }, select: { role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) =>
      this.toEventDto(
        event,
        event.members[0]?.role ?? MemberRole.member,
        event._count.members,
      ),
    );
  }

  async getDetail(eventId: string, role: MemberRole): Promise<EventDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { members: true } } },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return this.toEventDto(event, role, event._count.members);
  }

  async update(
    eventId: string,
    role: MemberRole,
    dto: UpdateEventDto,
  ): Promise<EventDto> {
    const startDate = dto.startDate;
    const endDate = dto.endDate;
    if (startDate || endDate) {
      const existing = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: { startDate: true, endDate: true },
      });
      if (!existing) {
        throw new NotFoundException('Event not found');
      }
      this.assertDateOrder(
        startDate ?? existing.startDate.toISOString(),
        endDate ?? existing.endDate.toISOString(),
      );
    }

    const data: Prisma.EventUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      ...(dto.visibility !== undefined && { visibility: dto.visibility }),
      ...(dto.eventType !== undefined && {
        eventType: dto.eventType,
        coverImageUrl: defaultCoverImageFor(dto.eventType),
      }),
    };

    const event = await this.prisma.event.update({
      where: { id: eventId },
      data,
      include: { _count: { select: { members: true } } },
    });
    return this.toEventDto(event, role, event._count.members);
  }

  async remove(eventId: string): Promise<void> {
    await this.prisma.event.delete({ where: { id: eventId } });
  }

  async setArchived(
    eventId: string,
    role: MemberRole,
    isArchived: boolean,
  ): Promise<EventDto> {
    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: { isArchived },
      include: { _count: { select: { members: true } } },
    });
    return this.toEventDto(event, role, event._count.members);
  }

  async lookup(publicId: string): Promise<EventLookupDto> {
    const event = await this.prisma.event.findUnique({
      where: { publicId },
      include: { _count: { select: { members: true } } },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return {
      publicId: event.publicId,
      name: event.name,
      eventType: event.eventType,
      coverImageUrl: event.coverImageUrl,
      visibility: event.visibility,
      startDate: this.toDateString(event.startDate),
      endDate: this.toDateString(event.endDate),
      memberCount: event._count.members,
    };
  }

  async join(
    userId: string,
    publicId: string,
  ): Promise<{ status: 'joined' | 'requested'; message: string; eventId: string | null }> {
    const event = await this.prisma.event.findUnique({
      where: { publicId },
      select: { id: true, visibility: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existingMember = await this.prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
      select: { id: true },
    });
    if (existingMember) {
      return {
        status: 'joined',
        message: 'You are already a member of this event',
        eventId: event.id,
      };
    }

    if (event.visibility === EventVisibility.public) {
      await this.prisma.eventMember.create({
        data: { eventId: event.id, userId, role: MemberRole.member },
      });
      return {
        status: 'joined',
        message: 'Joined event',
        eventId: event.id,
      };
    }

    const existingRequest = await this.prisma.joinRequest.findFirst({
      where: {
        eventId: event.id,
        userId,
        status: JoinRequestStatus.pending,
      },
      select: { id: true },
    });
    if (!existingRequest) {
      await this.prisma.joinRequest.create({
        data: { eventId: event.id, userId, status: JoinRequestStatus.pending },
      });
    }
    return {
      status: 'requested',
      message: 'Join request submitted for approval',
      eventId: null,
    };
  }

  async listJoinRequests(eventId: string): Promise<JoinRequestDto[]> {
    const requests = await this.prisma.joinRequest.findMany({
      where: { eventId, status: JoinRequestStatus.pending },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true, phone: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return requests.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt,
      user: r.user,
    }));
  }

  async approveJoinRequest(
    eventId: string,
    requestId: string,
    reviewerId: string,
  ): Promise<{ message: string }> {
    const requestRow = await this.getPendingRequest(eventId, requestId);

    await this.prisma.$transaction(async (tx) => {
      await tx.joinRequest.update({
        where: { id: requestRow.id },
        data: {
          status: JoinRequestStatus.approved,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });
      await tx.eventMember.upsert({
        where: {
          eventId_userId: { eventId, userId: requestRow.userId },
        },
        update: {},
        create: { eventId, userId: requestRow.userId, role: MemberRole.member },
      });
    });

    return { message: 'Join request approved' };
  }

  async rejectJoinRequest(
    eventId: string,
    requestId: string,
    reviewerId: string,
  ): Promise<{ message: string }> {
    const requestRow = await this.getPendingRequest(eventId, requestId);
    await this.prisma.joinRequest.update({
      where: { id: requestRow.id },
      data: {
        status: JoinRequestStatus.rejected,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Join request rejected' };
  }

  private async getPendingRequest(eventId: string, requestId: string) {
    const requestRow = await this.prisma.joinRequest.findUnique({
      where: { id: requestId },
      select: { id: true, eventId: true, userId: true, status: true },
    });
    if (!requestRow || requestRow.eventId !== eventId) {
      throw new NotFoundException('Join request not found');
    }
    if (requestRow.status !== JoinRequestStatus.pending) {
      throw new ConflictException('Join request already reviewed');
    }
    return requestRow;
  }

  private async generateUniquePublicId(): Promise<string> {
    for (let attempt = 0; attempt < MAX_PUBLIC_ID_ATTEMPTS; attempt += 1) {
      const candidate = generatePublicId();
      const clash = await this.prisma.event.findUnique({
        where: { publicId: candidate },
        select: { id: true },
      });
      if (!clash) {
        return candidate;
      }
    }
    throw new ConflictException('Could not generate a unique event code');
  }

  private assertDateOrder(start: string, end: string): void {
    if (new Date(end) < new Date(start)) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toEventDto(
    event: Event,
    myRole: MemberRole,
    memberCount: number,
  ): EventDto {
    return {
      id: event.id,
      publicId: event.publicId,
      name: event.name,
      description: event.description,
      location: event.location,
      startDate: this.toDateString(event.startDate),
      endDate: this.toDateString(event.endDate),
      eventType: event.eventType,
      coverImageUrl: event.coverImageUrl,
      visibility: event.visibility,
      isArchived: event.isArchived,
      captainId: event.captainId,
      myRole,
      memberCount,
      createdAt: event.createdAt,
    };
  }
}
