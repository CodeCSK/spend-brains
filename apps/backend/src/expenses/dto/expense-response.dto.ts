import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseShareDto {
  @ApiProperty() userId!: string;
  @ApiProperty({ example: '400.00' }) amount!: string;
}

export class ExpenseDto {
  @ApiProperty() id!: string;
  @ApiProperty() eventId!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ example: '1200.00' }) amount!: string;
  @ApiProperty() paidBy!: string;
  @ApiProperty() categoryId!: string;
  @ApiProperty({ format: 'date' }) expenseDate!: string;
  @ApiPropertyOptional({ nullable: true }) notes!: string | null;
  @ApiProperty() createdBy!: string;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: [ExpenseShareDto] }) shares!: ExpenseShareDto[];
}

export class PaginationMetaDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalPages!: number;
}

export class ExpenseListDto {
  @ApiProperty({ type: [ExpenseDto] }) data!: ExpenseDto[];
  @ApiProperty({ type: PaginationMetaDto }) meta!: PaginationMetaDto;
}
