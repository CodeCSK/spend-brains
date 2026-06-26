import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

function trimDisplayName({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    nullable: true,
    maxLength: 100,
    example: 'Karthick',
    description: 'Set to null to clear',
  })
  @IsOptional()
  @Transform(trimDisplayName)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  displayName?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'preset:spark',
    description: 'Preset id (preset:spark) or legacy HTTPS URL. Set to null to clear.',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Matches(/^(https?:\/\/[^\s]+|preset:[a-z0-9-]+)$/, {
    message: 'avatarUrl must be a valid URL or preset id (e.g. preset:spark)',
  })
  avatarUrl?: string | null;
}
