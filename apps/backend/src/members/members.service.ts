import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AddMemberDto, UpdateMemberRoleDto } from './dto/member-request.dto';
import type { MemberDto } from './dto/member-response.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(eventId: string): Promise<MemberDto[]> {
    const members = await this.prisma.eventMember.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true, phone: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => this.toMemberDto(m));
  }

  async add(eventId: string, dto: AddMemberDto): Promise<MemberDto> {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      select: { id: true, displayName: true, avatarUrl: true, phone: true },
    });
    if (!user) {
      throw new NotFoundException('No Spendbrains user found with that phone number');
    }

    const existing = await this.prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId, userId: user.id } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this event');
    }

    const member = await this.prisma.eventMember.create({
      data: { eventId, userId: user.id, role: MemberRole.member },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true, phone: true },
        },
      },
    });
    return this.toMemberDto(member);
  }

  async updateRole(
    eventId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<MemberDto> {
    const member = await this.getMember(eventId, targetUserId);
    if (member.role === MemberRole.captain) {
      throw new BadRequestException("The captain's role cannot be changed");
    }

    const updated = await this.prisma.eventMember.update({
      where: { eventId_userId: { eventId, userId: targetUserId } },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true, phone: true },
        },
      },
    });
    return this.toMemberDto(updated);
  }

  async remove(eventId: string, targetUserId: string): Promise<void> {
    const member = await this.getMember(eventId, targetUserId);
    if (member.role === MemberRole.captain) {
      throw new BadRequestException('The captain cannot be removed');
    }
    await this.prisma.eventMember.delete({
      where: { eventId_userId: { eventId, userId: targetUserId } },
    });
  }

  private async getMember(eventId: string, userId: string) {
    const member = await this.prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { role: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found in this event');
    }
    return member;
  }

  private toMemberDto(member: {
    role: MemberRole;
    createdAt: Date;
    user: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
      phone: string;
    };
  }): MemberDto {
    return {
      userId: member.user.id,
      role: member.role,
      displayName: member.user.displayName,
      avatarUrl: member.user.avatarUrl,
      phone: member.user.phone,
      joinedAt: member.createdAt,
    };
  }
}
