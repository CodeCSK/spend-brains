import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trimOrNull = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const t = value.trim();
  return t === '' ? null : t;
};

export class CreateExpenseDto {
  @ApiProperty({ maxLength: 500, example: 'Dinner at beach shack' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 1200, description: 'Amount in INR, up to 2 decimals' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  amount!: number;

  @ApiProperty({ description: 'Member (userId) who paid upfront' })
  @IsUUID()
  paidBy!: string;

  @ApiProperty({
    type: [String],
    description: 'Member userIds the cost is split equally among',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  sharedAmong!: string[];

  @ApiProperty({ format: 'date', example: '2026-07-02' })
  @IsDateString()
  expenseDate!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
