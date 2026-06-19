import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JoinRequestStatus } from '@prisma/client';

export class JoinRequestUserDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) displayName!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty() phone!: string;
}

export class JoinRequestDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: JoinRequestStatus }) status!: JoinRequestStatus;
  @ApiProperty({ type: JoinRequestUserDto }) user!: JoinRequestUserDto;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}
