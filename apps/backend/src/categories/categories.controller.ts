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
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category-request.dto';
import { CategoryDto } from './dto/category-response.dto';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(EventMemberGuard, RolesGuard)
@Controller('v1/events/:eventId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List expense categories for an event' })
  @ApiOkResponse({ type: [CategoryDto] })
  list(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.categoriesService.list(eventId);
  }

  @Post()
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Add a category (captain / vice-captain)' })
  @ApiOkResponse({ type: CategoryDto })
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(eventId, dto);
  }

  @Patch(':categoryId')
  @Roles(MemberRole.captain, MemberRole.vice_captain)
  @ApiOperation({ summary: 'Update a category (captain / vice-captain)' })
  @ApiOkResponse({ type: CategoryDto })
  update(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(eventId, categoryId, dto);
  }

  @Delete(':categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(MemberRole.captain)
  @ApiOperation({ summary: 'Delete an unused category (captain only)' })
  async remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ) {
    await this.categoriesService.remove(eventId, categoryId);
  }
}
