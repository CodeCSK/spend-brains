import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '+919876543210' })
  phone!: string;

  @ApiPropertyOptional({ nullable: true })
  displayName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  phoneVerifiedAt!: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
