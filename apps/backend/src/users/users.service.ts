import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import type { User } from '@prisma/client';
import { normalizeIndianPhone } from '../common/phone/normalize-indian-phone';
import type { RootConfig } from '../config';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import type { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<RootConfig, true>,
  ) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toProfileDto(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    if (dto.displayName === undefined && dto.avatarUrl === undefined) {
      throw new BadRequestException(
        'At least one of displayName or avatarUrl must be provided',
      );
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.displayName !== undefined && { displayName: dto.displayName }),
          ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        },
      });

      return this.toProfileDto(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  private toProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      phone: user.phone,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      phoneVerifiedAt: user.phoneVerifiedAt,
      createdAt: user.createdAt,
      isSuperAdmin: this.isSuperAdminPhone(user.phone),
    };
  }

  private isSuperAdminPhone(phone: string): boolean {
    const allowlist = this.config.get('superAdmin.phones', { infer: true });
    if (allowlist.length === 0) return false;

    const normalized = normalizeIndianPhone(phone);
    return allowlist.some(
      (allowed) => normalizeIndianPhone(allowed) === normalized,
    );
  }
}
