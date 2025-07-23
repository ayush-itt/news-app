import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { RoleEnum } from '@/common/enums/roles.enum';
import { ArticleReportService } from './article-report.service';
import { CreateArticleReportDto, GetReportsQueryDto } from './dto';
import {
  ArticleReportResponseDto,
  ReportCountResponseDto,
  PaginatedReportsResponseDto,
} from './dto/report-response.dto';

@ApiTags('Article Reports')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArticleReportController {
  constructor(private readonly articleReportService: ArticleReportService) {}

  @ApiOperation({
    summary: 'Report an article for inappropriate content',
    description:
      'Users can report articles with custom reasons explaining why the content is inappropriate or problematic.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Article ID to report',
    example: 456,
  })
  @ApiBody({
    type: CreateArticleReportDto,
    description: 'Report details with optional reason',
    examples: {
      spam: {
        summary: 'Report as spam',
        value: { reason: 'spam' },
      },
      inappropriate: {
        summary: 'Report inappropriate content',
        value: { reason: 'inappropriate_content' },
      },
      without_reason: {
        summary: 'Report without specific reason',
        value: {},
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Article reported successfully',
    example: {
      statusCode: 201,
      message: 'Article reported successfully',
      data: {
        id: 123,
        articleId: 456,
        reason: 'spam',
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    examples: {
      duplicate_report: {
        summary: 'User already reported this article',
        value: {
          statusCode: 400,
          message: 'You have already reported this article',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article not found or inactive',
    example: {
      statusCode: 404,
      message: 'Article with ID 456 not found',
      error: 'Not Found',
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User has already reported this article',
    example: {
      statusCode: 409,
      message: 'You have already reported this article',
      error: 'Conflict',
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  })
  @Post(':id/report')
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.USER, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async reportArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Request() req: any,
    @Body() createReportDto: CreateArticleReportDto,
  ) {
    const userId = req.user.id;
    const report = await this.articleReportService.createReport(
      articleId,
      userId,
      createReportDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Article reported successfully',
      data: {
        id: report.id,
        articleId: report.articleId,
        reason: report.reason,
        createdAt: report.createdAt,
      },
    };
  }

  @Get(':id/reports/count')
  @ApiOperation({
    summary: 'Get report count for an article',
    description:
      'Get the total number of reports for a specific article. This endpoint is public for transparency.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Article ID to get report count for',
  })
  @ApiResponse({
    status: 200,
    description: 'Report count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            articleId: { type: 'number', example: 456 },
            reportCount: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  async getArticleReportCount(@Param('id', ParseIntPipe) articleId: number) {
    const reportCount =
      await this.articleReportService.countReportsByArticleId(articleId);

    return {
      statusCode: HttpStatus.OK,
      data: {
        articleId,
        reportCount: reportCount,
      },
    };
  }
}

@ApiTags('Admin - Report Management')
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@ApiBearerAuth()
@ApiSecurity('admin-access')
export class AdminReportController {
  constructor(private readonly articleReportService: ArticleReportService) {}

  /**
   * Get all reports (Admin only)
   */
  @Get()
  @ApiOperation({
    summary: 'Get all article reports',
    description:
      'Retrieve all article reports with pagination and filtering options. Admin access required.',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'status',
    enum: ['all', 'pending', 'resolved'],
    required: false,
    description: 'Filter by report status (default: all)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Reports retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            reports: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 123 },
                  articleId: { type: 'number', example: 456 },
                  userId: { type: 'number', example: 789 },
                  reason: { type: 'string', example: 'spam' },
                  createdAt: { type: 'string', format: 'date-time' },
                  article: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', example: 'Article Title' },
                      isActive: { type: 'boolean', example: true },
                    },
                  },
                  user: {
                    type: 'object',
                    properties: {
                      username: { type: 'string', example: 'reporter_user' },
                    },
                  },
                },
              },
            },
            total: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 },
            summary: {
              type: 'object',
              properties: {
                totalReports: { type: 'number', example: 50 },
                pendingReports: { type: 'number', example: 25 },
                resolvedReports: { type: 'number', example: 25 },
              },
            },
          },
        },
      },
    },
  })
  async getAllArticleReports(@Query() query: GetReportsQueryDto) {
    const result =
      await this.articleReportService.getAllReportsWithPagination(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Reports retrieved successfully',
      data: result,
    };
  }

  /**
   * Get reports for a specific article (Admin only)
   */
  @Get('article/:id')
  @ApiOperation({
    summary: 'Get reports for a specific article',
    description:
      'Retrieve all reports for a specific article. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Article ID to get reports for',
  })
  @ApiResponse({
    status: 200,
    description: 'Article reports retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Article reports retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            articleId: { type: 'number', example: 456 },
            reports: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 123 },
                  userId: { type: 'number', example: 789 },
                  reason: { type: 'string', example: 'spam' },
                  createdAt: { type: 'string', format: 'date-time' },
                  user: {
                    type: 'object',
                    properties: {
                      username: { type: 'string', example: 'reporter_user' },
                    },
                  },
                },
              },
            },
            totalReports: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Article with ID 456 not found' },
      },
    },
  })
  async getArticleReports(@Param('id', ParseIntPipe) articleId: number) {
    const reports =
      await this.articleReportService.findReportsByArticleId(articleId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Article reports retrieved successfully',
      data: {
        articleId,
        reports,
        totalReports: reports.length,
      },
    };
  }

  /**
   * Get reports by a specific user (Admin only)
   */
  @Get('user/:id')
  @ApiOperation({
    summary: 'Get reports by a specific user',
    description:
      'Retrieve all reports submitted by a specific user. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User ID to get reports for',
  })
  @ApiResponse({
    status: 200,
    description: 'User reports retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'User reports retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'number', example: 789 },
            reports: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 123 },
                  articleId: { type: 'number', example: 456 },
                  reason: { type: 'string', example: 'spam' },
                  createdAt: { type: 'string', format: 'date-time' },
                  article: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', example: 'Article Title' },
                      isActive: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
            totalReports: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  async getUserReports(@Param('id', ParseIntPipe) userId: number) {
    const reports = await this.articleReportService.findReportsByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'User reports retrieved successfully',
      data: {
        userId,
        reports,
        totalReports: reports.length,
      },
    };
  }
}
