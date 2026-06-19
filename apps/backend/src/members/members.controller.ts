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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { EventMemberGuard } from '../common/guards/event-member.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AddMemberDto, UpdateMemberRoleDto } from './dto/member-request.dto';
import { MemberDto } from './dto/member-response.dto';
import { MembersService } from './members.service';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(EventMemberGuard, RolesGuard)
@Controller('v1/events/:eventId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List members of an event' })
  @ApiOkResponse({ type: [MemberDto] })
  list(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.membersService.list(eventId);
  }

  @Post()
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Add a member by phone (captain / vice-captain)' })
  @ApiOkResponse({ type: MemberDto })
  add(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.membersService.add(eventId, dto);
  }

  @Patch(':userId')
  @Roles(MemberRole.captain)
  @ApiOperation({ summary: 'Change a member role (captain only)' })
  @ApiOkResponse({ type: MemberDto })
  updateRole(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateRole(eventId, userId, dto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(MemberRole.captain)
  @ApiOperation({ summary: 'Remove a member (captain only; not the captain)' })
  async remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.membersService.remove(eventId, userId);
  }
}
