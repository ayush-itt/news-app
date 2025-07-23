import {
  Controller,
  Get,
  Query,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserReadingHistoryService } from './user-reading-history.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { RoleEnum } from '@/common/enums/roles.enum';
import {
  GetReadingHistoryQueryDto,
  ReadingHistoryListResponseDto,
} from './dto';

@ApiTags('User Reading History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('reading-history')
export class UserReadingHistoryController {
  constructor(
    private readonly readingHistoryService: UserReadingHistoryService,
  ) {}

  @ApiOperation({
    summary: 'Get user reading history',
    description:
      "Retrieve the authenticated user's reading history with optional date filtering and pagination.",
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date filter (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date filter (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reading history retrieved successfully',
    type: ReadingHistoryListResponseDto,
    examples: {
      success: {
        summary: 'Successful retrieval',
        value: {
          history: [
            {
              id: 123,
              userId: 456,
              articleId: 789,
              createdAt: '2024-01-15T10:30:00Z',
              article: {
                id: 789,
                title: 'Tech News Article',
                source: 'Tech Daily',
                publishedAt: '2024-01-15T08:00:00Z',
                categories: [{ id: 1, name: 'Technology' }],
              },
            },
          ],
          total: 150,
          page: 1,
          limit: 20,
          totalPages: 8,
        },
      },
    },
  })
  @Roles(RoleEnum.USER)
  @Get()
  async getReadingHistory(
    @Query() queryDto: GetReadingHistoryQueryDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.readingHistoryService.getUserReadingHistory(userId, queryDto);
  }

  @ApiOperation({
    summary: 'Get all users reading history (admin)',
    description:
      'Retrieve reading history for all users. Only accessible by administrators.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filter by specific user ID',
    example: 123,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date filter (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date filter (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All users reading history retrieved successfully',
    type: ReadingHistoryListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - admin role required',
  })
  @Roles(RoleEnum.ADMIN)
  @Get('admin/all')
  async getAllUsersReadingHistory(
    @Query() queryDto: GetReadingHistoryQueryDto,
  ) {
    return this.readingHistoryService.getAllUsersReadingHistory(queryDto);
  }
}
