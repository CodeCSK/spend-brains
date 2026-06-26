import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { EventMemberGuard } from '../common/guards/event-member.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../auth/types/request-user';
import { ExportQueryDto } from './dto/export-query.dto';
import {
  MemberBalanceDto,
  SettlementLineDto,
  SettlementSummaryDto,
} from './dto/settlement-response.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('Settlements')
@ApiBearerAuth()
@UseGuards(EventMemberGuard, RolesGuard)
@Controller('v1/events/:eventId')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('summaries')
  @ApiOperation({ summary: 'Per-member spending summary (paid / share / net)' })
  @ApiOkResponse({ type: [MemberBalanceDto] })
  summaries(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.settlementsService.getMemberBalances(eventId);
  }

  @Get('settlements')
  @ApiOperation({ summary: 'Settlement summary and payment lines' })
  @ApiOkResponse({ type: SettlementSummaryDto })
  getSettlements(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.settlementsService.getSummary(eventId);
  }

  @Post('settlements/:lineId/settle')
  @HttpCode(HttpStatus.OK)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({
    summary: 'Mark a payment line settled (captain / vice-captain)',
  })
  @ApiOkResponse({ type: SettlementLineDto })
  settle(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.settlementsService.markSettled(eventId, lineId, user.id);
  }

  @Post('settlements/:lineId/unsettle')
  @HttpCode(HttpStatus.OK)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({
    summary: 'Revert a settled payment line (captain / vice-captain)',
  })
  @ApiOkResponse({ type: SettlementLineDto })
  unsettle(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
  ) {
    return this.settlementsService.unsettle(eventId, lineId);
  }

  @Get('settlements/export')
  @ApiOperation({
    summary: 'Export settlement details as a shareable image (SVG)',
  })
  @ApiProduces('image/svg+xml')
  async export(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.settlementsService.exportSettlement(eventId);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.body);
  }
}
