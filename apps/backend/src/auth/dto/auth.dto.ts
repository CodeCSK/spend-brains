import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  INDIAN_PHONE_E164_REGEX,
  normalizeIndianPhone,
} from '../../common/phone/normalize-indian-phone';

export enum AuthClient {
  Web = 'web',
  Mobile = 'mobile',
}

function transformPhone({ value }: { value: string }) {
  return typeof value === 'string' ? normalizeIndianPhone(value) : value;
}

export class SendOtpDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'Indian mobile: +91XXXXXXXXXX, 91XXXXXXXXXX, or 10 digits',
  })
  @Transform(transformPhone)
  @IsString()
  @Matches(INDIAN_PHONE_E164_REGEX, {
    message: 'phone must be a valid Indian mobile number',
  })
  phone!: string;

  @ApiProperty({
    description: 'User must accept OTP / privacy terms before SMS is sent (DPDP)',
    example: true,
  })
  @IsBoolean()
  @Equals(true, { message: 'otpConsent must be true to send OTP' })
  otpConsent!: boolean;

  @ApiPropertyOptional({
    enum: AuthClient,
    default: AuthClient.Web,
    description: 'Web clients must pass captchaToken when Turnstile is enabled',
  })
  @IsEnum(AuthClient)
  client: AuthClient = AuthClient.Web;

  @ApiPropertyOptional({
    description: 'Cloudflare Turnstile token — required for web when Turnstile is enabled',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  captchaToken?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @Transform(transformPhone)
  @IsString()
  @Matches(INDIAN_PHONE_E164_REGEX, {
    message: 'phone must be a valid Indian mobile number',
  })
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'otp must be a 6-digit code' })
  otp!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
