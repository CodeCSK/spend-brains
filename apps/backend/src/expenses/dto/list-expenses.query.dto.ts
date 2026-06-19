import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum ExpenseSortField {
  ExpenseDate = 'expenseDate',
  Amount = 'amount',
  CreatedAt = 'createdAt',
  Description = 'description',
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class ListExpensesQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: ExpenseSortField, default: ExpenseSortField.ExpenseDate })
  @IsOptional()
  @IsEnum(ExpenseSortField)
  sort: ExpenseSortField = ExpenseSortField.ExpenseDate;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.Desc })
  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.Desc;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paidBy?: string;

  @ApiPropertyOptional({ format: 'date', description: 'Inclusive lower bound' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ format: 'date', description: 'Inclusive upper bound' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive description search' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  search?: string;
}
