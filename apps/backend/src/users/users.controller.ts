import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../auth/types/request-user';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  patchMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
