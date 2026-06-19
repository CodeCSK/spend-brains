import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MemberBalanceDto {
  @ApiProperty() userId!: string;
  @ApiPropertyOptional({ nullable: true }) displayName!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty({ example: '1200.00', description: 'Total this member paid' })
  totalPaid!: string;
  @ApiProperty({ example: '400.00', description: "This member's fair share" })
  totalShare!: string;
  @ApiProperty({
    example: '800.00',
    description: 'Positive = owed money, negative = owes money',
  })
  netBalance!: string;
}

export class SettlementLineDto {
  @ApiProperty() id!: string;
  @ApiProperty() fromUserId!: string;
  @ApiPropertyOptional({ nullable: true }) fromDisplayName!: string | null;
  @ApiProperty() toUserId!: string;
  @ApiPropertyOptional({ nullable: true }) toDisplayName!: string | null;
  @ApiProperty({ example: '400.00' }) amount!: string;
  @ApiProperty() isSettled!: boolean;
  @ApiPropertyOptional({ nullable: true }) settledBy!: string | null;
  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  settledAt!: Date | null;
}

export class SettlementSummaryDto {
  @ApiProperty({ example: '3600.00' }) totalSpent!: string;
  @ApiProperty({ example: '400.00' }) settledAmount!: string;
  @ApiProperty({ example: '3200.00' }) outstandingAmount!: string;
  @ApiProperty({ enum: ['unsettled', 'partial', 'settled'] })
  status!: 'unsettled' | 'partial' | 'settled';
  @ApiProperty({ example: 1, description: 'Settled payment lines' })
  settledCount!: number;
  @ApiProperty({ example: 3, description: 'Total payment lines' })
  totalCount!: number;
  @ApiProperty({ type: [SettlementLineDto] }) lines!: SettlementLineDto[];
  @ApiProperty({ type: [MemberBalanceDto] }) balances!: MemberBalanceDto[];
}
