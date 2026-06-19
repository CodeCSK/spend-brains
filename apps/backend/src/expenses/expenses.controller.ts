import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventMember } from '../common/decorators/event-member.decorator';
import { EventMemberGuard } from '../common/guards/event-member.guard';
import type { EventMembership } from '../common/guards/event-membership.types';
import type { RequestUser } from '../auth/types/request-user';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ListExpensesQueryDto } from './dto/list-expenses.query.dto';
import { ExpenseDto, ExpenseListDto } from './dto/expense-response.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(EventMemberGuard)
@Controller('v1/events/:eventId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Add an expense (equal split across members)' })
  @ApiOkResponse({ type: ExpenseDto })
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(eventId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses with filters, sort and pagination' })
  @ApiOkResponse({ type: ExpenseListDto })
  list(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: ListExpensesQueryDto,
  ) {
    return this.expensesService.list(eventId, query);
  }

  @Get(':expenseId')
  @ApiOperation({ summary: 'Get an expense with its shares' })
  @ApiOkResponse({ type: ExpenseDto })
  getOne(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
  ) {
    return this.expensesService.getOne(eventId, expenseId);
  }

  @Patch(':expenseId')
  @ApiOperation({
    summary: 'Update an expense (captain/vice any; member own only)',
  })
  @ApiOkResponse({ type: ExpenseDto })
  update(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @EventMember() membership: EventMembership,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(eventId, expenseId, membership, dto);
  }

  @Delete(':expenseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense (captain or owner only)' })
  async remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @EventMember() membership: EventMembership,
  ) {
    await this.expensesService.remove(eventId, expenseId, membership);
  }
}
