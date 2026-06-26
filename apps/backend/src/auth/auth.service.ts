import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import type { User } from '@prisma/client';
import {
  generateOtp,
  generateRefreshToken,
  hashToken,
} from '../common/crypto/hash.util';
import { otpFromPhoneSuffix } from '../common/crypto/otp.util';
import type { JwtConfig, OtpConfig, RootConfig } from '../config';
import { CaptchaService } from '../captcha/captcha.service';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { AuthClient, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import type { TokenResponseDto } from './dto/auth-response.dto';
import type { JwtPayload } from './types/jwt-payload';

const OTP_SEND_MESSAGE = 'If this number is valid, an OTP has been sent.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtConfig: JwtConfig;
  private readonly otpConfig: OtpConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly captchaService: CaptchaService,
    configService: ConfigService<RootConfig, true>,
  ) {
    this.jwtConfig = configService.get('jwt', { infer: true });
    this.otpConfig = configService.get('otp', { infer: true });
  }

  async sendOtp(
    dto: SendOtpDto,
    ipAddress: string,
  ): Promise<{ message: string }> {
    if (dto.client === AuthClient.Web && this.captchaService.isRequired()) {
      await this.captchaService.verify(dto.captchaToken);
    }

    await this.assertOtpRateLimits(dto.phone, ipAddress);

    await this.prisma.otpCode.updateMany({
      where: {
        phone: dto.phone,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });

    const otp = this.createOtpCode(dto.phone);
    const expiresAt = new Date(
      Date.now() + this.otpConfig.ttlMinutes * 60 * 1000,
    );

    const otpRecord = await this.prisma.otpCode.create({
      data: {
        phone: dto.phone,
        codeHash: hashToken(otp),
        expiresAt,
        ipAddress,
      },
    });

    try {
      await this.smsService.sendOtp(dto.phone, otp);
    } catch (error) {
      await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
      this.logger.error('Failed to send OTP SMS', error);
      throw new BadRequestException('Unable to send OTP at this time');
    }

    return { message: OTP_SEND_MESSAGE };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<TokenResponseDto> {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone: dto.phone,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (otpRecord.attempts >= this.otpConfig.maxAttempts) {
      throw new UnauthorizedException('OTP attempts exceeded');
    }

    const otpHash = hashToken(dto.otp);
    if (otpRecord.codeHash !== otpHash) {
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });

    const user = await this.prisma.user.upsert({
      where: { phone: dto.phone },
      create: {
        phone: dto.phone,
        phoneVerifiedAt: new Date(),
      },
      update: {
        phoneVerifiedAt: new Date(),
      },
    });

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out from all devices' };
  }

  private createOtpCode(phone: string): string {
    const fixed = this.otpConfig.fixedCode;
    if (fixed && /^\d{6}$/.test(fixed)) {
      return fixed;
    }
    if (this.otpConfig.usePhoneSuffix) {
      return otpFromPhoneSuffix(phone);
    }
    return generateOtp();
  }

  private async assertOtpRateLimits(phone: string, ipAddress: string) {
    if (this.otpConfig.usePhoneSuffix) {
      return;
    }

    const since = new Date(Date.now() - 60 * 60 * 1000);

    const phoneCount = await this.prisma.otpCode.count({
      where: {
        phone,
        createdAt: { gte: since },
      },
    });

    if (phoneCount >= this.otpConfig.rateLimitPerPhonePerHour) {
      throw new BadRequestException(
        'Too many OTP requests for this number. Try again later.',
      );
    }

    if (ipAddress) {
      const ipCount = await this.prisma.otpCode.count({
        where: {
          ipAddress,
          createdAt: { gte: since },
        },
      });

      if (ipCount >= this.otpConfig.rateLimitPerIpPerHour) {
        throw new BadRequestException(
          'Too many OTP requests. Try again later.',
        );
      }
    }
  }

  private async issueTokens(user: User): Promise<TokenResponseDto> {
    const payload: JwtPayload = { sub: user.id, type: 'access' };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: this.jwtConfig.accessExpiresIn as StringValue,
    });

    const refreshToken = generateRefreshToken();
    const refreshExpiresMs = this.parseDurationMs(
      this.jwtConfig.refreshExpiresIn,
    );
    const expiresAt = new Date(Date.now() + refreshExpiresMs);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseDurationSeconds(this.jwtConfig.accessExpiresIn),
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User) {
    return {
      id: user.id,
      phone: user.phone,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }

  private parseDurationSeconds(value: string): number {
    return Math.floor(this.parseDurationMs(value) / 1000);
  }

  private parseDurationMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
      throw new Error(`Invalid duration format: ${value}`);
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unsupported duration unit: ${unit}`);
    }
  }
}
