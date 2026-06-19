import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  MemberBalanceDto,
  SettlementLineDto,
  SettlementSummaryDto,
} from './dto/settlement-response.dto';
import { SettlementExportFormat } from './dto/export-query.dto';
import {
  buildSettlementPdf,
  buildSettlementSvg,
  type SettlementExportData,
} from './export/settlement-export.util';

export interface SettlementExportResult {
  body: Buffer | string;
  contentType: string;
  filename: string;
}

interface MemberBalancePaise {
  userId: string;
  paid: number;
  share: number;
  net: number;
}

interface ComputedLine {
  fromUserId: string;
  toUserId: string;
  amountPaise: number;
}

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recomputes the settlement graph for an event from current expenses.
   *
   * Behaviour when expenses change: lines are fully regenerated and any
   * previous `is_settled` marks are cleared — the captain / vice-captain must
   * re-mark settled lines after expenses change. `computation_version` is
   * bumped on every recompute so clients can detect a changed graph.
   *
   * Accepts an optional transaction client so callers (expense create/update/
   * delete) can recompute atomically within their own transaction.
   */
  async recompute(
    eventId: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    const balances = await this.computeBalancesPaise(eventId, client);
    const lines = this.matchPayments(balances);

    const previous = await client.settlementLine.aggregate({
      where: { eventId },
      _max: { computationVersion: true },
    });
    const nextVersion = (previous._max.computationVersion ?? 0) + 1;

    await client.settlementLine.deleteMany({ where: { eventId } });
    if (lines.length > 0) {
      await client.settlementLine.createMany({
        data: lines.map((line) => ({
          eventId,
          fromUserId: line.fromUserId,
          toUserId: line.toUserId,
          amount: this.paiseToDecimal(line.amountPaise),
          computationVersion: nextVersion,
        })),
      });
    }
  }

  async getSummary(eventId: string): Promise<SettlementSummaryDto> {
    const [balances, lines, totalSpentAgg] = await Promise.all([
      this.getMemberBalances(eventId),
      this.prisma.settlementLine.findMany({
        where: { eventId },
        include: {
          fromUser: { select: { displayName: true } },
          toUser: { select: { displayName: true } },
        },
        orderBy: { amount: 'desc' },
      }),
      this.prisma.expense.aggregate({
        where: { eventId },
        _sum: { amount: true },
      }),
    ]);

    const totalSpentPaise = this.decimalToPaise(totalSpentAgg._sum.amount);
    let settledPaise = 0;
    let outstandingPaise = 0;
    let settledCount = 0;

    const lineDtos: SettlementLineDto[] = lines.map((line) => {
      const amountPaise = this.decimalToPaise(line.amount);
      if (line.isSettled) {
        settledPaise += amountPaise;
        settledCount += 1;
      } else {
        outstandingPaise += amountPaise;
      }
      return {
        id: line.id,
        fromUserId: line.fromUserId,
        fromDisplayName: line.fromUser.displayName,
        toUserId: line.toUserId,
        toDisplayName: line.toUser.displayName,
        amount: this.paiseToString(amountPaise),
        isSettled: line.isSettled,
        settledBy: line.settledBy,
        settledAt: line.settledAt,
      };
    });

    const totalCount = lines.length;
    let status: 'unsettled' | 'partial' | 'settled';
    if (totalCount === 0 || settledCount === totalCount) {
      status = 'settled';
    } else if (settledCount === 0) {
      status = 'unsettled';
    } else {
      status = 'partial';
    }

    return {
      totalSpent: this.paiseToString(totalSpentPaise),
      settledAmount: this.paiseToString(settledPaise),
      outstandingAmount: this.paiseToString(outstandingPaise),
      status,
      settledCount,
      totalCount,
      lines: lineDtos,
      balances,
    };
  }

  async getMemberBalances(eventId: string): Promise<MemberBalanceDto[]> {
    const balances = await this.computeBalancesPaise(eventId, this.prisma);
    const members = await this.prisma.eventMember.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => {
      const b = balances.find((x) => x.userId === m.userId);
      const paid = b?.paid ?? 0;
      const share = b?.share ?? 0;
      return {
        userId: m.userId,
        displayName: m.user.displayName,
        avatarUrl: m.user.avatarUrl,
        totalPaid: this.paiseToString(paid),
        totalShare: this.paiseToString(share),
        netBalance: this.paiseToString(paid - share),
      };
    });
  }

  async markSettled(
    eventId: string,
    lineId: string,
    userId: string,
  ): Promise<SettlementLineDto> {
    const line = await this.getLine(eventId, lineId);
    if (line.isSettled) {
      throw new ConflictException('Settlement line is already settled');
    }
    const updated = await this.prisma.settlementLine.update({
      where: { id: lineId },
      data: { isSettled: true, settledBy: userId, settledAt: new Date() },
      include: {
        fromUser: { select: { displayName: true } },
        toUser: { select: { displayName: true } },
      },
    });
    return this.toLineDto(updated);
  }

  async unsettle(eventId: string, lineId: string): Promise<SettlementLineDto> {
    const line = await this.getLine(eventId, lineId);
    if (!line.isSettled) {
      throw new ConflictException('Settlement line is not settled');
    }
    const updated = await this.prisma.settlementLine.update({
      where: { id: lineId },
      data: { isSettled: false, settledBy: null, settledAt: null },
      include: {
        fromUser: { select: { displayName: true } },
        toUser: { select: { displayName: true } },
      },
    });
    return this.toLineDto(updated);
  }

  async exportSettlement(
    eventId: string,
    format: SettlementExportFormat,
  ): Promise<SettlementExportResult> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { name: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const summary = await this.getSummary(eventId);
    const data: SettlementExportData = {
      eventName: event.name,
      generatedAt: new Date(),
      statusLabel: summary.status,
      totalSpent: summary.totalSpent,
      settledAmount: summary.settledAmount,
      outstandingAmount: summary.outstandingAmount,
      balances: summary.balances.map((b) => ({
        name: b.displayName ?? 'Member',
        net: b.netBalance,
      })),
      lines: summary.lines.map((l) => ({
        text: `${l.fromDisplayName ?? 'Member'} pays ${l.toDisplayName ?? 'Member'} Rs. ${l.amount}`,
        settled: l.isSettled,
      })),
    };

    if (format === SettlementExportFormat.Image) {
      return {
        body: buildSettlementSvg(data),
        contentType: 'image/svg+xml',
        filename: 'settlement.svg',
      };
    }
    return {
      body: buildSettlementPdf(data),
      contentType: 'application/pdf',
      filename: 'settlement.pdf',
    };
  }

  private async getLine(eventId: string, lineId: string) {
    const line = await this.prisma.settlementLine.findUnique({
      where: { id: lineId },
      select: { id: true, eventId: true, isSettled: true },
    });
    if (!line || line.eventId !== eventId) {
      throw new NotFoundException('Settlement line not found in this event');
    }
    return line;
  }

  /** Net balance per member, in integer paise (paid − share). */
  private async computeBalancesPaise(
    eventId: string,
    client: Prisma.TransactionClient | PrismaService,
  ): Promise<MemberBalancePaise[]> {
    const [members, paidGroups, shareRows] = await Promise.all([
      client.eventMember.findMany({
        where: { eventId },
        select: { userId: true },
      }),
      client.expense.groupBy({
        by: ['paidBy'],
        where: { eventId },
        _sum: { amount: true },
      }),
      client.expenseShare.findMany({
        where: { expense: { eventId } },
        select: { userId: true, amount: true },
      }),
    ]);

    const paidByUser = new Map<string, number>();
    for (const g of paidGroups) {
      paidByUser.set(g.paidBy, this.decimalToPaise(g._sum.amount));
    }

    const shareByUser = new Map<string, number>();
    for (const row of shareRows) {
      shareByUser.set(
        row.userId,
        (shareByUser.get(row.userId) ?? 0) + this.decimalToPaise(row.amount),
      );
    }

    return members.map((m) => {
      const paid = paidByUser.get(m.userId) ?? 0;
      const share = shareByUser.get(m.userId) ?? 0;
      return { userId: m.userId, paid, share, net: paid - share };
    });
  }

  /**
   * Greedy minimum-payment matching: repeatedly settle the largest debtor
   * against the largest creditor. Produces at most (n − 1) lines.
   */
  private matchPayments(balances: MemberBalancePaise[]): ComputedLine[] {
    const debtors = balances
      .filter((b) => b.net < 0)
      .map((b) => ({ userId: b.userId, amount: -b.net }))
      .sort((a, b) => b.amount - a.amount);
    const creditors = balances
      .filter((b) => b.net > 0)
      .map((b) => ({ userId: b.userId, amount: b.net }))
      .sort((a, b) => b.amount - a.amount);

    const lines: ComputedLine[] = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const transfer = Math.min(debtor.amount, creditor.amount);
      if (transfer > 0) {
        lines.push({
          fromUserId: debtor.userId,
          toUserId: creditor.userId,
          amountPaise: transfer,
        });
      }
      debtor.amount -= transfer;
      creditor.amount -= transfer;
      if (debtor.amount === 0) i += 1;
      if (creditor.amount === 0) j += 1;
    }
    return lines;
  }

  private decimalToPaise(value: Prisma.Decimal | null | undefined): number {
    if (!value) return 0;
    return Math.round(Number(value) * 100);
  }

  private paiseToDecimal(paise: number): Prisma.Decimal {
    return new Prisma.Decimal(paise).dividedBy(100);
  }

  private paiseToString(paise: number): string {
    return (paise / 100).toFixed(2);
  }

  private toLineDto(line: {
    id: string;
    fromUserId: string;
    toUserId: string;
    amount: Prisma.Decimal;
    isSettled: boolean;
    settledBy: string | null;
    settledAt: Date | null;
    fromUser: { displayName: string | null };
    toUser: { displayName: string | null };
  }): SettlementLineDto {
    return {
      id: line.id,
      fromUserId: line.fromUserId,
      fromDisplayName: line.fromUser.displayName,
      toUserId: line.toUserId,
      toDisplayName: line.toUser.displayName,
      amount: this.paiseToString(this.decimalToPaise(line.amount)),
      isSettled: line.isSettled,
      settledBy: line.settledBy,
      settledAt: line.settledAt,
    };
  }
}
