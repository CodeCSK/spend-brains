import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettlementsService } from '../settlements/settlements.service';
import { canDeleteExpense, canEditExpense } from '../common/permissions/event-permissions';
import type { EventMembership } from '../common/guards/event-membership.types';
import type { CreateExpenseDto } from './dto/create-expense.dto';
import type { UpdateExpenseDto } from './dto/update-expense.dto';
import type { ListExpensesQueryDto } from './dto/list-expenses.query.dto';
import {
  ExpenseDto,
  ExpenseListDto,
} from './dto/expense-response.dto';

type ExpenseWithShares = Prisma.ExpenseGetPayload<{
  include: { shares: { select: { userId: true; amount: true } } };
}>;

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settlements: SettlementsService,
  ) {}

  async create(
    eventId: string,
    userId: string,
    dto: CreateExpenseDto,
  ): Promise<ExpenseDto> {
    await this.assertCategory(eventId, dto.categoryId);
    await this.assertMembers(eventId, [dto.paidBy, ...dto.sharedAmong]);

    const shareAmounts = this.splitEqually(dto.amount, dto.sharedAmong);

    const expense = await this.prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          eventId,
          createdBy: userId,
          description: dto.description,
          amount: new Prisma.Decimal(dto.amount),
          paidBy: dto.paidBy,
          expenseDate: new Date(dto.expenseDate),
          categoryId: dto.categoryId,
          notes: dto.notes ?? null,
          shares: {
            create: dto.sharedAmong.map((shareUserId, index) => ({
              userId: shareUserId,
              amount: shareAmounts[index],
            })),
          },
        },
        include: { shares: { select: { userId: true, amount: true } } },
      });
      await this.settlements.recompute(eventId, tx);
      return created;
    });

    return this.toExpenseDto(expense);
  }

  async list(
    eventId: string,
    query: ListExpensesQueryDto,
  ): Promise<ExpenseListDto> {
    const where: Prisma.ExpenseWhereInput = {
      eventId,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.paidBy && { paidBy: query.paidBy }),
      ...(query.search && {
        description: { contains: query.search, mode: 'insensitive' },
      }),
      ...(this.dateRange(query.dateFrom, query.dateTo) && {
        expenseDate: this.dateRange(query.dateFrom, query.dateTo),
      }),
    };

    const orderBy = {
      [query.sort]: query.order,
    } as Prisma.ExpenseOrderByWithRelationInput;

    const [total, expenses] = await this.prisma.$transaction([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        include: { shares: { select: { userId: true, amount: true } } },
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);

    return {
      data: expenses.map((e) => this.toExpenseDto(e)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async getOne(eventId: string, expenseId: string): Promise<ExpenseDto> {
    const expense = await this.findExpense(eventId, expenseId);
    return this.toExpenseDto(expense);
  }

  async update(
    eventId: string,
    expenseId: string,
    membership: EventMembership,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    const existing = await this.findExpense(eventId, expenseId);
    const isOwner = existing.createdBy === membership.userId;
    if (!canEditExpense(membership.role, isOwner)) {
      throw new ForbiddenException('You can only edit your own expenses');
    }

    if (dto.categoryId) {
      await this.assertCategory(eventId, dto.categoryId);
    }
    const newPaidBy = dto.paidBy ?? existing.paidBy;
    const newSharedAmong =
      dto.sharedAmong ?? existing.shares.map((s) => s.userId);
    if (dto.paidBy || dto.sharedAmong) {
      await this.assertMembers(eventId, [newPaidBy, ...newSharedAmong]);
    }
    const newAmount = dto.amount ?? Number(existing.amount);

    const sharesChanged =
      dto.amount !== undefined || dto.sharedAmong !== undefined;
    const shareAmounts = sharesChanged
      ? this.splitEqually(newAmount, newSharedAmong)
      : [];

    const expense = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.ExpenseUpdateInput = {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: new Prisma.Decimal(dto.amount) }),
        ...(dto.paidBy !== undefined && { payer: { connect: { id: dto.paidBy } } }),
        ...(dto.expenseDate !== undefined && {
          expenseDate: new Date(dto.expenseDate),
        }),
        ...(dto.categoryId !== undefined && {
          category: { connect: { id: dto.categoryId } },
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      };

      await tx.expense.update({ where: { id: expenseId }, data });

      if (sharesChanged) {
        await tx.expenseShare.deleteMany({ where: { expenseId } });
        await tx.expenseShare.createMany({
          data: newSharedAmong.map((shareUserId, index) => ({
            expenseId,
            userId: shareUserId,
            amount: shareAmounts[index],
          })),
        });
      }

      await this.settlements.recompute(eventId, tx);

      return tx.expense.findUniqueOrThrow({
        where: { id: expenseId },
        include: { shares: { select: { userId: true, amount: true } } },
      });
    });

    return this.toExpenseDto(expense);
  }

  async remove(
    eventId: string,
    expenseId: string,
    membership: EventMembership,
  ): Promise<void> {
    const existing = await this.findExpense(eventId, expenseId);
    const isOwner = existing.createdBy === membership.userId;
    if (!canDeleteExpense(membership.role, isOwner)) {
      throw new ForbiddenException(
        'Only the captain or the expense owner can delete this expense',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.expense.delete({ where: { id: expenseId } });
      await this.settlements.recompute(eventId, tx);
    });
  }

  private async findExpense(
    eventId: string,
    expenseId: string,
  ): Promise<ExpenseWithShares> {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: { shares: { select: { userId: true, amount: true } } },
    });
    if (!expense || expense.eventId !== eventId) {
      throw new NotFoundException('Expense not found in this event');
    }
    return expense;
  }

  private async assertCategory(
    eventId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.prisma.eventExpenseCategory.findUnique({
      where: { id: categoryId },
      select: { eventId: true },
    });
    if (!category || category.eventId !== eventId) {
      throw new BadRequestException('Category does not belong to this event');
    }
  }

  private async assertMembers(
    eventId: string,
    userIds: string[],
  ): Promise<void> {
    const unique = [...new Set(userIds)];
    const count = await this.prisma.eventMember.count({
      where: { eventId, userId: { in: unique } },
    });
    if (count !== unique.length) {
      throw new BadRequestException(
        'paidBy and sharedAmong must all be members of this event',
      );
    }
  }

  /**
   * Equal split in integer paise; leftover paise are distributed one each to
   * the first participants so the shares sum exactly to the total.
   */
  private splitEqually(amount: number, participants: string[]): Prisma.Decimal[] {
    const totalPaise = Math.round(amount * 100);
    const n = participants.length;
    const base = Math.floor(totalPaise / n);
    const remainder = totalPaise - base * n;
    return participants.map((_, index) => {
      const paise = base + (index < remainder ? 1 : 0);
      return new Prisma.Decimal(paise).dividedBy(100);
    });
  }

  private dateRange(
    from?: string,
    to?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;
    return {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };
  }

  private toExpenseDto(expense: ExpenseWithShares): ExpenseDto {
    return {
      id: expense.id,
      eventId: expense.eventId,
      description: expense.description,
      amount: Number(expense.amount).toFixed(2),
      paidBy: expense.paidBy,
      categoryId: expense.categoryId,
      expenseDate: expense.expenseDate.toISOString().slice(0, 10),
      notes: expense.notes,
      createdBy: expense.createdBy,
      createdAt: expense.createdAt,
      shares: expense.shares.map((s) => ({
        userId: s.userId,
        amount: Number(s.amount).toFixed(2),
      })),
    };
  }
}
