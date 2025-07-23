import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserPreferencesService } from './user-preferences.service';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/database/entities/user.entity';
import { UpdateUserPreferenceDto, UserPreferenceResponseDto } from './dto';
import { Auth } from '@/auth/decorators';

@ApiTags('User Preferences')
@Controller('user-preferences')
@Auth()
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all user preferences' })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
    type: [UserPreferenceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPreferences(
    @GetUser() user: User,
  ): Promise<UserPreferenceResponseDto[]> {
    const preferences = await this.userPreferencesService.getUserPreferences(
      user.id,
    );
    return UserPreferenceResponseDto.fromEntities(preferences);
  }

  @Put(':categoryId')
  @ApiOperation({ summary: 'Update user preference for a specific category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID', type: 'number' })
  @ApiBody({ type: UpdateUserPreferenceDto })
  @ApiResponse({
    status: 200,
    description: 'User preference updated successfully',
    type: UserPreferenceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  async updatePreference(
    @GetUser() user: User,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() updateDto: UpdateUserPreferenceDto,
  ): Promise<UserPreferenceResponseDto> {
    const preference = await this.userPreferencesService.updatePreference(
      user.id,
      categoryId,
      updateDto,
    );
    return UserPreferenceResponseDto.fromEntity(preference);
  }
}
