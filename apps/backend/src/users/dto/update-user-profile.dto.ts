import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
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
    example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    description: 'Set to null to clear',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string | null;
}
