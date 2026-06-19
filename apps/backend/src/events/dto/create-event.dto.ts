import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType, EventVisibility } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

function trimOrNull({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export class CreateEventDto {
  @ApiProperty({ maxLength: 200, example: 'Goa Trip 2026' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ format: 'date', example: '2026-07-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ format: 'date', example: '2026-07-05' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 300 })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(300)
  location?: string | null;

  @ApiPropertyOptional({ enum: EventType, default: EventType.general })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional({
    enum: EventVisibility,
    default: EventVisibility.private,
  })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;
}
