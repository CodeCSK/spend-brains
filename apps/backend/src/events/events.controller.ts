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
import { MemberRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventMember } from '../common/decorators/event-member.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { EventMemberGuard } from '../common/guards/event-member.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { EventMembership } from '../common/guards/event-membership.types';
import type { RequestUser } from '../auth/types/request-user';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events.query.dto';
import {
  EventDto,
  EventLookupDto,
  JoinEventResultDto,
} from './dto/event-response.dto';
import { JoinRequestDto } from './dto/join-request-response.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event (creator becomes captain)' })
  @ApiOkResponse({ type: EventDto })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List events the current user belongs to' })
  @ApiOkResponse({ type: [EventDto] })
  list(@CurrentUser() user: RequestUser, @Query() query: ListEventsQueryDto) {
    return this.eventsService.list(user.id, query.archived);
  }

  @Get('lookup/:publicId')
  @ApiOperation({ summary: 'Preview an event by its public join code' })
  @ApiOkResponse({ type: EventLookupDto })
  lookup(@Param('publicId') publicId: string) {
    return this.eventsService.lookup(publicId);
  }

  @Post('join/:publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join (public) or request to join (private) an event' })
  @ApiOkResponse({ type: JoinEventResultDto })
  join(@CurrentUser() user: RequestUser, @Param('publicId') publicId: string) {
    return this.eventsService.join(user.id, publicId);
  }

  @Get(':id')
  @UseGuards(EventMemberGuard)
  @ApiOperation({ summary: 'Get event detail with current role and member count' })
  @ApiOkResponse({ type: EventDto })
  getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @EventMember() membership: EventMembership,
  ) {
    return this.eventsService.getDetail(id, membership.role);
  }

  @Patch(':id')
  @UseGuards(EventMemberGuard, RolesGuard)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Update an event (captain / vice-captain)' })
  @ApiOkResponse({ type: EventDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @EventMember() membership: EventMembership,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, membership.role, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(EventMemberGuard, RolesGuard)
  @Roles(MemberRole.captain)
  @ApiOperation({ summary: 'Delete an event (captain only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.eventsService.remove(id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EventMemberGuard, RolesGuard)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Archive an event (captain / vice-captain)' })
  @ApiOkResponse({ type: EventDto })
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @EventMember() membership: EventMembership,
  ) {
    return this.eventsService.setArchived(id, membership.role, true);
  }

  @Post(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EventMemberGuard, RolesGuard)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Unarchive an event (captain / vice-captain)' })
  @ApiOkResponse({ type: EventDto })
  unarchive(
    @Param('id', ParseUUIDPipe) id: string,
    @EventMember() membership: EventMembership,
  ) {
    return this.eventsService.setArchived(id, membership.role, false);
  }

  @Get(':id/join-requests')
  @UseGuards(EventMemberGuard, RolesGuard)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'List pending join requests (captain / vice-captain)' })
  @ApiOkResponse({ type: [JoinRequestDto] })
  listJoinRequests(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.listJoinRequests(id);
  }

  @Post(':id/join-requests/:requestId/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EventMemberGuard, RolesGuard)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Approve a join request (captain / vice-captain)' })
  approveJoinRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.eventsService.approveJoinRequest(id, requestId, user.id);
  }

  @Post(':id/join-requests/:requestId/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EventMemberGuard, RolesGuard)
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Reject a join request (captain / vice-captain)' })
  rejectJoinRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.eventsService.rejectJoinRequest(id, requestId, user.id);
  }
}
