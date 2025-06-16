import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import {
  ArticleQueryDto,
  ArticleResponseDto,
  PaginatedArticleResponseDto,
} from './dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { PAGINATION } from '../common/constants/pagination.constants';

@ApiTags('Articles')
@Controller('articles')
@UseGuards()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // TODO: Temporarily disabled - Create article route
  // @Post()
  // @Auth()
  // @Roles(RoleEnum.ADMIN)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a new article' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Article created successfully',
  //   type: ArticleResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Article with this URL already exists',
  // })
  // async create(
  //   @Body() createArticleDto: CreateArticleDto,
  // ): Promise<ArticleResponseDto> {
  //   const article = await this.articlesService.createArticle(createArticleDto);
  //   return ArticleResponseDto.fromEntity(article);
  // }

  @Get()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all articles with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Articles retrieved successfully',
    type: PaginatedArticleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'categoryIds',
    required: false,
    type: [Number],
    description: 'Category IDs',
  })
  @ApiQuery({
    name: 'author',
    required: false,
    type: String,
    description: 'Article author',
  })
  @ApiQuery({
    name: 'source',
    required: false,
    type: String,
    description: 'Article source',
  })
  @ApiQuery({
    name: 'publishedAfter',
    required: false,
    type: String,
    description: 'Published after date (ISO string)',
  })
  @ApiQuery({
    name: 'publishedBefore',
    required: false,
    type: String,
    description: 'Published before date (ISO string)',
  })
  async findAll(
    @Query() query: ArticleQueryDto,
  ): Promise<PaginatedArticleResponseDto> {
    const result = await this.articlesService.findAllArticles(query);
    return PaginatedArticleResponseDto.fromPaginatedResult(result);
  }

  @Get('search')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search articles by term' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: PaginatedArticleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid search term' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async search(
    @Query('q') searchTerm: string,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = PAGINATION.DEFAULT_PAGE,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ): Promise<PaginatedArticleResponseDto> {
    const result = await this.articlesService.searchArticles(
      searchTerm,
      page,
      limit,
    );
    return PaginatedArticleResponseDto.fromPaginatedResult(result);
  }

  @Get('category/:categoryId')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get articles by category' })
  @ApiResponse({
    status: 200,
    description: 'Category articles retrieved successfully',
    type: PaginatedArticleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'categoryId', type: Number, description: 'Category ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = PAGINATION.DEFAULT_PAGE,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ): Promise<PaginatedArticleResponseDto> {
    const result = await this.articlesService.findArticlesByCategory(
      categoryId,
      page,
      limit,
    );
    return PaginatedArticleResponseDto.fromPaginatedResult(result);
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({
    status: 200,
    description: 'Article retrieved successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ArticleResponseDto> {
    const article = await this.articlesService.findArticleById(id);
    return ArticleResponseDto.fromEntity(article);
  }

  // TODO: Temporarily disabled - Update article route
  // @Patch(':id')
  // @Auth()
  // @Roles(RoleEnum.ADMIN)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Update an article' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Article updated successfully',
  //   type: ArticleResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // @ApiResponse({ status: 404, description: 'Article not found' })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Another article with this URL already exists',
  // })
  // @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateArticleDto: UpdateArticleDto,
  // ): Promise<ArticleResponseDto> {
  //   const article = await this.articlesService.updateArticle(
  //     id,
  //     updateArticleDto,
  //   );
  //   return ArticleResponseDto.fromEntity(article);
  // }

  // TODO: Temporarily disabled - Delete article route
  // @Delete(':id')
  // @Auth()
  // @Roles(RoleEnum.ADMIN)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Delete an article' })
  // @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // @ApiResponse({ status: 404, description: 'Article not found' })
  // @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  // async remove(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<{ message: string }> {
  //   await this.articlesService.deleteArticle(id);
  //   return { message: 'Article deleted successfully' };
  // }
}
