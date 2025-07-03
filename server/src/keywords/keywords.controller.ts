import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { KeywordsService } from './keywords.service';
import { CreateKeywordDto, UpdateKeywordDto, KeywordResponseDto } from './dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';
import { Keyword } from '../database/entities/keyword.entity';

@ApiTags('Keywords')
@Controller('keywords')
@Auth()
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new keyword for the authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Keyword created successfully',
    type: KeywordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Keyword already exists for this category',
  })
  async create(
    @Body() createDto: CreateKeywordDto,
    @GetUser() user: User,
  ): Promise<KeywordResponseDto> {
    const keyword = await this.keywordsService.createKeyword(
      user.id,
      createDto,
    );
    return KeywordResponseDto.fromEntity(keyword);
  }

  @Get()
  @ApiOperation({ summary: 'Get user keywords with optional category filter' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Keywords retrieved successfully',
    type: [KeywordResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Category not found (if categoryId provided)',
  })
  async findUserKeywords(
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
    @GetUser() user?: User,
  ): Promise<KeywordResponseDto[]> {
    let keywords: Keyword[];

    if (categoryId) {
      keywords = await this.keywordsService.findUserKeywordsByCategory(
        user.id,
        categoryId,
      );
    } else {
      keywords = await this.keywordsService.findUserKeywords(user.id);
    }

    return KeywordResponseDto.fromEntities(keywords);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get keyword by ID' })
  @ApiParam({ name: 'id', description: 'Keyword ID' })
  @ApiResponse({
    status: 200,
    description: 'Keyword retrieved successfully',
    type: KeywordResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Keyword not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<KeywordResponseDto> {
    const keyword = await this.keywordsService.findKeywordById(id);
    return KeywordResponseDto.fromEntity(keyword);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update keyword (only own keywords)' })
  @ApiParam({ name: 'id', description: 'Keyword ID' })
  @ApiResponse({
    status: 200,
    description: 'Keyword updated successfully',
    type: KeywordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own keywords',
  })
  @ApiResponse({ status: 404, description: 'Keyword not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Keyword already exists for this category',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKeywordDto,
    @GetUser() user: User,
  ): Promise<KeywordResponseDto> {
    const keyword = await this.keywordsService.updateKeyword(
      id,
      user.id,
      updateDto,
    );
    return KeywordResponseDto.fromEntity(keyword);
  }

  @Put(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle keyword active status (only own keywords)' })
  @ApiParam({ name: 'id', description: 'Keyword ID' })
  @ApiResponse({
    status: 200,
    description: 'Keyword status toggled successfully',
    type: KeywordResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only modify own keywords',
  })
  @ApiResponse({ status: 404, description: 'Keyword not found' })
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<KeywordResponseDto> {
    const keyword = await this.keywordsService.toggleKeywordActive(id, user.id);
    return KeywordResponseDto.fromEntity(keyword);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete keyword (only own keywords)' })
  @ApiParam({ name: 'id', description: 'Keyword ID' })
  @ApiResponse({
    status: 204,
    description: 'Keyword deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own keywords',
  })
  @ApiResponse({ status: 404, description: 'Keyword not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    await this.keywordsService.deleteKeyword(id, user.id);
  }

  // Admin-only endpoints would go here if needed
}
