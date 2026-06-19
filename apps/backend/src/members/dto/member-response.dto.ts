import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';

export class MemberDto {
  @ApiProperty() userId!: string;
  @ApiProperty({ enum: MemberRole }) role!: MemberRole;
  @ApiPropertyOptional({ nullable: true }) displayName!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty() phone!: string;
  @ApiProperty({ type: String, format: 'date-time' }) joinedAt!: Date;
}
