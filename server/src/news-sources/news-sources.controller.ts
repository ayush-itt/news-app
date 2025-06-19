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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NewsSourcesService } from './news-sources.service';
import { UpdateNewsSourceDto, NewsSourceResponseDto } from './dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/roles.enum';

@ApiTags('News Sources')
@Controller('news-sources')
@Auth()
@Roles(RoleEnum.ADMIN)
@ApiBearerAuth()
export class NewsSourcesController {
  constructor(private readonly newsSourcesService: NewsSourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all news sources (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'News sources retrieved successfully',
    type: [NewsSourceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAll(): Promise<NewsSourceResponseDto[]> {
    const sources = await this.newsSourcesService.findAllNewsSources();
    return NewsSourceResponseDto.fromEntities(sources);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news source by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'News source ID' })
  @ApiResponse({
    status: 200,
    description: 'News source retrieved successfully',
    type: NewsSourceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'News source not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NewsSourceResponseDto> {
    const source = await this.newsSourcesService.findNewsSourceById(id);
    return NewsSourceResponseDto.fromEntity(source);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update news source name and API key (Admin only)' })
  @ApiParam({ name: 'id', description: 'News source ID' })
  @ApiResponse({
    status: 200,
    description: 'News source updated successfully',
    type: NewsSourceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'News source not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNewsSourceDto,
  ): Promise<NewsSourceResponseDto> {
    const source = await this.newsSourcesService.updateNewsSource(
      id,
      updateDto,
    );
    return NewsSourceResponseDto.fromEntity(source);
  }

  // Commented out endpoints for future use:

  // @Get('active')
  // @ApiOperation({ summary: 'Get only active news sources (Admin only)' })
  // async findActive(): Promise<NewsSourceResponseDto[]> {
  //   const sources = await this.newsSourcesService.findActiveNewsSources();
  //   return NewsSourceResponseDto.fromEntities(sources);
  // }

  // @Get('statistics')
  // @ApiOperation({ summary: 'Get news sources statistics (Admin only)' })
  // async getStatistics(): Promise<{
  //   total: number;
  //   active: number;
  //   inactive: number;
  //   error: number;
  // }> {
  //   return await this.newsSourcesService.getSourcesStatistics();
  // }

  // @Get(':id/health')
  // @ApiOperation({ summary: 'Check news source health (Admin only)' })
  // @ApiParam({ name: 'id', description: 'News source ID' })
  // async checkHealth(@Param('id', ParseIntPipe) id: number): Promise<{
  //   id: number;
  //   name: string;
  //   status: string;
  //   lastFetchAt: Date | null;
  //   lastError: string | null;
  //   isHealthy: boolean;
  // }> {
  //   return await this.newsSourcesService.checkSourceHealth(id);
  // }

  // @Post()
  // @ApiOperation({ summary: 'Create new news source (Admin only)' })
  // async create(
  //   @Body() createDto: CreateNewsSourceDto,
  // ): Promise<NewsSourceResponseDto> {
  //   const source = await this.newsSourcesService.createNewsSource(createDto);
  //   return NewsSourceResponseDto.fromEntity(source);
  // }

  // @Put(':id/toggle-active')
  // @ApiOperation({ summary: 'Toggle news source active status (Admin only)' })
  // @ApiParam({ name: 'id', description: 'News source ID' })
  // async toggleActive(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<NewsSourceResponseDto> {
  //   const source = await this.newsSourcesService.toggleSourceActive(id);
  //   return NewsSourceResponseDto.fromEntity(source);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({ summary: 'Delete news source (Admin only)' })
  // @ApiParam({ name: 'id', description: 'News source ID' })
  // @ApiResponse({
  //   status: 204,
  //   description: 'News source deleted successfully',
  // })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Forbidden - Admin access required',
  // })
  // @ApiResponse({ status: 404, description: 'News source not found' })
  // async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
  //   await this.newsSourcesService.deleteNewsSource(id);
  // }
}
