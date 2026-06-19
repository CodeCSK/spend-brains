import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateCategoryDto {
  @ApiProperty({ maxLength: 50, example: 'Snacks' })
  @Transform(trim)
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ maxLength: 50, example: 'food', description: 'Icon key' })
  @Transform(trim)
  @IsString()
  @MaxLength(50)
  icon!: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(50)
  icon?: string;
}
