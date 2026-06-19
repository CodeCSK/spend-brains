import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType, EventVisibility, MemberRole } from '@prisma/client';

export class EventDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'AB23CD45' }) publicId!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true }) location!: string | null;
  @ApiProperty({ format: 'date' }) startDate!: string;
  @ApiProperty({ format: 'date' }) endDate!: string;
  @ApiProperty({ enum: EventType }) eventType!: EventType;
  @ApiPropertyOptional({ nullable: true }) coverImageUrl!: string | null;
  @ApiProperty({ enum: EventVisibility }) visibility!: EventVisibility;
  @ApiProperty() isArchived!: boolean;
  @ApiProperty() captainId!: string;
  @ApiProperty({ enum: MemberRole }) myRole!: MemberRole;
  @ApiProperty() memberCount!: number;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}

export class EventLookupDto {
  @ApiProperty() publicId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: EventType }) eventType!: EventType;
  @ApiPropertyOptional({ nullable: true }) coverImageUrl!: string | null;
  @ApiProperty({ enum: EventVisibility }) visibility!: EventVisibility;
  @ApiProperty({ format: 'date' }) startDate!: string;
  @ApiProperty({ format: 'date' }) endDate!: string;
  @ApiProperty() memberCount!: number;
}

export class JoinEventResultDto {
  @ApiProperty({
    enum: ['joined', 'requested'],
    description: '`joined` for public events, `requested` for private events',
  })
  status!: 'joined' | 'requested';

  @ApiProperty() message!: string;

  @ApiPropertyOptional({ nullable: true, description: 'Event id when joined' })
  eventId!: string | null;
}
