import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BannedKeywordsService } from './banned-keywords.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { RoleEnum } from '@/common/enums/roles.enum';
import {
  CreateBannedKeywordDto,
  UpdateBannedKeywordDto,
  GetBannedKeywordsQueryDto,
  BannedKeywordResponseDto,
  BannedKeywordListResponseDto,
} from './dto';

@ApiTags('Banned Keywords (Only Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('banned-keywords')
export class BannedKeywordsController {
  constructor(private readonly bannedKeywordsService: BannedKeywordsService) {}

  /**
   * Create a new banned keyword
   */
  @ApiOperation({
    summary: 'Create a new banned keyword',
    description:
      'Add a new keyword to the banned list. Articles containing these keywords will be filtered out during aggregation.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Banned keyword created successfully',
    type: BannedKeywordResponseDto,
    examples: {
      success: {
        summary: 'Successful creation',
        value: {
          id: 123,
          keyword: 'inappropriate-word',
          description: 'This keyword is associated with spam content',
          isActive: true,
          isCaseSensitive: false,
          isRegex: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    examples: {
      invalid_regex: {
        summary: 'Invalid regular expression',
        value: {
          statusCode: 400,
          message: 'Invalid regular expression syntax',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Keyword already exists',
    examples: {
      duplicate_keyword: {
        summary: 'Keyword already banned',
        value: {
          statusCode: 409,
          message: 'Keyword "inappropriate-word" is already banned',
          error: 'Conflict',
        },
      },
    },
  })
  @Post()
  async createBannedKeyword(@Body() createDto: CreateBannedKeywordDto) {
    return this.bannedKeywordsService.createBannedKeyword(createDto);
  }

  /**
   * Get all banned keywords with filtering and pagination
   */
  @ApiOperation({
    summary: 'Get all banned keywords',
    description:
      'Retrieve a paginated list of banned keywords with optional filtering by active status and search term.',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search keywords by partial match',
    example: 'spam',
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
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of banned keywords retrieved successfully',
    type: BannedKeywordListResponseDto,
    examples: {
      success: {
        summary: 'Successful retrieval',
        value: {
          keywords: [
            {
              id: 123,
              keyword: 'inappropriate-word',
              description: 'This keyword is associated with spam content',
              isActive: true,
              isCaseSensitive: false,
              isRegex: false,
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:30:00Z',
            },
          ],
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      },
    },
  })
  @Get()
  async getBannedKeywords(@Query() queryDto: GetBannedKeywordsQueryDto) {
    return this.bannedKeywordsService.getBannedKeywords(queryDto);
  }

  /**
   * Get a specific banned keyword by ID
   */
  @ApiOperation({
    summary: 'Get banned keyword by ID',
    description: 'Retrieve a specific banned keyword by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Banned keyword ID',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banned keyword found',
    type: BannedKeywordResponseDto,
    examples: {
      success: {
        summary: 'Banned keyword found',
        value: {
          id: 123,
          keyword: 'inappropriate-word',
          description: 'This keyword is associated with spam content',
          isActive: true,
          isCaseSensitive: false,
          isRegex: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banned keyword not found',
    examples: {
      not_found: {
        summary: 'Banned keyword not found',
        value: {
          statusCode: 404,
          message: 'Banned keyword with ID 123 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @Get(':id')
  async getBannedKeywordById(@Param('id') id: number) {
    return this.bannedKeywordsService.getBannedKeywordById(id);
  }

  /**
   * Update a banned keyword
   */
  @ApiOperation({
    summary: 'Update a banned keyword',
    description:
      'Update an existing banned keyword. Can modify the keyword text, description, and settings.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Banned keyword ID',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banned keyword updated successfully',
    type: BannedKeywordResponseDto,
    examples: {
      success: {
        summary: 'Successful update',
        value: {
          id: 123,
          keyword: 'updated-word',
          description: 'Updated description',
          isActive: false,
          isCaseSensitive: true,
          isRegex: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T14:45:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    examples: {
      invalid_regex: {
        summary: 'Invalid regular expression',
        value: {
          statusCode: 400,
          message: 'Invalid regular expression syntax',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banned keyword not found',
    examples: {
      not_found: {
        summary: 'Banned keyword not found',
        value: {
          statusCode: 404,
          message: 'Banned keyword with ID 123 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Keyword already exists',
    examples: {
      duplicate_keyword: {
        summary: 'Keyword already exists',
        value: {
          statusCode: 409,
          message: 'Keyword "existing-word" is already banned',
          error: 'Conflict',
        },
      },
    },
  })
  @Put(':id')
  async updateBannedKeyword(
    @Param('id') id: number,
    @Body() updateDto: UpdateBannedKeywordDto,
  ) {
    return this.bannedKeywordsService.updateBannedKeyword(id, updateDto);
  }

  /**
   * Delete a banned keyword
   */
  @ApiOperation({
    summary: 'Delete a banned keyword',
    description: 'Permanently delete a banned keyword from the system.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Banned keyword ID',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Banned keyword deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banned keyword not found',
    examples: {
      not_found: {
        summary: 'Banned keyword not found',
        value: {
          statusCode: 404,
          message: 'Banned keyword with ID 123 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @Delete(':id')
  async deleteBannedKeyword(@Param('id') id: number) {
    await this.bannedKeywordsService.deleteBannedKeyword(id);
  }

  /**
   * Toggle active status of a banned keyword
   */
  @ApiOperation({
    summary: 'Toggle banned keyword active status',
    description:
      'Toggle the active status of a banned keyword. Inactive keywords will not be used for filtering.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Banned keyword ID',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banned keyword status toggled successfully',
    type: BannedKeywordResponseDto,
    examples: {
      success: {
        summary: 'Status toggled successfully',
        value: {
          id: 123,
          keyword: 'inappropriate-word',
          description: 'This keyword is associated with spam content',
          isActive: false,
          isCaseSensitive: false,
          isRegex: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T14:45:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banned keyword not found',
    examples: {
      not_found: {
        summary: 'Banned keyword not found',
        value: {
          statusCode: 404,
          message: 'Banned keyword with ID 123 not found',
          error: 'Not Found',
        },
      },
    },
  })
  @Put(':id/toggle')
  async toggleBannedKeyword(@Param('id') id: number) {
    return this.bannedKeywordsService.toggleBannedKeyword(id);
  }
}
